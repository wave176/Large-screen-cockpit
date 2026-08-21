<!--
  雷达图：多维指标对比。

  Props（经 component: ScreenComponent）：
  - props.title: string

  dataSource.static.data：
  - indicators: { name: string, max?: number }[]
  - series: { name?: string, value?: number[] }[]  value 长度应与 indicators 对齐
-->
<script setup lang="ts">
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropString, getStaticData } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const chartOption = computed(() => {
  const data = getStaticData<{
    indicators?: Array<{ name: string; max?: number }>
    series?: Array<{ name?: string; value?: number[] }>
  }>(props.component)

  const title = getPropString(props.component, 'title', '雷达图')
  const indicators = data.indicators?.length
    ? data.indicators
    : [
        { name: '性能', max: 100 },
        { name: '稳定', max: 100 },
        { name: '安全', max: 100 },
        { name: '体验', max: 100 },
        { name: '成本', max: 100 },
      ]
  const series = data.series?.length
    ? data.series
    : [
        { name: '本期', value: [80, 72, 90, 68, 75] },
        { name: '上期', value: [65, 70, 78, 60, 80] },
      ]

  return {
    backgroundColor: 'transparent',
    color: ['#38bdf8', '#63e2b7'],
    animation: true,
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: '#94a3b8', fontSize: 14 },
    },
    tooltip: {},
    legend: { bottom: 0, textStyle: { color: '#94a3b8' } },
    radar: {
      indicator: indicators,
      center: ['50%', '52%'],
      radius: '58%',
      axisName: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#1e293b' } },
      splitArea: { areaStyle: { color: ['rgba(15,23,42,0.2)', 'rgba(30,41,59,0.25)'] } },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    series: [
      {
        type: 'radar',
        data: series.map((item) => ({
          name: item.name,
          value: item.value,
          areaStyle: { opacity: 0.25 },
        })),
      },
    ],
  }
})
</script>

<template>
  <ChartHost :option="chartOption" />
</template>
