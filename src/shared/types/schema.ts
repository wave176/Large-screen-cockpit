/**
 * 大屏 Schema 与图层相关的核心类型定义。
 *
 * 依赖关系：
 * - 被 store、组件注册表、图层工具、持久化 API、默认 Schema 等广泛引用
 * - 本文件仅定义类型，不含运行时逻辑
 *
 * 约定：
 * - groups 是图层树「文件夹」，不直接画到画布
 * - components[].groupId 关联所属组；null 表示未分组
 * - zIndex 越大越靠上；图层列表展示顺序与画布叠放一致（高 z 在列表顶部）
 */

/** 预览/运行时画布相对视口的缩放策略 */
export type ScaleMode = 'fit' | 'fill' | 'stretch' | 'none'

/** 组件在画布上的几何与叠放信息（单位：设计稿像素） */
export interface ComponentLayout {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  rotate?: number
}

/** 画布全局配置（尺寸、背景、缩放模式） */
export interface CanvasConfig {
  width: number
  height: number
  background: string
  backgroundImage?: string
  scaleMode: ScaleMode
}

/** 组件数据源类型：static 本地；http 接口；sql 经后端代理；websocket 实时推送 */
export type DataSourceType = 'static' | 'http' | 'sql' | 'websocket'

/**
 * 组件数据源配置。
 * - static：使用 data 字段
 * - http：请求 url，结果写入运行时缓存（不回写 schema，除非手动「写入静态」）
 * - sql：把 sql 交给后端 /api/data/sql 执行（浏览器不直连库）
 * - websocket：订阅 url，推送消息解析为数据
 */
export interface DataSourceConfig {
  type: DataSourceType
  method?: 'GET' | 'POST'
  url?: string
  /** 轮询间隔（ms）；http/sql 动态刷新；0 或不填表示只请求一次 */
  interval?: number
  /** JSON 路径，如 data.list 或 result.rows，用于从响应中取出组件所需对象 */
  dataPath?: string
  /** 请求头（http） */
  headers?: Record<string, string>
  /** POST body 原文（JSON 字符串或普通文本） */
  body?: string
  /**
   * 字段映射：组件字段名 → 远端字段名。
   * 例：{ categories: 'labels', values: 'nums' }
   */
  mapping?: Record<string, string>
  /**
   * SQL（仅 type=sql）。由后端代理执行；开发态 Mock 按关键字返回演示数据。
   * 生产环境请改为命名查询 id（sqlId），避免前端拼接任意 SQL。
   */
  sql?: string
  /** 命名查询 id（推荐生产用法），与 sql 二选一 */
  sqlId?: string
  /**
   * 数据处理脚本（JavaScript 函数体）。
   * 可访问 raw、component；必须 return 最终数据。有脚本时以 return 值为组件数据。
   */
  transformScript?: string
  /** 数据样例 / 动态源失败时的兜底 */
  data?: unknown
}

/** 组件组：图层树中的文件夹节点，不直接渲染 */
export interface ComponentGroup {
  id: string
  name: string
  collapsed?: boolean
}

/** 画布上的一个可编辑组件实例 */
export interface ScreenComponent {
  id: string
  /** 对应组件注册表中的 type（如 ChartBar） */
  type: string
  /** 图层显示名称 */
  name: string
  /** 所属组 id，null 表示未分组 */
  groupId: string | null
  /** 是否锁定（锁定后不可拖拽） */
  locked: boolean
  /** 是否可见 */
  visible: boolean
  layout: ComponentLayout
  props: Record<string, unknown>
  dataSource?: DataSourceConfig
}

/**
 * 一份大屏的完整可序列化文档主体。
 * 持久化时通常包在 ScreenDocument（version + schema）里。
 */
export interface ScreenSchema {
  id: string
  name: string
  canvas: CanvasConfig
  groups: ComponentGroup[]
  components: ScreenComponent[]
}

/** calcScale 的输出：分别作用于 X/Y；等比模式下两者相同 */
export interface ScaleResult {
  scaleX: number
  scaleY: number
}

/** 编辑器分辨率预设项 */
export interface ResolutionPreset {
  label: string
  width: number
  height: number
}

/**
 * 组件元信息（注册表用）：决定面板展示分类与新建时的默认布局/属性。
 * defaultLayout 不含 zIndex，由 store.addComponent 按当前最高层 +1 赋值。
 */
export interface ComponentMeta {
  type: string
  label: string
  category:
    | 'charts'
    | 'metrics'
    | 'lists'
    | 'decorations'
    | 'icons'
    | 'layout'
    | 'infos'
    | 'controls'
    | 'map3d'
    | 'video'
  defaultLayout: Omit<ComponentLayout, 'zIndex'>
  defaultProps: Record<string, unknown>
}

/** 图层树：组节点（含其子组件列表） */
export interface LayerTreeGroupNode {
  kind: 'group'
  group: ComponentGroup
  children: ScreenComponent[]
}

/** 图层树：未分组的顶层组件节点 */
export interface LayerTreeComponentNode {
  kind: 'component'
  component: ScreenComponent
}

/** 图层面板用的联合节点类型 */
export type LayerTreeNode = LayerTreeGroupNode | LayerTreeComponentNode
