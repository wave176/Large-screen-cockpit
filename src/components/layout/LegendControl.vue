<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getStaticData } from '@/shared/utils/chartData'

interface LegendItem {
  name?: string
  color?: string
}

const props = defineProps<{ component: ScreenComponent }>()

const items = computed(() => {
  const data = getStaticData<{ items?: LegendItem[] }>(props.component)
  return (
    data.items ?? [
      { name: '在线', color: '#63e2b7' },
      { name: '离线', color: '#64748b' },
      { name: '告警', color: '#f87171' },
    ]
  )
})
</script>

<template>
  <div class="legend">
    <div v-for="(item, idx) in items" :key="idx" class="legend__item">
      <i :style="{ background: item.color }" />
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.legend {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #cbd5e1;

    i {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  }
}
</style>
