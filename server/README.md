# 上海旅游攻略平台 Node 服务端

这是当前前端默认连接的 NestJS 服务；原 Java 实现保留在 `../travel-backend/`。

## 本地启动

1. 在 MySQL 创建空数据库 `travel_node`，复制 `.env.example` 为 `.env.local`，填写连接和至少 32 字节的 `JWT_SECRET`。
2. 执行 `npm ci`、`npm run db:setup`、`npm run build`。`db:setup` 会依据 Prisma Schema 创建空库表结构，并写入可展示的酒店和 POI 演示数据；当前种子脚本包含酒店恢复逻辑，可能修改已有酒店；仅对新建演示库执行完整初始化，已有库请先备份并按需同步结构。
3. 执行 `npm run start`，默认地址为 `http://127.0.0.1:8082`。

当前已实现：`GET /health`、`POST /api/users/register`、`POST /api/users/login`、`GET /api/users/me`；酒店的列表、推荐、详情和搜索接口；景点的分页查询与详情接口；以及收藏、浏览历史的查询和写入接口。

酒店搜索页使用 `GET /api/hotels/search/paged`：支持 `keyword`、逗号分隔的 `areas/starLevels/priceBands`、0 起始 `page`、`size=6|12|24` 及 `sort=idAsc|priceAsc|priceDesc|ratingDesc`，返回 `{items,page,size,totalElements,totalPages}`。旧 `/api/hotels/search` 暂时保留，仅用于优化前基线对照，不应再作为大数据列表入口。

万级测试数据、旧/新接口基准和执行计划采集见 [BENCHMARK.md](./BENCHMARK.md)，本机实测结果见 [BENCHMARK_RESULTS.md](./BENCHMARK_RESULTS.md)。测试脚本只接受本机 `travel_bench`，不得对日常数据库执行。

订单接口已提供创建、列表、详情、取消：创建必须附带 `Idempotency-Key`，取消必须附带 `If-Match`。日期按照上海时区校验，`checkIn` 必须晚于当天，`checkOut` 必须晚于 `checkIn`。

开发阶段使用独立 MySQL 数据库。生产切换前需要按 `../plans/nodejs-migration.md` 的基线、迁移、双跑和回滚步骤执行，不要直接覆盖原数据库。

当前开发环境采用 `prisma db push` 同步 Schema（`npm run db:push`），尚未建立完整的空库迁移链（已有访问统计增量 SQL）。它适合本项目的本地空库和开发库；部署到已有数据的生产数据库前，必须先改为经过审查、可回滚的迁移脚本，并备份和演练，不能直接执行 `db push`。
