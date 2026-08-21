<!--
  柱状图（含纵向 / 横向 / 堆叠三种 mode）。

  Props（经 component: ScreenComponent）：
  - props.title: string
  - props.mode: 'vertical' | 'horizontal' | 'stack'
  - props.color?: string[]  系列色板

  dataSource.static.data（CategorySeriesData）：
  - categories: string[]
  - values?: number[]           单系列时用
  - series?: { name, data }[]   多系列 / 堆叠时用
-->
<script setup lang="ts">
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import {
  darkAxis,
  getPropString,
  getStaticData,
  type CategorySeriesData,
} from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const chartOption = computed(() => {
  const data = getStaticData<CategorySeriesData>(props.component)
  const mode = getPropString(props.component, 'mode', 'vertical') // vertical | horizontal | stack
  const title = getPropString(props.component, 'title', '柱状图')
  const colors = (props.component.props.color as string[] | undefined) ?? [
    '#38bdf8',
    '#63e2b7',
    '#fbbf24',
    '#a78bfa',
  ]
  const categories = data.categories ?? ['A', 'B', 'C', 'D']
  const seriesList =
    data.series?.length
      ? data.series
      : [{ name: '数值', data: data.values ?? [12, 20, 15, 28] }]

  const isHorizontal = mode === 'horizontal'
  const isStack = mode === 'stack'

  const categoryAxis = {
    type: 'category' as const,
    data: categories,
    ...darkAxis,
  }
  const valueAxis = {
    type: 'value' as const,
    ...darkAxis,
  }

  return {
    backgroundColor: 'transparent',
    color: colors,
    animation: true,
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: '#94a3b8', fontSize: 14 },
    },
    tooltip: { trigger: 'axis' },
    legend: {
      show: seriesList.length > 1,
      top: 24,
      textStyle: { color: '#94a3b8' },
    },
    grid: { left: 48, right: 24, top: seriesList.length > 1 ? 56 : 40, bottom: 32 },
    xAxis: isHorizontal ? valueAxis : categoryAxis,
    yAxis: isHorizontal ? categoryAxis : valueAxis,
    series: seriesList.map((item) => ({
      name: item.name ?? '系列',
      type: 'bar',
      stack: isStack ? 'total' : undefined,
      data: item.data ?? [],
      barWidth: isStack ? '50%' : '40%',
      itemStyle: { borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
    })),
  }
})
</script>

<template>
  <ChartHost :option="chartOption" />
</template>
