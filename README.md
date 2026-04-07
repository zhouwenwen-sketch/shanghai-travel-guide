# 上海旅游攻略

基于 Vue 3 + Pinia + Element Plus 的旅游信息展示平台。

## 在线预览

https://zhouwenwen-sketch.github.io/shanghai-travel-guide/

## 项目简介

上海旅游攻略是一个旅游信息展示类单页应用，为用户提供酒店推荐、景点筛选、星级评分等功能。项目采用 Vue 3 全家桶开发，包含用户登录状态管理和深色主题切换。

## 功能特点

- 酒店推荐：展示上海热门酒店信息，包含图片、名称、位置、价格、评分、点评数量
- 酒店标签：展示酒店设施标签，如 SPA、泳池、接机等
- 筛选功能：按位置区域、星级价格等条件筛选酒店
- 用户登录：使用 Pinia 管理用户登录状态，支持退出登录
- 深色主题：支持深色/浅色主题切换
- 侧边菜单：支持折叠/展开，包含酒店、旅游、景点等导航项
- 轮播图：首页右侧展示轮播 Banner

## 技术栈

- Vue 3：组合式 API + script setup
- Vite：构建工具
- Pinia：状态管理（用户登录状态、主题状态）
- Vue Router：路由管理（首页、登录页）
- Element Plus：UI 组件库
- iconfont：第三方图标库
- CSS3：Flex 布局、Grid 布局

## 项目结构
```
src/
├── assets/ # 静态资源
├── components/ # 可复用组件
├── router/ # 路由配置
├── stores/ # Pinia 状态管理
│ ├── theme.js
│ └── user.js
├── views/ # 页面组件
│ ├── banner.vue
│ ├── headerNav.vue
│ └── index.vue
│ └── login.vue
│ ├── navMenu.vue
│ ├── recommend.vue
│ ├── recommend-list.vue
│ ├── searchlist.vue
│ └── topfilter.vue
├── App.vue # 根组件
└── main.js # 入口文件
```

text

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
启动开发服务器
bash
npm run dev
打包生产版本
bash
npm run build
本地预览打包结果
bash
npx serve dist
页面说明
首页：展示酒店推荐列表、筛选区域、轮播图

登录页：用户登录表单，登录成功后跳转首页

左侧菜单：包含酒店、旅游、景点、机票、火车票、汽车票、船票、门票

筛选区域：包含位置区域、星级价格、高级筛选

作者
周文雯 - 上海大学计算机科学与技术专业
