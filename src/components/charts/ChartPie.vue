<script setup lang="ts">
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import {
  getPropBoolean,
  getPropString,
  getStaticData,
  type NameValueItem,
} from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const chartOption = computed(() => {
  const raw = getStaticData<{ items?: NameValueItem[] }>(props.component)
  const title = getPropString(props.component, 'title', '饼图')
  const ring = getPropBoolean(props.component, 'ring', false)
  const items = (raw.items?.length ? raw.items : null) ?? [
    { name: 'A类', value: 36 },
    { name: 'B类', value: 28 },
    { name: 'C类', value: 22 },
    { name: 'D类', value: 14 },
  ]

  return {
    backgroundColor: 'transparent',
    color: ['#38bdf8', '#63e2b7', '#fbbf24', '#a78bfa', '#f472b6'],
    animation: true,
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: '#94a3b8', fontSize: 14 },
    },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { color: '#94a3b8' },
    },
    series: [
      {
        type: 'pie',
        radius: ring ? ['42%', '68%'] : ['0%', '68%'],
        center: ['50%', '48%'],
        data: items,
        label: { color: '#cbd5e1', formatter: '{b}\n{d}%' },
        labelLine: { lineStyle: { color: '#64748b' } },
        itemStyle: { borderColor: '#0d1b2a', borderWidth: 2 },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(56, 189, 248, 0.45)',
          },
        },
      },
    ],
  }
})
</script>

<template>
  <ChartHost :option="chartOption" />
</template>
