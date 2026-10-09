# Node 迁移接口契约基线

2026-09-21，依据当前 Java Controller / DTO / Service / Repository 与 Python API / schemas / SSE / tests 静态核对。本文是实现和验收清单，不表示已运行测试或已完成 Node 迁移。所有路径带 `/api`。

## 1. 通用响应与认证

- Java 业务成功统一 **HTTP 200**（包括 POST、DELETE），JSON `{code:200,message:"success",data,traceId:null,timestamp}`；无返回值时 `data:null`，不能用 Nest 默认 POST 201 / DELETE 204 替换。
- 业务错误 HTTP 与 `code` 一致：参数 400、登录失败/无效 JWT 401、非 ADMIN 403、记录不存在/不属于本人 404、重复数据/版本冲突 409；未知路由 404、方法 405、媒体类型 415、内部错误 500。错误保留同一包装，`traceId` 使用请求追踪值；DTO 字段校验 `data` 为字段→错误消息映射，其他一般为 null。
- 公开 GET 酒店、POI，公开 POST 注册/登录；个人数据必须从已验证 JWT subject 取得用户 ID。管理员接口要求 ADMIN。JWT 使用 HS256、issuer `shanghai-travel-backend`、字符串 subject、`iat/exp/username/roles`；roles 是数组。跨后端复用 token 还需保持签名配置及校验规则。
- **AI 不是业务包装响应**：成功裸 JSON，失败 `{detail:...}`；参数结构错误默认 422，其中 detail 可以是数组。SSE 是文本事件流。Node 全局 interceptor/filter 必须区分这些路由。

## 2. 路由与输入输出

下表除 AI 创建外，成功均为 200；`T` 表示业务包装的 data。

| 路由 | 输入 | 返回/特殊行为 |
| --- | --- | --- |
| POST `/users/register`, `/users/login` | `{username,password}`，原始长度分别 2–50、6–64，非空白 | T=`{accessToken,tokenType:"Bearer",expiresAt,user:{userId,username,role}}`；注册角色 USER；用户名 trim；重复账号 409，错误账号/密码统一 401 |
| GET `/users/me` | Bearer | T=`{userId,username,role}` |
| GET `/hotels`, `/hotels/recommended` | 无 | T=酒店数组，无分页；recommended 仅 true |
| GET `/hotels/search` | 可选 keyword≤100、area≤50、starLevel 整数 1–5、priceLevel 枚举 | T=同酒店数组；名称/描述 LIKE，area 和星级精确匹配；全空白 keyword/area 忽略，非空文本不自动 trim |
| GET `/hotels/:id` | 正整数 id | T=酒店详情（额外 rooms/reviews）；不存在 404 |
| GET `/pois`, `/admin/pois` | keyword≤100、type、area≤50、page≥0 默认0、size 1–50 默认20 | T=`{items,page,size,totalElements,totalPages}`；公开只 active，管理员含下架；排序 recommended DESC、rating DESC、id ASC |
| GET `/pois/:id` | 正整数 id | T=POI；下架也返回404 |
| POST `/admin/pois` | PoiUpsert DTO | T=POI；version 不作为创建前提 |
| PUT `/admin/pois/:id` | 完整 PoiUpsert DTO，**body.version 必填** | T=POI；缺 version 400，旧 version 409；不读取 If-Match |
| DELETE `/admin/pois/:id` | If-Match | T=POI，软下架保留引用；旧版本409 |
| GET `/favorites` | Bearer | T=`[{id,hotelId,hotel,createdAt}]`，时间降序 |
| POST `/favorites` | `{hotelId:正整数}` | T=收藏；重复409，未知酒店404 |
| DELETE `/favorites` | query hotelId 正整数 | T=null；没有收藏也成功 |
| GET `/favorites/check` | query hotelId 正整数 | T=boolean |
| GET/POST/DELETE `/history` | POST body `{hotelId}` | GET 数组 / POST 单条 `{id,hotelId,hotel,visitedAt}` / DELETE null；按时间降序，每用户同酒店更新为最新，最多20条 |
| POST `/bookings` | Idempotency-Key + CreateBooking DTO | T=Booking；同用户同 key 同内容重放，不同内容409 |
| GET `/bookings`, `/bookings/:id` | Bearer，详情正整数 id | T=数组/Booking；仅本人，createdAt降序 |
| POST `/bookings/:id/cancel` | If-Match | T=Booking；已取消直接返回，即使版本旧；否则版本不符409 |
| GET/POST `/itineraries` | POST `{title,startDate,endDate}` | T=数组/行程；列表 items 固定 []，updatedAt降序 |
| GET/PUT/DELETE `/itineraries/:id` | PUT 同创建 body；PUT/DELETE If-Match | T=详细行程/详细行程/null；仅本人；冲突409 |
| POST `/itineraries/:id/items` | If-Match + Item DTO | T=完整父行程；校验及增加父版本 |
| PUT/DELETE `/itineraries/:id/items/:itemId` | If-Match，PUT Item DTO | T=完整父行程；版本始终属于父行程；不存在项目404 |
| GET `/health`（Python） | 无 | 裸 `{status:"ok"}` |
| POST `/agent/sessions` | `{initial_message}`，trim 后1–500字符，拒绝额外字段 | **201**；顶层 Session 字段 + `{session:Session,run_id,stream_url}`，顶层重复字段为兼容契约 |
| GET `/agent/sessions/:id` | 会话字符串 ID | Session顶层 + `{session,latest_run_status,latest_plan}`；不存在404 |
| POST `/agent/sessions/:id/answers` | `{question_id,value,expected_version}`；version 严格非负整数 | 裸 Session；错题/答案不合规则/状态或版本冲突409，schema错误422 |
| POST `/agent/sessions/:id/cancel` | 无 body要求 | `{session_id,run_id,status}`；重复取消无新终态事件；已完成返回已有状态 |
| GET `/agent/sessions/:id/events` | query stream_token 长20–200；可选 Last-Event-ID | text/event-stream；非法游标400，缺 token422，错误/过期凭证或未知会话统一403 |

## 3. 序列化与边界

- 酒店字段保留混合命名：`img_url/banner_url/starimg_url/tag`；其余 `starLevel/priceLevel/reviewCount/reviewDesc` 等 camelCase。酒店 summary=`id,name,img_url,transport,price,rating,tag`。详情 rooms/reviews、tag 缺失转 []。
- **酒店 priceLevel 不是直接匹配数据库 priceLevel 文本**：low-low=[0,150)、low=[150,300)、mid=[300,450)、high=[450,600)、luxury=[600,+∞)。未知值及空字符串不符合 Controller Pattern，应400。
- POI 字段：`id,name,type,area,address,latitude,longitude,openingHours,ticketPrice,averagePrice,suggestedDurationMinutes,description,imageUrl,rating,recommended,active,tags,version`。type=ATTRACTION/RESTAURANT；可选文本空白归 null，tags trim 后保序去重；价格≤8位整数/2位小数、rating 0–5一位小数，坐标范围分别±90/±180，时长1–1440，tags最多10。
- Booking 输入：hotelId>0、checkIn/checkOut、guestCount整数1–10、contactName非空≤80、contactPhone匹配 `^[0-9+() -]{6,30}$`。入住必须晚于**上海当天**；退房晚于入住；总价=酒店价×晚数，不乘人数。报价≤0/缺失409。响应含 id/version/hotelId/hotelName/hotelImage、请求字段、nightlyPrice/totalPrice/status/createdAt/cancelledAt；取消前 cancelledAt=null。
- Idempotency-Key 是必填、1–64字符且仅 `[A-Za-z0-9._:-]`。**Service trim 不代表 HTTP 接受前后空格**：Controller Pattern 会拒绝。日期校验发生于重放前，跨天已过期的同 key 请求不保证重放成功。
- If-Match 接受 `4`、`"4"`、`W/"4"` 及外围空白，接受0和前导零；拒绝负数、`*`、列表、未引用 `W/4`、溢出 Java Long。缺头和无效头应400；Node 不可用 parseInt 部分解析，也不可直接用不安全 JS number 表示大整数。
- 手动行程支持1–31天（含首尾），并非 AI 的1–7天。缩小日期范围不能排除已有项目；dayNumber=距startDate天数+1。Item=`itemDate,type,startTime?,endTime?,title,location?,notes?,sortOrder,hotelId?,poiId?`；时间同时填写或同时 null，结束晚于开始；sortOrder 0–10000；酒店和 POI 互斥，hotelId只给HOTEL，poiId只给匹配的ATTRACTION/RESTAURANT且地点仍启用。HOTEL/POI 类型本身不强制关联 ID。
- 日期 `YYYY-MM-DD`，Java LocalDateTime 不带时区后缀，LocalTime 为本地时间字符串（保留秒/小数秒能力，不统一改成 UTC）；业务 clock=Asia/Shanghai。`timestamp/expiresAt` 为 UTC Instant，history.visitedAt 为毫秒整数；AI created_at/updated_at 明确UTC。精确小数计算后显式序列化为旧 API 的 JSON number，避免 Prisma Decimal 默认变字符串。null 字段不要默默省略。
- Session=`id,status,requirements,current_question,version,question,created_at,updated_at`；question可null，否则`{id,title,options,multiple}`。需求 days严格整数1–7、travelers1–20、budget有限正数≤100000000、styles白名单且保序去重；默认目的地上海、人数1。AI计划保留 snake_case（poi_id/start_time/end_time/estimated_cost/total_estimated_cost）。

## 4. SSE 与 Node 新增行为

原 Python 会话 API 没有用户权限。Node 增加认证、归属检查以及重新签发 stream token，是有意的安全/恢复能力变更；不能宣称与旧版鉴权完全相同。

SSE 格式 `id: 序号\nevent: 名称\ndata: JSON\n\n`，heartbeat 无 id，payload=`{status:"ok"}`。恢复仅重放 sequence>Last-Event-ID；token过期连接结束，Cache-Control=no-cache、X-Accel-Buffering=no。凭证只存 hash，日志不得记录原 token。

终态事件必须成对且按序持久化：`plan_ready → done(COMPLETED)`、`error → done(FAILED)`、`cancelled → done(CANCELLED)`；一次 run 只有一个终态、一个 done，取消胜出后模型迟到结果不得入库。Python repository 使用 UPDATE…RETURNING 分配事件序号，**MySQL 不直接照搬**：在事务内按一致锁顺序锁 session/run 行，分配递增序号并写事件/终态，唯一约束 `(run_id,sequence)`，终态条件更新防止双写。锁顺序必须覆盖 answer/cancel/worker 所有路径。

## 5. 验证用例来源及缺口

静态读取的现有测试可移植，不能把“存在测试”当“本轮已通过”：

| 来源 | 已有测试覆盖 | Node 需补充 |
| --- | --- | --- |
| Java UserControllerTest / UserServiceImplTest / JwtTokenServiceTest / SecurityFilterChainIntegrationTest | 包装、字段错误、重名409、用户名trim、BCrypt、JWT错误签名/过期/缺exp/非法subject、ADMIN/CORS | 原 BCrypt样本跨语言、旧 JWT 兼容、完整 HTTP 缺头及多头 |
| HotelControllerTest / PoiControllerTest / PoiServiceImplTest | 星级/价格枚举、摘要字段、分页、size限制、POI版本/下架 | 五个价格边界、空priceLevel、decimal/null/日期响应快照、body.version而非header |
| BookingServiceImplTest / FlywayJpaMySqlIntegrationTest | 幂等内容比较/取消版本；真实MySQL同key并发唯一记录 | 原始 HTTP key空白及超长、跨天重放、取消重复旧版本、事务回滚 |
| ItineraryServiceImplTest / VersionHeaderParserTest / VersionHeaderControllerTest | 日期时间/归属/父版本/地点关联及三种头格式 | 31/32天边界、并发项目修改、数据库精度下updatedAt强制推进、关联地点下架后读取 |
| BrowseHistoryServiceImplTest / AuthenticatedUserBoundaryTest | 时钟与JWT身份来源 | 21次浏览裁剪、并发同酒店去重、收藏数据库唯一冲突 |
| Python test_planning_sessions.py | 严格version/答案类型/额外字段、追问顺序、并发答案、UTC | “12天/21人”整数字词边界、用户越权、刷新重新签发token |
| Python test_sse.py / test_worker_planners.py / test_planner.py | 回放/凭证/心跳、取消及终态竞争、模型错误脱敏/幻觉地点/预算重叠校验 | MySQL行锁与事件序号并发、重启恢复、真实HTTP断连、模型超时与取消、保存AI行程的事务幂等 |

源码依据：`travel-backend/src/main/java/com/shanghai/travelbackend/{controller,dto,service/impl,http,security,exception,repository}`；测试对应 `src/test/java/com/shanghai/travelbackend`。Python 对照 `../travel-agent-python/backend/app/{api,schemas,service,repository,sse,worker}.py` 和 `backend/tests`。实施时保存完整请求/响应 fixture，动态 token/traceId/timestamp 仅校验类型与格式，不做固定值比较。
