export type ScaleMode = 'fit' | 'fill' | 'stretch' | 'none'

export interface ComponentLayout {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  rotate?: number
}

export interface CanvasConfig {
  width: number
  height: number
  background: string
  backgroundImage?: string
  scaleMode: ScaleMode
}

export type DataSourceType = 'static' | 'http' | 'websocket'

export interface DataSourceConfig {
  type: DataSourceType
  method?: 'GET' | 'POST'
  url?: string
  interval?: number
  mapping?: Record<string, string>
  data?: unknown
}

/** 组件组：图层树中的文件夹节点，不直接渲染 */
export interface ComponentGroup {
  id: string
  name: string
  collapsed?: boolean
}

export interface ScreenComponent {
  id: string
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

export interface ScreenSchema {
  id: string
  name: string
  canvas: CanvasConfig
  groups: ComponentGroup[]
  components: ScreenComponent[]
}

export interface ScaleResult {
  scaleX: number
  scaleY: number
}

export interface ResolutionPreset {
  label: string
  width: number
  height: number
}

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

export interface LayerTreeGroupNode {
  kind: 'group'
  group: ComponentGroup
  children: ScreenComponent[]
}

export interface LayerTreeComponentNode {
  kind: 'component'
  component: ScreenComponent
}

export type LayerTreeNode = LayerTreeGroupNode | LayerTreeComponentNode
