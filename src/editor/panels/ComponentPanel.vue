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
  background: #0f172a;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 14px;
      color: #e2e8f0;
    }

    span {
      font-size: 12px;
      color: #64748b;
    }
  }

  &__group + &__group {
    margin-top: 16px;
  }

  &__category {
    margin-bottom: 8px;
    font-size: 12px;
    color: #64748b;
  }

  &__item {
    display: block;
    width: 100%;
    margin-bottom: 8px;
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 8px;
    background: rgba(15, 23, 42, 0.85);
    cursor: pointer;
    transition: 0.2s ease;

    &:hover {
      color: #38bdf8;
      border-color: rgba(56, 189, 248, 0.35);
      background: rgba(30, 41, 59, 0.95);
    }
  }
}
</style>
