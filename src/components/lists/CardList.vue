<!--
  卡片列表：两列网格展示摘要指标。

  Props：
  - props.title: string

  dataSource.static.data：
  - items: { title?: string, value?: string | number, tag?: string }[]
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import { getPropString } from '@/shared/utils/chartData'

interface CardItem {
  title?: string
  value?: string | number
  tag?: string
}

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const title = computed(() => getPropString(props.component, 'title', '卡片列表'))
const items = computed(() => {
  const data = liveData.value as { items?: CardItem[] }
  return (
    data.items ?? [
      { title: '在线设备', value: 128, tag: '正常' },
      { title: '离线设备', value: 6, tag: '关注' },
      { title: '今日告警', value: 14, tag: '告警' },
      { title: '待处理工单', value: 9, tag: '处理中' },
    ]
  )
})
</script>

<template>
  <div class="card-list">
    <div class="card-list__title">{{ title }}</div>
    <div class="card-list__grid">
      <div v-for="(item, idx) in items" :key="idx" class="card-list__item">
        <div class="card-list__name">{{ item.title }}</div>
        <div class="card-list__value">{{ item.value }}</div>
        <div class="card-list__tag">{{ item.tag }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-list {
  width: 100%;
  height: 100%;
  padding: 10px;
  overflow: auto;

  &__title {
    font-size: 13px;
    color: var(--dp-text-muted);
    margin-bottom: 10px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  &__item {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--dp-primary-a20);
    background: var(--dp-panel-a75);
  }

  &__name {
    font-size: 12px;
    color: var(--dp-text-muted);
  }

  &__value {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 700;
    color: var(--dp-text-primary);
  }

  &__tag {
    margin-top: 8px;
    display: inline-block;
    font-size: 11px;
    color: var(--dp-color-primary);
    border: 1px solid var(--dp-primary-a35);
    border-radius: 999px;
    padding: 2px 8px;
  }
}
</style>
