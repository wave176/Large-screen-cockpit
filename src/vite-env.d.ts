/**
 * Vite / 第三方模块的 TypeScript 环境声明。
 *
 * - vite/client：提供 import.meta.env 等
 * - *.vue：让 TS 识别 SFC 默认导出
 * - vue3-moveable：无官方类型时的最小 DefineComponent 声明（编辑器拖拽依赖）
 */

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'vue3-moveable' {
  import type { DefineComponent } from 'vue'
  const Moveable: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default Moveable
}
