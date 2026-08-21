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

export type SaveStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error'

function cloneSchema(schema: ScreenSchema): ScreenSchema {
  return JSON.parse(JSON.stringify(schema)) as ScreenSchema
}

const DEFAULT_SCREEN_ID = defaultScreenSchema.id

export const useScreenStore = defineStore('screen', () => {
  const schema = ref<ScreenSchema>(cloneSchema(defaultScreenSchema))
  const selectedIds = ref<string[]>([])
  const selectedGroupId = ref<string | null>(null)
  const editorPreviewScale = ref(0.75)
  const propertyPanelVisible = ref(true)

  /** 文档版本（来自 JSON 文件 / 模拟后端） */
  const documentVersion = ref(1)
  const documentUpdatedAt = ref<string | null>(null)
  const saveStatus = ref<SaveStatus>('idle')
  const saveError = ref<string | null>(null)
  const hydrated = ref(false)

  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let saveSeq = 0

  const selectedComponents = computed(() =>
    schema.value.components.filter((item) => selectedIds.value.includes(item.id)),
  )

  const primarySelected = computed(() => selectedComponents.value[0] ?? null)

  const selectedComponent = computed(() => primarySelected.value)

  /** 从 data/screens/*.json 加载（模拟 GET /api/screens/:id） */
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

  /** 立即写入 JSON 文件（模拟 PUT） */
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

  /** 防抖自动保存 → data/screens/{id}.json */
  function persist() {
    if (!hydrated.value) return
    saveStatus.value = 'saving'
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void saveNow()
    }, 600)
  }

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

  function selectComponent(id: string | null, options?: { append?: boolean }) {
    if (!id) {
      selectedGroupId.value = null
      selectedIds.value = []
      return
    }

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
      selectedIds.value = [id, ...members.filter((memberId) => memberId !== id)]
      return
    }

    selectedGroupId.value = null
    selectedIds.value = [id]
  }

  function selectGroup(groupId: string | null) {
    selectedGroupId.value = groupId
    if (!groupId) {
      selectedIds.value = []
      return
    }
    selectedIds.value = getGroupMemberIds(schema.value, groupId)
  }

  function isSelected(id: string): boolean {
    return selectedIds.value.includes(id)
  }

  function isGroupHighlighted(id: string): boolean {
    if (!selectedGroupId.value) return false
    if (selectedIds.value[0] === id) return false
    const component = schema.value.components.find((item) => item.id === id)
    return component?.groupId === selectedGroupId.value
  }

  function isCoSelected(id: string): boolean {
    return selectedIds.value.includes(id) && selectedIds.value[0] !== id
  }

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

  function cleanEmptyGroups() {
    const removed = pruneEmptyGroups(schema.value)
    if (selectedGroupId.value && removed.includes(selectedGroupId.value)) {
      selectedGroupId.value = null
    }
    return removed
  }

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

  function moveSelectionLayer(direction: 'up' | 'down' | 'top' | 'bottom') {
    selectedIds.value.forEach((id) => moveLayer(id, direction))
  }

  return {
    schema,
    selectedIds,
    selectedGroupId,
    editorPreviewScale,
    propertyPanelVisible,
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
