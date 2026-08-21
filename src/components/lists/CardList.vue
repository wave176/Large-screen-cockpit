<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropString, getStaticData } from '@/shared/utils/chartData'

interface CardItem {
  title?: string
  value?: string | number
  tag?: string
}

const props = defineProps<{ component: ScreenComponent }>()

const title = computed(() => getPropString(props.component, 'title', '卡片列表'))
const items = computed(() => {
  const data = getStaticData<{ items?: CardItem[] }>(props.component)
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
    color: #94a3b8;
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
    border: 1px solid rgba(56, 189, 248, 0.2);
    background: rgba(15, 23, 42, 0.75);
  }

  &__name {
    font-size: 12px;
    color: #94a3b8;
  }

  &__value {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 700;
    color: #e2e8f0;
  }

  &__tag {
    margin-top: 8px;
    display: inline-block;
    font-size: 11px;
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-radius: 999px;
    padding: 2px 8px;
  }
}
</style>
