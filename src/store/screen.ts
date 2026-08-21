/**
 * 大屏编辑器核心 Pinia Store。
 *
 * 职责：
 * - 持有当前 ScreenSchema 与选中态
 * - hydrate / persist：与 data/screens/*.json（经 /api/screens）同步
 * - 组件增删改、成组/解组、图层顺序、画布配置
 *
 * 依赖：
 * - defaultScreenSchema：冷启动与加载失败回退
 * - layerTree：规范化、空组清理、成员查询、zIndex 重排
 * - components/registry：新建组件的 meta 与默认 dataSource
 * - api/screen：读写文档
 *
 * 选中约定（接手必读）：
 * - selectedIds[0] 为「主选」；同组多选时主选在前，其余为组员
 * - selectedGroupId 非空表示当前按组选中（点组内任一组件会带上全组）
 * - selectionChromeVisible：画布选中框 / Moveable 开关；属性栏聚焦改布局时会隐藏，避免框错位
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComponentLayout, ScreenComponent, ScreenSchema } from '@/shared/types/schema'
import { defaultScreenSchema } from '@/shared/data/defaultSchema'
import { createId } from '@/shared/utils/calcScale'
import {
  getGroupMemberIds,
  getOrderedComponentIds,
  normalizeSchema,
  pruneEmptyGroups,
  reindexZOrders,
} from '@/shared/utils/layerTree'
import { getComponentMeta, getDefaultDataSource } from '@/components/registry'
import { fetchScreenDocument, saveScreenDocument } from '@/api/screen'

/** 文档读写 UI 状态：idle 未用；loading/saving 进行中；saved/error 结果 */
export type SaveStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error'

/** 深拷贝 Schema，避免默认对象被原地改写 */
function cloneSchema(schema: ScreenSchema): ScreenSchema {
  return JSON.parse(JSON.stringify(schema)) as ScreenSchema
}

const DEFAULT_SCREEN_ID = defaultScreenSchema.id

export const useScreenStore = defineStore('screen', () => {
  const schema = ref<ScreenSchema>(cloneSchema(defaultScreenSchema))
  /** 当前选中的组件 id 列表；[0] 为主选 */
  const selectedIds = ref<string[]>([])
  /** 当前选中的组；与「点组内组件带出全组」联动 */
  const selectedGroupId = ref<string | null>(null)
  /** 编辑器画布预览缩放（相对设计稿，见 EDITOR_PREVIEW_SCALES） */
  const editorPreviewScale = ref(0.75)
  const propertyPanelVisible = ref(true)
  /**
   * 画布选中框 / Moveable 是否绘制。
   * 属性栏聚焦输入改布局时设为 false，避免改完后选中框仍停在旧几何位置。
   */
  const selectionChromeVisible = ref(true)

  /** 文档版本（来自 JSON 文件 / 模拟后端），乐观并发用 */
  const documentVersion = ref(1)
  const documentUpdatedAt = ref<string | null>(null)
  const saveStatus = ref<SaveStatus>('idle')
  const saveError = ref<string | null>(null)
  /** hydrate 完成前禁止 persist，避免用默认 Schema 覆盖远端文件 */
  const hydrated = ref(false)

  let saveTimer: ReturnType<typeof setTimeout> | undefined
  /** 保存序号：丢弃过期的 saveNow 响应，防止乱序回写 */
  let saveSeq = 0

  const selectedComponents = computed(() =>
    schema.value.components.filter((item) => selectedIds.value.includes(item.id)),
  )

  const primarySelected = computed(() => selectedComponents.value[0] ?? null)

  /** 兼容旧命名：等同 primarySelected */
  const selectedComponent = computed(() => primarySelected.value)

  /**
   * 从 data/screens/*.json 加载（模拟 GET /api/screens/:id）。
   * 失败时回退内置默认 Schema，并尝试 save 初始化文件；结束后清空选中并标记 hydrated。
   */
  async function hydrate(screenId = DEFAULT_SCREEN_ID) {
    saveStatus.value = 'loading'
    saveError.value = null
    try {
      const doc = await fetchScreenDocument(screenId)
      schema.value = normalizeSchema(doc.schema)
      documentVersion.value = doc.version
      documentUpdatedAt.value = doc.updatedAt
      saveStatus.value = 'saved'
    } catch (error) {
      // 文件不存在时回退内置默认 Schema，并尝试写入文件
      schema.value = cloneSchema(defaultScreenSchema)
      try {
        const doc = await saveScreenDocument(schema.value, 0)
        documentVersion.value = doc.version
        documentUpdatedAt.value = doc.updatedAt
        saveStatus.value = 'saved'
      } catch (writeError) {
        saveStatus.value = 'error'
        saveError.value =
          writeError instanceof Error ? writeError.message : '初始化保存失败'
      }
    } finally {
      hydrated.value = true
      selectedIds.value = []
      selectedGroupId.value = null
    }
  }

  /**
   * 立即写入 JSON 文件（模拟 PUT）。
   * 用 saveSeq 忽略过期请求的结果，避免快速连续保存时旧响应覆盖新状态。
   */
  async function saveNow() {
    const seq = ++saveSeq
    saveStatus.value = 'saving'
    saveError.value = null
    try {
      const doc = await saveScreenDocument(schema.value, documentVersion.value)
      if (seq !== saveSeq) return
      documentVersion.value = doc.version
      documentUpdatedAt.value = doc.updatedAt
      saveStatus.value = 'saved'
    } catch (error) {
      if (seq !== saveSeq) return
      saveStatus.value = 'error'
      saveError.value = error instanceof Error ? error.message : '保存失败'
    }
  }

  /**
   * 防抖自动保存 → data/screens/{id}.json。
   * 任意改 Schema 的操作末尾应调用；hydrate 完成前直接 return。
   */
  function persist() {
    if (!hydrated.value) return
    saveStatus.value = 'saving'
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void saveNow()
    }, 600)
  }

  /** 恢复为内置默认 Schema 并触发保存 */
  function resetSchema() {
    schema.value = cloneSchema(defaultScreenSchema)
    selectedIds.value = []
    selectedGroupId.value = null
    persist()
  }

  function setCanvasSize(width: number, height: number) {
    schema.value.canvas.width = Math.max(320, Math.round(width))
    schema.value.canvas.height = Math.max(240, Math.round(height))
    persist()
  }

  function setScaleMode(mode: ScreenSchema['canvas']['scaleMode']) {
    schema.value.canvas.scaleMode = mode
    persist()
  }

  /**
   * 选中组件。
   * - id 为 null：清空选中并隐藏选中框
   * - append：多选切换（点组逻辑关闭）
   * - 普通单击：若组件在组内，选中该组全部成员（主选为被点组件）
   */
  function selectComponent(id: string | null, options?: { append?: boolean }) {
    if (!id) {
      selectedGroupId.value = null
      selectedIds.value = []
      selectionChromeVisible.value = false
      return
    }

    selectionChromeVisible.value = true

    if (options?.append) {
      selectedGroupId.value = null
      if (selectedIds.value.includes(id)) {
        selectedIds.value = selectedIds.value.filter((item) => item !== id)
      } else {
        selectedIds.value = [...selectedIds.value, id]
      }
      return
    }

    const component = schema.value.components.find((item) => item.id === id)
    if (component?.groupId) {
      const members = getGroupMemberIds(schema.value, component.groupId)
      selectedGroupId.value = component.groupId
      // 主选放首位，其余组员随后，便于属性栏与 Moveable 以主选为准
      selectedIds.value = [id, ...members.filter((memberId) => memberId !== id)]
      return
    }

    selectedGroupId.value = null
    selectedIds.value = [id]
  }

  /**
   * 直接选中整组（图层树点组名）。
   * 成员顺序来自 getGroupMemberIds，不一定以「最后点击的组件」为主选。
   */
  function selectGroup(groupId: string | null) {
    selectedGroupId.value = groupId
    if (!groupId) {
      selectedIds.value = []
      selectionChromeVisible.value = false
      return
    }
    selectedIds.value = getGroupMemberIds(schema.value, groupId)
    selectionChromeVisible.value = true
  }

  /** 仅隐藏选中框，不改 selectedIds（属性面板编辑布局时用） */
  function hideSelectionChrome() {
    selectionChromeVisible.value = false
  }

  function isSelected(id: string): boolean {
    return selectedIds.value.includes(id)
  }

  /**
   * 组内「非主选」成员的弱高亮（主选用实线框，组员用虚线等）。
   * 主选自身返回 false，避免双重样式。
   */
  function isGroupHighlighted(id: string): boolean {
    if (!selectedGroupId.value) return false
    if (selectedIds.value[0] === id) return false
    const component = schema.value.components.find((item) => item.id === id)
    return component?.groupId === selectedGroupId.value
  }

  /** 多选中的非主选成员（append 多选或组选场景） */
  function isCoSelected(id: string): boolean {
    return selectedIds.value.includes(id) && selectedIds.value[0] !== id
  }

  /**
   * 拖拽时应一起移动的 id 集合。
   * 主选在组内 → 整组；否则 → 当前 selectedIds（支持多选一起拖）。
   */
  function getMoveTogetherIds(): string[] {
    const primaryId = selectedIds.value[0]
    if (!primaryId) return []

    const primary = schema.value.components.find((item) => item.id === primaryId)
    if (primary?.groupId) {
      return getGroupMemberIds(schema.value, primary.groupId)
    }

    return [...selectedIds.value]
  }

  function updateComponentLayout(id: string, layout: Partial<ComponentLayout>) {
    const target = schema.value.components.find((item) => item.id === id)
    if (!target || target.locked) return
    target.layout = { ...target.layout, ...layout }
    persist()
  }

  /** 相对位移当前联动选中集合（键盘微调等）；锁定组件跳过 */
  function moveSelectedBy(deltaX: number, deltaY: number) {
    if (!deltaX && !deltaY) return
    const ids = getMoveTogetherIds()
    ids.forEach((id) => {
      const target = schema.value.components.find((item) => item.id === id)
      if (!target || target.locked) return
      target.layout = {
        ...target.layout,
        x: Math.max(0, Math.round(target.layout.x + deltaX)),
        y: Math.max(0, Math.round(target.layout.y + deltaY)),
      }
    })
    persist()
  }

  function updateComponentProps(id: string, props: Record<string, unknown>) {
    const target = schema.value.components.find((item) => item.id === id)
    if (!target) return
    target.props = { ...target.props, ...props }
    persist()
  }

  function updateComponentName(id: string, name: string) {
    const target = schema.value.components.find((item) => item.id === id)
    if (!target) return
    target.name = name
    persist()
  }

  /**
   * 计算新组件落点：在默认坐标上按已有组件数量错开，
   * 避免连续添加时叠在示例图同一位置导致「串图」观感。
   */
  function resolvePlacement(base: Omit<ComponentLayout, 'zIndex'>) {
    // 错开落点，避免新组件叠在示例图上导致“串图”
    const step = schema.value.components.length % 8
    const offset = step * 32
    const maxX = Math.max(40, schema.value.canvas.width - base.width - 40)
    const maxY = Math.max(40, schema.value.canvas.height - base.height - 40)
    return {
      ...base,
      x: Math.min(base.x + offset, maxX),
      y: Math.min(base.y + offset, maxY),
    }
  }

  /**
   * 按注册表 type 新建组件并选中。
   * - groupId 继承当前 selectedGroupId（在组内新建则直接入组）
   * - zIndex = 当前最高 + 1
   * - dataSource 由 registry 按 type/props 给默认静态数据
   */
  function addComponent(type: string, label?: string) {
    const meta = getComponentMeta(type, label)
    if (!meta) return

    const maxZ = schema.value.components.reduce(
      (max, item) => Math.max(max, item.layout.zIndex),
      0,
    )

    const props = { ...meta.defaultProps }
    const component: ScreenComponent = {
      id: createId(type.toLowerCase()),
      type,
      name: meta.label,
      groupId: selectedGroupId.value,
      locked: false,
      visible: true,
      layout: {
        ...resolvePlacement(meta.defaultLayout),
        zIndex: maxZ + 1,
      },
      props,
      dataSource: getDefaultDataSource(type, props),
    }

    schema.value.components.push(component)
    selectComponent(component.id)
    persist()
  }

  /** 清理空组；若当前选中组被删则清空 selectedGroupId */
  function cleanEmptyGroups() {
    const removed = pruneEmptyGroups(schema.value)
    if (selectedGroupId.value && removed.includes(selectedGroupId.value)) {
      selectedGroupId.value = null
    }
    return removed
  }

  /** 删除当前选中组件；删后清理空组并清空选中 */
  function removeSelected() {
    const ids = new Set(selectedIds.value)
    if (!ids.size) return

    schema.value.components = schema.value.components.filter((item) => !ids.has(item.id))
    cleanEmptyGroups()
    selectedIds.value = []
    selectedGroupId.value = null
    persist()
  }

  function toggleComponentVisible(id: string) {
    const target = schema.value.components.find((item) => item.id === id)
    if (!target) return
    target.visible = !target.visible
    persist()
  }

  function toggleComponentLocked(id: string) {
    const target = schema.value.components.find((item) => item.id === id)
    if (!target) return
    target.locked = !target.locked
    persist()
  }

  function toggleGroupCollapsed(groupId: string) {
    const group = schema.value.groups.find((item) => item.id === groupId)
    if (!group) return
    group.collapsed = !group.collapsed
    persist()
  }

  function renameGroup(groupId: string, name: string) {
    const group = schema.value.groups.find((item) => item.id === groupId)
    if (!group) return
    group.name = name
    persist()
  }

  /**
   * 将当前选中组件打成新组并选中该组。
   * 组插到 groups 列表头部；已在其他组的成员会改挂到新组。
   */
  function createGroupFromSelection(name = '未命名组') {
    if (selectedIds.value.length === 0) return

    const groupId = createId('group')
    schema.value.groups.unshift({
      id: groupId,
      name,
      collapsed: false,
    })

    selectedIds.value.forEach((id) => {
      const target = schema.value.components.find((item) => item.id === id)
      if (target) target.groupId = groupId
    })

    selectGroup(groupId)
    persist()
  }

  /**
   * 解组：若当前选中整组则拆组并删组记录；
   * 否则仅把选中组件的 groupId 置 null，再 prune 空组。
   */
  function ungroupSelected() {
    if (selectedGroupId.value) {
      const groupId = selectedGroupId.value
      schema.value.components.forEach((item) => {
        if (item.groupId === groupId) item.groupId = null
      })
      schema.value.groups = schema.value.groups.filter((item) => item.id !== groupId)
      selectedGroupId.value = null
      selectedIds.value = []
      persist()
      return
    }

    selectedIds.value.forEach((id) => {
      const target = schema.value.components.find((item) => item.id === id)
      if (target) target.groupId = null
    })
    cleanEmptyGroups()
    persist()
  }

  /**
   * 调整单个组件在图层列表中的位置（up/down 相邻交换；top/bottom 置顶/置底），
   * 再 reindexZOrders 写回 zIndex。
   */
  function moveLayer(id: string, direction: 'up' | 'down' | 'top' | 'bottom') {
    const ordered = getOrderedComponentIds(schema.value)
    const index = ordered.indexOf(id)
    if (index === -1) return

    const next = [...ordered]
    if (direction === 'up' && index > 0) {
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    } else if (direction === 'down' && index < next.length - 1) {
      ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
    } else if (direction === 'top') {
      next.splice(index, 1)
      next.unshift(id)
    } else if (direction === 'bottom') {
      next.splice(index, 1)
      next.push(id)
    } else {
      return
    }

    reindexZOrders(schema.value.components, next)
    persist()
  }

  /** 对当前选中的每个 id 依次 moveLayer（多选时可能连续改序） */
  function moveSelectionLayer(direction: 'up' | 'down' | 'top' | 'bottom') {
    selectedIds.value.forEach((id) => moveLayer(id, direction))
  }

  return {
    schema,
    selectedIds,
    selectedGroupId,
    editorPreviewScale,
    propertyPanelVisible,
    selectionChromeVisible,
    documentVersion,
    documentUpdatedAt,
    saveStatus,
    saveError,
    hydrated,
    selectedComponent,
    selectedComponents,
    primarySelected,
    hydrate,
    persist,
    saveNow,
    resetSchema,
    setCanvasSize,
    setScaleMode,
    selectComponent,
    selectGroup,
    hideSelectionChrome,
    isSelected,
    isGroupHighlighted,
    isCoSelected,
    getMoveTogetherIds,
    updateComponentLayout,
    moveSelectedBy,
    updateComponentProps,
    updateComponentName,
    addComponent,
    removeSelected,
    toggleComponentVisible,
    toggleComponentLocked,
    toggleGroupCollapsed,
    renameGroup,
    createGroupFromSelection,
    ungroupSelected,
    moveLayer,
    moveSelectionLayer,
  }
})
