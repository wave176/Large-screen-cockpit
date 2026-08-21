# 大屏可视化平台

基于技术选型文档搭建的前端工程：固定分辨率画布、组件拖拽、图层成组，Schema 驱动渲染。

> **新人接手请先读：[docs/开发交接.md](./docs/开发交接.md)**（数据流、加组件、设计器约定、换后端）。

## 技术栈

- Vue 3 + TypeScript + Vite
- Pinia + Vue Router + Naive UI
- ECharts + vue-echarts
- vue3-moveable
- **JSON 文件模拟后端存储**（`data/screens/*.json`）

## 功能

- **设计器** `/editor`：固定分辨率、Moveable、组件/图层、成组一起移动、属性浮层
- **运行时** `/runtime`：Schema 渲染 + scale 适配
- **持久化**：自动 / 手动保存到 `data/screens/{id}.json`（开发态 Vite 中间件模拟 API）

## 快速开始

```bash
npm install
npm run dev
```

打开设计器后，修改布局会防抖写入：

```
data/screens/screen-demo.json
```

也可点击工具栏 **「保存到 JSON」**。可用编辑器直接打开该文件查看版本与 Schema。

## 模拟后端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/screens` | 列表 |
| GET | `/api/screens/:id` | 读取文档 |
| PUT | `/api/screens/:id` | 保存（version 自增） |
| POST | `/api/screens` | 新建 |

实现：`vite/mock-screen-api.ts` → 读写 `data/screens/`。

## 目录结构

```
data/screens/          # 大屏 JSON 文档（模拟数据库）
docs/
  开发交接.md          # 接手必读
  技术选型.md          # 选型与演进
src/
  api/screen.ts        # 前端 API 封装
  components/          # 图表、指标、列表、装饰等 + registry
  editor/              # 设计器（画布 / 侧栏 / 属性）
  runtime/             # 运行时画布
  shared/              # 类型、默认 Schema、工具
  store/screen.ts      # Pinia（hydrate / persist / 选中态）
vite/
  mock-screen-api.ts   # 开发态模拟后端
```

## 后续

- 将 `src/api/screen.ts` 指向真实后端
- 数据库用 PostgreSQL JSONB / MySQL JSON 存整份 Schema

详细说明见 [docs/技术选型.md](./docs/技术选型.md) §9、[docs/开发交接.md](./docs/开发交接.md)。
