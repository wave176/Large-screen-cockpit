import type { LayerTreeNode, ScreenComponent, ScreenSchema } from '@/shared/types/schema'
import { getComponentMeta } from '@/components/registry'

export function normalizeSchema(raw: ScreenSchema): ScreenSchema {
  const schema: ScreenSchema = {
    ...raw,
    groups: raw.groups ?? [],
    components: raw.components.map((component) => normalizeComponent(component)),
  }
  pruneEmptyGroups(schema)
  return schema
}

export function normalizeComponent(component: ScreenComponent): ScreenComponent {
  const meta = getComponentMeta(component.type)
  return {
    ...component,
    name: component.name ?? meta?.label ?? component.type,
    groupId: component.groupId ?? null,
    locked: component.locked ?? false,
    visible: component.visible ?? true,
  }
}

/** 删除没有任何子组件的空组，返回被删除的组 id */
export function pruneEmptyGroups(schema: ScreenSchema): string[] {
  const removed: string[] = []
  schema.groups = schema.groups.filter((group) => {
    const hasChildren = schema.components.some((item) => item.groupId === group.id)
    if (!hasChildren) {
      removed.push(group.id)
      return false
    }
    return true
  })
  return removed
}

/** 按 zIndex 从高到低排序（图层列表顶部 = 画布最上层） */
export function sortByLayerOrder(components: ScreenComponent[]): ScreenComponent[] {
  return [...components].sort((a, b) => b.layout.zIndex - a.layout.zIndex)
}

export function buildLayerTree(schema: ScreenSchema): LayerTreeNode[] {
  const sorted = sortByLayerOrder(schema.components)
  const groupedIds = new Set<string>()
  const nodes: LayerTreeNode[] = []

  for (const group of schema.groups) {
    const children = sorted.filter((item) => item.groupId === group.id)
    // 空组不展示（并应由 pruneEmptyGroups 从 Schema 中移除）
    if (children.length === 0) continue
    children.forEach((item) => groupedIds.add(item.id))
    nodes.push({ kind: 'group', group, children })
  }

  for (const component of sorted) {
    if (!groupedIds.has(component.id)) {
      nodes.push({ kind: 'component', component })
    }
  }

  return nodes
}

export function getGroupMemberIds(schema: ScreenSchema, groupId: string): string[] {
  return schema.components.filter((item) => item.groupId === groupId).map((item) => item.id)
}

/** 按 zIndex 赋值：orderedIds 顺序为图层列表从上到下（zIndex 从高到低） */
export function reindexZOrders(components: ScreenComponent[], topToBottomIds: string[]): void {
  const idToZ = new Map<string, number>()
  topToBottomIds.forEach((id, index) => {
    idToZ.set(id, topToBottomIds.length - index)
  })

  components.forEach((component) => {
    const next = idToZ.get(component.id)
    if (next !== undefined) {
      component.layout.zIndex = next
    }
  })
}

export function getOrderedComponentIds(schema: ScreenSchema): string[] {
  return sortByLayerOrder(schema.components).map((item) => item.id)
}
