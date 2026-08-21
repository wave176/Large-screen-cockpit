# data/screens

大屏文档落盘目录（开发态模拟数据库）。

- 文件名：`{screenId}.json`（如 `screen-demo.json`）
- 结构：`{ version, updatedAt, schema }`，`schema` 即 `ScreenSchema`
- 由 `vite/mock-screen-api.ts` 在 `npm run dev` 时读写
- 勿手改破坏 `version` 与 `schema` 结构；接手说明见 `docs/开发交接.md`
