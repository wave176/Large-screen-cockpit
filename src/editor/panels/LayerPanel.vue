<script setup lang="ts">
/**
 * 图层面板：树形展示分组与组件，支持成组/解组、层级上下移、显隐与锁定。
 * 树结构由 buildLayerTree 从 schema 派生；选中与画布共用 screenStore。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton, NInput, NSpace } from 'naive-ui'
import { useScreenStore } from '@/store/screen'
import { buildLayerTree } from '@/shared/utils/layerTree'
import { getComponentMeta } from '@/components/registry'

const screenStore = useScreenStore()
const { schema, selectedIds, selectedGroupId } = storeToRefs(screenStore)

const layerTree = computed(() => buildLayerTree(schema.value))

/** Ctrl/Meta 多选，与画布选中逻辑一致 */
function handleSelectComponent(id: string, event: MouseEvent) {
  screenStore.selectComponent(id, { append: event.ctrlKey || event.metaKey })
}

/** 选中整组：store 会把组成员填入 selectedIds */
function handleSelectGroup(groupId: string) {
  screenStore.selectGroup(groupId)
}

function getTypeLabel(type: string): string {
  return getComponentMeta(type)?.label ?? type
}
</script>

<template>
  <div class="layer-panel">
    <div class="layer-panel__header">
      <h3>图层</h3>
      <span>{{ schema.components.length }} 项</span>
    </div>

    <NSpace size="small" class="layer-panel__actions">
      <NButton size="tiny" :disabled="selectedIds.length < 1" @click="screenStore.createGroupFromSelection()">
        成组
      </NButton>
      <NButton
        size="tiny"
        :disabled="!selectedGroupId && selectedIds.length === 0"
        @click="screenStore.ungroupSelected()"
      >
        解组
      </NButton>
      <NButton size="tiny" :disabled="selectedIds.length !== 1" @click="screenStore.moveSelectionLayer('up')">
        上移
      </NButton>
      <NButton size="tiny" :disabled="selectedIds.length !== 1" @click="screenStore.moveSelectionLayer('down')">
        下移
      </NButton>
    </NSpace>

    <div class="layer-panel__list">
      <template v-for="node in layerTree" :key="node.kind === 'group' ? node.group.id : node.component.id">
        <!-- 组节点 -->
        <div v-if="node.kind === 'group'" class="layer-group">
          <div
            class="layer-group__header"
            :class="{ 'layer-group__header--active': selectedGroupId === node.group.id }"
            @click="handleSelectGroup(node.group.id)"
          >
            <button
              type="button"
              class="layer-item__icon-btn"
              @click.stop="screenStore.toggleGroupCollapsed(node.group.id)"
            >
              {{ node.group.collapsed ? '▶' : '▼' }}
            </button>
            <span class="layer-group__icon">📁</span>
            <NInput
              size="tiny"
              :value="node.group.name"
              class="layer-group__name"
              @click.stop
              @update:value="(v) => screenStore.renameGroup(node.group.id, v)"
            />
            <span class="layer-group__count">{{ node.children.length }}</span>
          </div>

          <div v-if="!node.group.collapsed" class="layer-group__children">
            <div
              v-for="child in node.children"
              :key="child.id"
              class="layer-item layer-item--nested"
              :class="{
                'layer-item--active': screenStore.isSelected(child.id),
                'layer-item--hidden': !child.visible,
              }"
              @click="handleSelectComponent(child.id, $event)"
            >
              <span class="layer-item__type">{{ getTypeLabel(child.type) }}</span>
              <NInput
                size="tiny"
                :value="child.name"
                class="layer-item__name"
                @click.stop
                @update:value="(v) => screenStore.updateComponentName(child.id, v)"
              />
              <div class="layer-item__tools">
                <button
                  type="button"
                  class="layer-item__icon-btn"
                  :title="child.visible ? '隐藏' : '显示'"
                  @click.stop="screenStore.toggleComponentVisible(child.id)"
                >
                  {{ child.visible ? '👁' : '🚫' }}
                </button>
                <button
                  type="button"
                  class="layer-item__icon-btn"
                  :title="child.locked ? '解锁' : '锁定'"
                  @click.stop="screenStore.toggleComponentLocked(child.id)"
                >
                  {{ child.locked ? '🔒' : '🔓' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 未分组组件 -->
        <div
          v-else
          class="layer-item"
          :class="{
            'layer-item--active': screenStore.isSelected(node.component.id),
            'layer-item--hidden': !node.component.visible,
          }"
          @click="handleSelectComponent(node.component.id, $event)"
        >
          <span class="layer-item__type">{{ getTypeLabel(node.component.type) }}</span>
          <NInput
            size="tiny"
            :value="node.component.name"
            class="layer-item__name"
            @click.stop
            @update:value="(v) => screenStore.updateComponentName(node.component.id, v)"
          />
          <div class="layer-item__tools">
            <button
              type="button"
              class="layer-item__icon-btn"
              :title="node.component.visible ? '隐藏' : '显示'"
              @click.stop="screenStore.toggleComponentVisible(node.component.id)"
            >
              {{ node.component.visible ? '👁' : '🚫' }}
            </button>
            <button
              type="button"
              class="layer-item__icon-btn"
              :title="node.component.locked ? '解锁' : '锁定'"
              @click.stop="screenStore.toggleComponentLocked(node.component.id)"
            >
              {{ node.component.locked ? '🔒' : '🔓' }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layer-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 14px;
      color: var(--dp-text-primary);
    }

    span {
      font-size: 12px;
      color: var(--dp-text-dim);
    }
  }

  &__actions {
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  &__list {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.layer-group {
  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    background: rgba(30, 41, 59, 0.65);
    border: 1px solid transparent;

    &--active {
      border-color: var(--dp-primary-a45);
      background: rgba(30, 58, 138, 0.35);
    }
  }

  &__icon {
    font-size: 12px;
  }

  &__name {
    flex: 1;
  }

  &__count {
    font-size: 11px;
    color: var(--dp-text-dim);
  }

  &__children {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: var(--dp-panel-a85);
  border: 1px solid var(--dp-muted-a12);

  &--nested {
    margin-left: 18px;
  }

  &--active {
    border-color: var(--dp-primary-a45);
    background: rgba(30, 58, 138, 0.28);
  }

  &--hidden {
    opacity: 0.55;
  }

  &__type {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--dp-text-dim);
    width: 52px;
  }

  &__name {
    flex: 1;
    min-width: 0;
  }

  &__tools {
    display: flex;
    gap: 2px;
  }

  &__icon-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 2px 4px;
    font-size: 12px;
    line-height: 1;
    opacity: 0.85;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
