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

/** 组件数据源类型；当前编辑器以 static 为主，http/websocket 为扩展位 */
export type DataSourceType = 'static' | 'http' | 'websocket'

/** 组件数据源配置；charts 等通过 data 注入静态序列 */
export interface DataSourceConfig {
  type: DataSourceType
  method?: 'GET' | 'POST'
  url?: string
  /** 轮询间隔（ms），仅 http 等动态源有意义 */
  interval?: number
  /** 字段映射：远端字段名 → 组件期望字段名 */
  mapping?: Record<string, string>
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
