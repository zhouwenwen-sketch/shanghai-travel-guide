# 首页访问埋点系统实施方案

## 目标与统计口径

- **PV**：首次打开、刷新或从其他页面返回首页，各计一次；首页内部 query/hash 变化不重复计数。
- **UV**：按浏览器持久化的匿名 `visitorId` 去重。
- **Session**：按标签页生命周期内的 `sessionId` 去重；关闭标签页后重新打开产生新会话。
- 上报失败不得影响首页；接口超时重试依靠 `eventId` 保证幂等。
- 不采集 IP、User-Agent、账号、搜索词等个人或业务内容。
- 服务器接收时间为唯一统计时间，按 `Asia/Shanghai` 生成日期；不相信客户端时间。

## Phase 0：已确认的项目接口与模式

- 前端请求统一使用 `src/api/index.ts` 的 `api.post<T, D>()` 与 `api.get<T>()`，响应由现有拦截器解包。
- 首页路由是 `src/router/index.ts` 中的 `name: 'home'`；路由守卫之后可注册一次 `router.afterEach`，不得同时在首页组件 `onMounted` 上报。
- 管理端页面沿用 `/admin/pois` 的 `requiresAuth + requiresAdmin` 路由元数据和现有守卫。
- 后端成功响应使用 `server/src/common/api-result.ts` 的 `ok()`；全局 ValidationPipe 已开启白名单、未知字段拒绝和类型转换。
- 管理员鉴权沿用 `AdminPoisController` 的 `Bearer -> UsersService.requireUser() -> role === 'ADMIN'` 语义。
- 数据时间通过 `ClockService.now()` 和 `todayInShanghai()` 获取。需要将 ClockService 放入可导出的 CommonModule，不能假设 AppModule provider 自动对功能模块可见。

## Phase 1：数据库与后端写入

1. 在 `server/prisma/schema.prisma` 增加 `home_page_views`：
   - `id BigInt` 自增主键。
   - `event_id String @unique`：请求幂等键。
   - `visitor_id String`、`session_id String`：UUID v4。
   - `visit_date DateTime @db.Date`：上海自然日。
   - `occurred_at DateTime @db.DateTime(6)`：服务端接收时间。
   - 索引 `[visit_date]`、`[visit_date, visitor_id]`、`[visit_date, session_id]`。
2. 新建 `AnalyticsModule/Controller/Service`，提供：
   - `POST /api/analytics/home-view`
   - 请求体 `{ eventId, visitorId, sessionId }`，三个字段都必须是 UUID v4，不接受额外字段。
   - 使用 `event_id` 唯一约束和 `upsert/create + duplicate handling` 实现幂等；重复上报仍返回成功，但不增加 PV。
3. 一次操作只调用一次 `clock.now()`，再由同一时间计算上海日期，避免跨午夜时字段不一致。

### Phase 1 验证

- 正常匿名上报新增一条；相同 `eventId` 连续或并发上报只保留一条。
- 不同 `eventId`、相同 visitor/session 正常增加 PV，但 UV/Session 去重。
- 空值、非 UUID、未知字段返回 400；数据库异常使用统一错误结构。
- 虚拟时钟覆盖上海 23:59:59、00:00:00 边界，业务逻辑不直接使用 `new Date()`。

## Phase 2：管理员统计接口

1. 增加 `GET /api/admin/analytics/home?start=YYYY-MM-DD&end=YYYY-MM-DD`，仅 ADMIN 可访问。
2. 日期范围包含首尾日期，最长 90 天；默认最近 7 天。非法日期、倒序、超范围返回 400。
3. 返回：
   ```json
   {
     "summary": { "pv": 0, "uv": 0, "sessions": 0 },
     "daily": [{ "date": "2026-09-26", "pv": 0, "uv": 0, "sessions": 0 }]
   }
   ```
4. 查询按 `visit_date` 范围过滤，PV 使用 `COUNT(*)`，UV/Session 使用 `COUNT(DISTINCT ...)`；缺失日期由服务层补零，返回日期升序。

### Phase 2 验证

- 匿名和普通用户访问统计接口分别返回 401/403，管理员返回 200。
- 空数据库、单日、跨月、闰日、90 天边界、无数据日期补零正确。
- 重复事件不影响任何汇总；返回数字是安全整数。

## Phase 3：前端上报与竞态处理

1. 新增 `src/utils/analytics-session.ts`：
   - `visitorId` 存入 `localStorage`。
   - `sessionId` 存入 `sessionStorage`。
   - 每次有效首页访问生成新的 `eventId = crypto.randomUUID()`。
   - 存储中已有非法值时自动替换，不上传原值。
2. 新增 `src/api/analytics.ts`，封装写入和统计接口。
3. 在 `router.afterEach` 中仅当导航成功、`to.name === 'home'` 且 `from.name !== 'home'` 时异步上报。捕获错误且不弹窗、不阻塞导航。
4. 不在 Axios 拦截器或 `index.vue` 中再次上报，避免递归或双计数。

### Phase 3 验证

- 首次打开、刷新、搜索页返回首页分别增加一次；首页 query 变化不增加。
- 连续导航、多标签页、后退、网络失败和服务端已写入但响应丢失时统计符合口径。
- local/session storage 不可用时退化为内存 ID，首页仍正常展示。

## Phase 4：管理员统计页面

1. 新增 `/admin/analytics` 懒加载路由，设置 `requiresAuth` 与 `requiresAdmin`。
2. 在管理员导航中增加“访问统计”入口。
3. 页面提供今日 PV/UV/Session 卡片、7/30 天切换、每日趋势图或表格、加载/空数据/错误重试状态。
4. 数据保存在页面局部状态，每次进入重新请求；不持久化到 Pinia，避免展示过期统计。

### Phase 4 验证

- 普通用户不能进入；管理员刷新和切换日期范围可恢复并重新查询。
- 请求失败不清空上一份有效数据；快速切换日期时取消旧请求或拒绝过期响应。
- 0、极大计数和连续 90 天在小屏幕下均不溢出。

## Phase 5：完整验证与文档

- 运行 Prisma 建表、生成 Client、后端单元/接口测试、前端纯函数测试、两端类型检查和生产构建。
- 用固定虚拟时间写入可预测样本，逐项核对数据库行数、PV、UV、Session 和每日趋势。
- README 写明统计口径、匿名标识、上海时区、管理员入口和数据清理方式。
- 不把开发模式 HMR 刷新产生的访问量作为生产数据；简历数字必须来自生产构建或固定压测流程。

## 后续扩展

- 数据量达到百万级后，再增加每日聚合表和定时汇总；当前规模优先保持原始事件可核对。
- 可在同一事件模型上扩展搜索提交、筛选点击、酒店详情点击和预订转化漏斗，但每种事件先定义参数白名单，禁止上传任意 JSON。
