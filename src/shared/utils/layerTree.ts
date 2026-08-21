/**
 * 图层树与 Schema 规范化工具。
 *
 * 依赖：
 * - schema 类型（LayerTreeNode / ScreenSchema 等）
 * - 组件注册表 getComponentMeta（补齐旧数据缺失字段时的默认名）
 *
 * 约定：空组不展示也不应长期留在 Schema 中（由 pruneEmptyGroups 清理）。
 */

import type { LayerTreeNode, ScreenComponent, ScreenSchema } from '@/shared/types/schema'
import { getComponentMeta } from '@/components/registry'

/**
 * 规范化整份 Schema：补 groups、补组件缺省字段，并剔除空组。
 * 加载远端/本地 JSON 后应先走此函数，再写入 store。
 */
export function normalizeSchema(raw: ScreenSchema): ScreenSchema {
  const schema: ScreenSchema = {
    ...raw,
    groups: raw.groups ?? [],
    components: raw.components.map((component) => normalizeComponent(component)),
  }
  pruneEmptyGroups(schema)
  return schema
}

/**
 * 为旧版/残缺组件补齐图层字段（name / groupId / locked / visible）。
 * 不改 layout、props、dataSource。
 */
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

/**
 * 构建图层面板树：先输出有子节点的组，再输出未分组组件。
 * 组内/顶层组件均已按图层顺序（高 z 在前）排列。
 */
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

/** 返回某组下全部成员组件 id（顺序与 components 数组一致，非图层序） */
export function getGroupMemberIds(schema: ScreenSchema, groupId: string): string[] {
  return schema.components.filter((item) => item.groupId === groupId).map((item) => item.id)
}

/**
 * 按图层列表从上到下的 id 顺序重写 zIndex（顶部最高）。
 * 拖拽图层排序后调用，保证画布叠放与列表一致。
 */
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

/** 当前 Schema 中组件 id，按图层顺序（高 z → 低 z） */
export function getOrderedComponentIds(schema: ScreenSchema): string[] {
  return sortByLayerOrder(schema.components).map((item) => item.id)
}
