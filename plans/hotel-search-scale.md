# 万级酒店数据检索优化方案（待实施）

## 当前进度（2026-09-23）

- Phase 1 已完成：独立 `travel_bench` 安全建表，固定种子生成 1 万/5 万条数据并验证重复执行幂等，旧接口基线已保存。
- Phase 2 已完成：分页搜索接口、严格参数校验、稳定排序、同事务列表/计数及测试。
- Phase 3 已完成：前端服务端分页、URL 状态、连续请求取消与过期响应保护，酒店/POI 独立失败处理。
- Phase 3 收口已完成：单个标签关闭只移除对应条件；URL 数组参数会去空白、去重和限长；翻页/排序不再重复请求 POI；酒店与 POI 使用独立加载、空态和错误状态。
- Phase 4 已完成：保存索引前后 `EXPLAIN ANALYZE`，依据执行计划加入 `(area, star_level, id)` 与 `(price, id)` 两个索引；保留模糊关键词和深分页的限制说明。
- Phase 5 已完成：前端 13 项测试、后端 36 项测试、两端类型检查、两端生产构建和 1 万/5 万条基准均通过。5 万条全量场景 p95 从 1706.6 ms 降至 20.8 ms，响应体从 17393.2 KB 降至 8.5 KB；完整结果见 `server/BENCHMARK_RESULTS.md`。

目标：在独立测试库中用同一批 1 万、5 万条酒店数据，对比现有「全量返回 + 前端筛选/分页」与「服务端筛选/排序/分页」的接口响应、传输量和页面交互。不得把计划中的性能收益写成已完成结果。

## Phase 0：代码与文档基线

- 现状：`server/src/hotels/hotels.controller.ts` 的 `GET /api/hotels/search` 接收单值 `keyword/area/starLevel/minPrice/maxPrice`；`server/src/hotels/hotels.service.ts` 的 `search()` 执行未限制条数的 `findMany()`。`src/api/hotels.ts` 返回 `Promise<Hotel[]>`；`src/views/search-result.vue` 在浏览器内过滤全数组并用 `slice()` 切页。`server/prisma/schema.prisma` 的 `hotels` 尚无搜索用索引。
- 仿照现有 `src/types/index.ts` 的 `PageResponse<T>`（0 起始 `page`、`size`、`totalElements`、`totalPages`）和 `src/api/pois.ts` 的分页调用约定，不另造返回结构。
- 允许使用的 API：Prisma `findMany({ where, skip, take, orderBy })`、`count({ where })`，见 [Prisma Pagination](https://www.prisma.io/docs/orm/v7/prisma-client/queries/pagination)；MySQL `EXPLAIN ANALYZE`，见 [MySQL EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/explain.html)。Axios `api.get(url, { params, signal })` 已在 `src/api/index.ts` 支持配置透传。
- 边界：`skip/take` 适合页面跳转；深页码性能须实测。普通 B-tree 索引不能被承诺加速所有 `contains` 模糊搜索，先看执行计划。暂不引入虚拟列表：每页只渲染 6/12/24 项。

## Phase 1：可重复基线与测试数据

安全执行说明：在 `my-project/server` 复制 `.env.bench.example` 为 `.env.bench.local`，填写独立的 `BENCH_DATABASE_URL`，目标必须是本机 `travel_bench`。运行 `npm run db:push:bench` 建表，再运行 `npm run seed:hotels:bench -- --count 10000` 或 `50000`。不要使用通用 `npm run db:push` 给基准库建表。基线 API 必须以 `NODE_ENV=benchmark` 且 `DATABASE_NAME=travel_bench` 启动；`npm run bench:hotels:legacy` 会通过实际数据库身份与保留 ID 数核验，验证失败即停止。`BENCH_COUNT` 与生成条数保持一致。堆指标为每次请求后采样值的最大值，不是连续监控的绝对峰值。

1. 新建独立 `travel_bench` 数据库及仅本地使用的配置；不对 `travel_node` 现有用户数据做批量写入。
2. 增加 `server/src/scripts/seed-hotels-bench.ts`：固定随机种子，分批 `createMany`，产生 1 万与 5 万条可区分的酒店；区域、星级、价格、推荐标记按预设分布生成，图片复用现有小图，不生成海量素材；记录种子、数量与分布。脚本仅允许在测试数据库执行，重复执行不会叠加同一批数据。
3. 在旧代码上分别测无条件搜索、区域+星级、价格区间、关键词搜索，记录每组至少 5 次暖机后 20 次请求的 p50/p95、响应 KB、Node 堆内存峰值；浏览器记录搜索页首次显示、筛选响应和分页响应。保存代码版本、MySQL 版本、数据量和机器环境。5 万条若使旧接口超时，记录超时而不强行放宽生产超时。
4. 验证：重复运行脚本数量不变；分布、样例图片、酒店详情、预订引用均正确。

## Phase 2：新分页接口与服务端查询

1. 在 `server/src/hotels/hotels.controller.ts` 增加 `GET /api/hotels/search/paged`，保持旧 `/search` 暂时可用以便对照；定义严格 DTO：`keyword?`、`areas?`、`starLevels?`、`priceBands?`、`page=0`、`size=6`、`sort=idAsc|priceAsc|priceDesc|ratingDesc`。`size` 只允许 6/12/24，`page` 为非负安全整数；未知排序、非法数字、超长关键字返回 400，不静默忽略。
2. 在 `server/src/hotels/hotels.service.ts` 让列表与 `count` 共用同一个 `where`；同一组内 OR、不同组间 AND。排序加 `id` 作为稳定次序；对价格/评分空值规定位置。用 `skip=page*size` 和 `take=size` 仅取当前页，使用列表所需字段 `select`，详情仍走 `GET /:id`。返回现有 `PageResponse<HotelListItem>` 契约。
3. 先统一筛选语义：`areas` 对应数据库真实行政区；当前首页“热门/景点”词条另归 `tags`，不能直接当 `area`。价格按钮按数值区间定义边界（例如 `<150`、`[150,300)`），避免现有 `low-low` 与数据库 `price_level` 不一致。
4. 验证：空结果、首页/末页/越界页、边界价格、重复价格/评分稳定排序、多选 OR/AND、重复请求、非法参数、空值、`page*size` 溢出；旧酒店详情和预订不受影响。

## Phase 3：前端迁移与请求竞态

1. 在 `src/types/index.ts` 增加 `HotelListItem` 与 `HotelSearchQuery`；在 `src/api/hotels.ts` 增加 `searchHotelsPaged(query, signal): Promise<PageResponse<HotelListItem>>`，调用新接口。保留详情类型 `Hotel`。
2. 在 `src/views/search-result.vue` 删除 `rawResults.filter()` 与 `slice()`；每次关键词、筛选、页码、每页条数、排序变化都向服务端请求。总数使用 `totalElements`，翻页按 UI 的 1 起始页码转换为 API 的 0 起始页码。筛选变化回到第一页；页码等状态同步 URL，刷新/后退可复现。
3. 旧请求通过 `AbortController` 取消，并用递增请求序号防止无法及时取消的旧响应覆盖新结果。酒店与 POI 请求分别处理错误，避免其中一个失败让另一个结果消失。保持加载、空结果、错误重试展示。
4. 验证：快速连续改关键词/筛选、连续翻页、后退/刷新、末页删除式数据变化、网络失败重试；确保没有重复/漏项和旧结果闪回。

## Phase 4：索引与查询优化

1. 在相同测试数据上对最常见查询运行 `EXPLAIN ANALYZE`。依据过滤和排序组合，先试少量候选索引，例如 `(area, star_level, price, id)`；索引顺序以执行计划为准，注意复合索引左前缀规则，见 [MySQL Multiple-Column Indexes](https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html)。
2. 对 `name contains` 单独测量；若它成为主要瓶颈，再评估可接受的前缀匹配或中文全文检索方案，不把一般 B-tree 索引当作模糊搜索的直接解法。
3. 记录索引前后 p50/p95、扫描行数、索引空间与写入代价。若深页码确实变慢，再为“加载更多”另设计基于稳定排序键的游标接口；现有页码跳转不盲目改成游标。

## Phase 5：收口验证与简历数据

- 后端单元/集成测试、前端类型检查、构建、搜索正常业务流程和多次连续操作均通过；新旧接口契约逐项核对。清点前端调用后，旧全量 `/search` 要么移除，要么明确限制与标注弃用，不能让它继续作为大数据场景的入口。
- 在同数据、同环境、同请求集、同缓存策略下重新跑 Phase 1 指标，报告 p50/p95 和传输量的前后值及百分比；明确区分“搜索页指标”和“首页 FCP/LCP”。只有实测稳定后才写入简历。
