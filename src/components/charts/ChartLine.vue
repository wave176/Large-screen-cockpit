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
  const title = getPropString(props.component, 'title', '折线图')
  const categories = data.categories ?? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const seriesList =
    data.series?.length
      ? data.series
      : [{ name: '趋势', data: data.values ?? [12, 8, 15, 6, 10, 4, 7] }]

  return {
    backgroundColor: 'transparent',
    color: ['#38bdf8', '#63e2b7', '#fbbf24'],
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
    xAxis: { type: 'category', data: categories, boundaryGap: false, ...darkAxis },
    yAxis: { type: 'value', ...darkAxis },
    series: seriesList.map((item) => ({
      name: item.name ?? '系列',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: item.data ?? [],
      areaStyle: {
        opacity: 0.15,
      },
    })),
  }
})
</script>

<template>
  <ChartHost :option="chartOption" />
</template>
