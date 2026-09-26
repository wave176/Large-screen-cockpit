<script setup lang="ts">
/**
 * 组件库面板：按 category 展示可添加组件，点击即写入 schema（addComponent）。
 * 元数据来自 `@/components/registry`，与运行时视图注册表同源。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import { categoryLabels, componentMetas } from '@/components/registry'

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)

/** 将扁平 meta 列表按 category 分组，供模板按类渲染 */
const groupedMetas = computed(() => {
  const groups = new Map<string, typeof componentMetas>()
  for (const meta of componentMetas) {
    const list = groups.get(meta.category) ?? []
    list.push(meta)
    groups.set(meta.category, list)
  }
  return groups
})
</script>

<template>
  <div class="component-panel">
    <div class="component-panel__header">
      <h3>组件库</h3>
      <span>{{ schema.components.length }} 个组件</span>
    </div>

    <div v-for="[category, metas] in groupedMetas" :key="category" class="component-panel__group">
      <div class="component-panel__category">{{ categoryLabels[category as keyof typeof categoryLabels] }}</div>
      <button
        v-for="meta in metas"
        :key="`${meta.type}:${meta.label}`"
        type="button"
        class="component-panel__item"
        @click="screenStore.addComponent(meta.type, meta.label)"
      >
        {{ meta.label }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.component-panel {
  height: 100%;
  padding: 16px;
  overflow: auto;
  background: var(--dp-bg-panel);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

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

  &__group + &__group {
    margin-top: 16px;
  }

  &__category {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--dp-text-dim);
  }

  &__item {
    display: block;
    width: 100%;
    margin-bottom: 8px;
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    color: var(--dp-text-secondary);
    border: 1px solid var(--dp-border);
    border-radius: 8px;
    background: var(--dp-panel-a85);
    cursor: pointer;
    transition: 0.2s ease;

    &:hover {
      color: var(--dp-color-primary);
      border-color: var(--dp-primary-a35);
      background: rgba(30, 41, 59, 0.95);
    }
  }
}
</style>
