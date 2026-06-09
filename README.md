# 上海旅游攻略

基于 Vue 3 + Pinia + Element Plus 的旅游信息展示平台。

## 在线预览

https://zhouwenwen-sketch.github.io/shanghai-travel-guide/

> 线上为纯前端演示版，登录使用演示账号 `demo / 123456`。
> 本地启动后端可体验完整功能（注册、数据持久化）。

## 功能特点

- **酒店推荐**：展示上海热门酒店信息，包含图片、名称、位置、价格、评分
- **酒店详情**：查看房型、点评、设施标签等详细信息
- **搜索筛选**：按关键词、位置区域、星级、价格区间筛选酒店
- **用户系统**：登录/注册，收藏酒店，浏览历史记录
- **深色主题**：支持深色/浅色主题切换，CSS 变量管理全局样式
- **响应式布局**：Flex + Grid 布局，适配不同屏幕

## 技术栈

| 前端 | 后端 |
|------|------|
| Vue 3 (Composition API + `<script setup>`) | Spring Boot 3.2.5 |
| Vite 8 (构建工具) | Spring Data JPA |
| Pinia (状态管理) | MySQL |
| Vue Router 4 (路由守卫 + 懒加载) | Maven |
| Element Plus (UI 组件库) | Java 21 |
| Axios (HTTP 请求，拦截器封装) | RESTful API |
| TypeScript (全项目类型化) | |
| CSS3 (Flex / Grid / CSS 变量) | |

## 项目结构

```
my-project/
├── public/                 # 静态资源（favicon、图片）
├── src/
│   ├── api/                # API 封装（axios 实例 + 各模块接口）
│   │   ├── index.ts        #   axios 实例（响应拦截器、错误处理）
│   │   ├── hotels.ts       #   酒店相关接口
│   │   ├── favorites.ts    #   收藏接口（含 localStorage 兜底）
│   │   ├── history.ts      #   浏览历史接口（含 localStorage 兜底）
│   │   └── user.ts         #   用户登录注册（含 mock 兜底）
│   ├── assets/             # 样式、字体图标
│   ├── components/         # 可复用组件
│   ├── types/              # 全局 TypeScript 类型定义
│   │   └── index.ts        #   Hotel / User / Room 等全部类型接口
│   ├── router/             # 路由配置（路由守卫）
│   ├── stores/             # Pinia 状态管理
│   │   ├── theme.ts        #   深色/浅色主题
│   │   └── user.ts         #   用户登录态
│   ├── views/              # 页面组件
│   │   ├── index.vue       #   首页
│   │   ├── login.vue       #   登录页
│   │   ├── hotel-detail.vue#   酒店详情页
│   │   ├── search-result.vue#  搜索结果页（含分页）
│   │   ├── recommend-list.vue# 推荐列表
│   │   ├── user-center.vue #   个人中心（收藏、历史）
│   │   ├── banner.vue      #   轮播图
│   │   ├── headerNav.vue   #   顶部导航
│   │   ├── navMenu.vue     #   侧边菜单
│   │   ├── searchlist.vue  #   搜索框
│   │   └── topfilter.vue   #   筛选区域
│   ├── App.vue
│   └── main.ts
├── travel-backend/         # Spring Boot 后端
│   └── src/main/java/
│       ├── controller/     #   RESTful 控制器
│       ├── entity/         #   实体类（Hotel, User, Favorite...）
│       ├── repository/     #   JPA 数据访问
│       └── service/        #   业务逻辑
├── docs/                   # 构建输出（GitHub Pages 部署）
├── index.html
├── vite.config.js          # Vite 配置（代理 / 别名 / 自动导入）
└── package.json
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+
- Java 21（后端）
- Maven（后端，或用项目自带的 mvnw.cmd）

### 1. 启动前端（开发模式）

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:8080）
npm run dev
```

### 2. 启动后端（可选，用于完整功能）

```bash
# 先创建 MySQL 数据库
# mysql -u root -p -e "CREATE DATABASE travel_db;"

# 启动后端（第一次运行会自动下载依赖，需等待）
cd travel-backend
.\mvnw.cmd spring-boot:run

# 后端运行在 http://localhost:8081
```

> 如果后端未启动，前端会自动使用 mock 数据和 localStorage 兜底，不影响页面展示。

### 3. 生产构建

```bash
npm run build
```

构建产物输出到 `docs/` 目录，静态文件即可部署。

## 部署到 GitHub Pages（常用命令）

```bash
# 三步走：构建 → 提交 → 推送
npm run build
git add .
git commit -m "update"
git push origin main
```

推送后等待 1-2 分钟，访问 https://zhouwenwen-sketch.github.io/shanghai-travel-guide/

> **注意**：如果遇到网络问题，配置 Git 代理：
> ```bash
> git config --global http.proxy http://127.0.0.1:7890
> git config --global https.proxy http://127.0.0.1:7890
> git push origin main
> git config --global --unset http.proxy
> git config --global --unset https.proxy
> ```

## 项目要点（面试用）

### API 封装
axios 实例统一设置 `baseURL: '/api'`，请求拦截器自动带 token，响应拦截器统一处理错误码和异常消息。开发环境通过 Vite proxy 转发到后端，生产环境（GitHub Pages）自动降级到 mock 数据。

### 主题切换
使用 CSS 变量实现全局主题管理，Pinia 存储用户偏好，页面内嵌 script 从 localStorage 读取主题，避免首屏闪白。

### 路由守卫
Vue Router 的 `beforeEach` 守卫配合 Pinia 用户状态，控制个人中心等页面的访问权限，未登录自动跳转登录页。

### 搜索分页
搜索结果支持客户端分页，可切换每页条数（6/12/24），切换筛选条件时自动重置到第一页。

## 在线访问

https://zhouwenwen-sketch.github.io/shanghai-travel-guide/

## 近期优化：全项目 TypeScript 类型化

对项目全部视图组件进行了系统性 TypeScript 类型增强，覆盖 10 个 `.vue` 文件，实现了 `vue-tsc --noEmit` 零类型错误。

### 改造范围

| 阶段 | 文件 | 关键改进 |
|------|------|---------|
| 一：核心组件 | hotel-detail.vue, search-result.vue, recommend-list.vue, user-center.vue | 数据 ref 泛型化、函数参数/返回值类型约束、catch 类型安全、模板 ref 自动解包 |
| 二：子组件 | topfilter.vue, searchlist.vue, login.vue | defineEmits/defineProps 泛型模式、`Record<string, string>` 动态对象、日期范围元组类型 |
| 三：类型质量 | types/index.ts, banner.vue, headerNav.vue, navMenu.vue | 提取共享类型、类型守卫过滤 null、接口定义替代隐式 any |

### 主要收益

- **编译期捕获**: `hotel.name` 等属性访问不再有运行时 `undefined` 风险
- **IDE 智能提示**: 所有 `ref`、`computed`、函数参数都有完整类型推断和补全
- **安全异常处理**: 全局 `catch (e: unknown)` 模式，必须 `e instanceof Error` 收窄后才能访问 `e.message`
- **共享类型沉淀**: `FilterChangePayload`、`CriteriaTag` 等跨组件类型统一管理
- **零编译错误**: `vue-tsc --strict` 模式下全项目通过

## 作者

周文雯 - 上海大学计算机科学与技术专业
