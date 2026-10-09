# 上海旅游攻略平台

面向赴沪游客的旅游攻略平台，基于 Vue 3、TypeScript 和 NestJS 构建，提供酒店检索、旅游地点浏览、收藏、预订记录和手动行程编排。项目围绕首屏交互和酒店查询完成性能优化，并实现匿名首页访问统计，支持管理端查看 PV、UV、Session 和每日趋势。

当前前端默认连接 `server/` 中的 NestJS 服务。`travel-backend/` 保留原 Spring Boot 实现，迁移背景见 [Node.js 迁移计划](./plans/nodejs-migration.md)。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Vue 3、TypeScript、Vite 8 |
| 状态与路由 | Pinia、Vue Router（Hash 路由） |
| UI 与请求 | Element Plus、Axios |
| 后端 | NestJS 11、TypeScript、class-validator |
| 数据库 | MySQL、Prisma 7、MariaDB 驱动适配器 |
| 认证 | Bearer JWT、BCrypt、USER / ADMIN 角色 |
| 测试 | 前端 Node.js Test Runner；后端 Jest、Supertest |

## 主要功能

- **酒店检索**：推荐列表、关键词搜索、区域/星级/价格组合筛选、稳定排序及服务端分页；查看酒店、房型、点评和设施信息。
- **旅游内容**：景点、美食、商圈的分页检索与详情；统一搜索展示酒店和 POI，提供坐标示意图。
- **用户功能**：注册登录、个人中心、酒店收藏、浏览历史，以及登录守卫和过期会话清理。
- **预订记录**：创建、查看和取消演示预订；创建使用幂等键，取消使用版本校验。
- **行程编排**：创建、编辑和删除多日行程，手动安排酒店、景点、餐厅、活动及备注，可关联酒店或 POI，并在前端检查日期范围和时间冲突。
- **后台管理**：管理员管理 POI 内容、查看匿名首页访问统计；后端校验管理员权限。
- **交互体验**：深浅主题切换、路由懒加载，以及部分列表页的加载、空数据和错误提示。

## 项目亮点

### 首屏渲染优化

通过浏览器 Performance 面板定位首页主线程长任务，将筛选区重构为按需渲染的标签页，并以原生日期输入替代完整日期时间选择器。

按开发阶段的人工复测记录，相关长任务由 **2.04 s** 降至 **0.66～0.78 s**，降幅约 **62%～68%（约 65%）**。该指标是主线程任务耗时，不等同于首屏加载时间、FCP 或 LCP；具体结果受设备与测试环境影响。

### 酒店查询优化

将全量查询和前端筛选改为服务端组合筛选、稳定排序与分页，并基于 `EXPLAIN ANALYZE` 引入 `(area, star_level, id)` 和 `(price, id)` 复合索引。

在 **5 万条测试数据**、同机同服务进程、相同索引条件下，每个场景预热 5 次、采样 20 次；新接口每页返回 24 条：

| 场景 | 旧接口 p95 | 分页接口 p95 |
| --- | ---: | ---: |
| 全部酒店 | 1706.6 ms | 20.8 ms |
| 区域 + 星级 | 82.9 ms | 11.8 ms |
| 价格区间 | 674.7 ms | 12.3 ms |
| 模糊关键词 | 2113.7 ms | 28.7 ms |

“全部酒店”场景 p95 下降 **98.8%**。这组结果主要体现查询、序列化和传输范围收敛的收益，不能全部归因于索引。5 万条是基准测试数据量，不代表线上用户或真实酒店数量。

测试环境、执行计划和结果见 [性能实测](./server/BENCHMARK_RESULTS.md)，复现步骤见 [基准测试指南](./server/BENCHMARK.md)。

### 匿名首页访问统计

- 路由 `afterEach` 在成功进入首页时上报；首页内部 query/hash 变化不重复计数，上报失败不阻塞页面。
- 使用 `eventId` 唯一约束实现幂等，同一事件重复提交不会重复计入 PV。
- `visitorId` 保存在 localStorage，`sessionId` 保存在标签页 sessionStorage；分别用于匿名 UV 和 Session 去重。
- 使用服务端接收时间，按 `Asia/Shanghai` 自然日统计；无访问日期补零，区间 UV/Session 在整个区间去重。
- 管理页面 `#/admin/analytics` 提供今日指标和近 **7/30 天**趋势；管理接口支持最长 **90 天**的日期范围查询。
- 管理页使用请求序号处理快速切换范围产生的响应竞态，防止旧请求覆盖新结果。
- 埋点记录保存事件、访客、会话标识及时间，不采集 IP、账号、User-Agent 或搜索内容。匿名标识不等于真实人数，清理浏览器存储会影响去重。

## 本地启动

推荐使用 **Node.js 24 LTS** 和 **MySQL 8**。当前 NestJS 路径不需要 Java；运行历史 Spring Boot 服务时才需要 Java 21。

以下命令以 `my-project/` 为起始目录。

### 1. 创建开发数据库

```sql
CREATE DATABASE travel_node
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

准备一个可访问该数据库的本地 MySQL 账户。

### 2. 配置后端

```powershell
cd server
npm ci
Copy-Item .env.example .env.local
```

若已有 `.env.local`，直接编辑现有配置。填写以下变量：

| 变量 | 用途 |
| --- | --- |
| `DATABASE_URL` | Prisma CLI 连接串，格式为 `mysql://用户名:密码@127.0.0.1:3306/travel_node` |
| `DATABASE_HOST` / `DATABASE_PORT` | 服务运行时的数据库地址，通常为 `127.0.0.1` / `3306` |
| `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` | 服务运行时的数据库账户及库名 |
| `JWT_SECRET` | 至少 32 字符的随机密钥，替换示例值 |
| `JWT_TTL_SECONDS` | Token 有效期，示例为 `7200` 秒 |
| `PORT` | 后端端口，默认 `8082` |
| `CORS_ALLOWED_ORIGINS` | 允许的前端来源，默认 `http://localhost:8080` |

`DATABASE_URL` 与拆分的 `DATABASE_*` 配置必须指向同一数据库；连接串中的特殊字符需要 URL 编码。真实凭据只保存在本地环境配置中。

### 3. 初始化并启动后端

仅对新建的本地演示数据库执行：

```powershell
npm run db:setup
npm run start:dev
```

`db:setup` 依次同步 Prisma Schema、生成客户端并执行种子脚本。**当前种子脚本包含酒店恢复逻辑，会修改已有酒店数据，不能当作无副作用的重复初始化命令。** 已有数据库请先备份并核对 Schema，按需单独执行 `npm run db:push` 和 `npm run prisma:generate`。

后端默认监听 `http://127.0.0.1:8082`，健康检查为 `GET /health`。

### 4. 启动前端

另开终端，在 `my-project/` 下执行：

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

若已有 `.env.local`，保留并检查其中的 `VITE_API_BASE_URL=/api`。浏览器访问 `http://localhost:8080`，Vite 将 `/api` 转发至 `http://127.0.0.1:8082`，端口以 `vite.config.ts` 为准。

注册用户默认为 `USER`；后台页面需要已有的 `ADMIN` 账户，当前没有可视化角色管理功能。

## 构建与验证

在 `my-project/` 下：

```powershell
npm test
npm run build
```

在 `my-project/server/` 下：

```powershell
npm run typecheck
npm test
npm run build
```

后端安装依赖后需先生成 Prisma 客户端；部分集成验证需要按测试配置准备数据库。`test:e2e` 脚本尚未匹配到对应测试文件，当前不列为可通过的检查项。以上命令的运行结果以具体执行记录为准。

前端构建输出至 `docs/`。静态部署还需配置后端服务及 `/api` 反向代理，单独托管静态文件不能提供数据库业务。后端构建后可使用 `npm run start` 启动。

## 目录结构

```text
my-project/
├─ src/
│  ├─ api/                 # 请求封装与业务接口
│  ├─ components/          # 公共组件
│  ├─ router/              # 路由、登录守卫与首页上报
│  ├─ stores/              # Pinia 状态
│  ├─ types/               # TypeScript 类型
│  ├─ utils/               # 日期、请求竞态与匿名标识等工具
│  └─ views/               # 用户页面和管理页面
├─ server/
│  ├─ src/                 # NestJS 业务模块及测试
│  ├─ prisma/              # 数据模型及已有迁移 SQL
│  ├─ test/                # 接口测试
│  ├─ BENCHMARK.md         # 基准测试复现步骤
│  └─ BENCHMARK_RESULTS.md # 性能结果与执行计划说明
├─ tests/                  # 前端工具逻辑测试
├─ plans/                  # 迁移、接口契约和功能设计记录
├─ public/                 # 静态资源
├─ docs/                   # 前端构建产物
├─ travel-backend/         # 保留的 Spring Boot 实现
└─ vite.config.ts          # 开发代理与构建配置
```

## 当前边界与后续方向

- 预订功能是演示记录闭环，未接入真实支付、退款、酒店库存或供应商确认。
- 坐标示意图不提供真实地图、导航、路线规划或交通时间；POI 内容以演示数据为主。
- 当前仅使用短期 access token，未实现 refresh token、主动吊销和多设备会话管理。
- 酒店搜索已有服务端分页，预订和行程列表仍有进一步分页优化空间；模糊关键词和深页查询的限制见性能实测文档。
- 本地开发以 Prisma `db push` 为主。已有访问统计迁移 SQL 不构成完整的空库迁移链；生产部署前需补齐并验证迁移流程，不能直接以 `db push` 替代生产迁移。
- 已有前端工具测试和后端单元/接口测试，尚不能视为完整的浏览器端到端测试体系；全站移动端适配仍需完善。
- 当前平台未集成 AI 自动行程生成。本地同级目录的 `travel-agent-python/` 是独立的 AI 旅行规划助手项目（不包含在本仓库中），后续可探索通过受控业务接口集成。
- 后续重点：真实地图与路线能力、行程预算和服务端时间约束、更多自动化测试，以及部署、监控和数据备份。
