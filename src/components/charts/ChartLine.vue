<script setup lang="ts">
/** 折线图；数据经 useComponentData（static/http/sql）。 */
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import {
  darkAxis,
  getPropString,
  type CategorySeriesData,
} from '@/shared/utils/chartData'
import { chartPalette, colors } from '@/shared/theme/colors'

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const chartOption = computed(() => {
  const data = liveData.value as CategorySeriesData
  const title = getPropString(props.component, 'title', '折线图')
  const categories = data.categories ?? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const seriesList =
    data.series?.length
      ? data.series
      : [{ name: '趋势', data: data.values ?? [12, 8, 15, 6, 10, 4, 7] }]

  return {
    backgroundColor: 'transparent',
    color: [...chartPalette.slice(0, 3)],
    animation: true,
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: colors.textMuted, fontSize: 14 },
    },
    tooltip: { trigger: 'axis' },
    legend: {
      show: seriesList.length > 1,
      top: 24,
      textStyle: { color: colors.textMuted },
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
      areaStyle: { opacity: 0.15 },
    })),
  }
})
</script>

<template>
  <ChartHost :option="chartOption" />
</template>
