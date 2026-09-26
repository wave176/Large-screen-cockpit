<script setup lang="ts">
/** 雷达图；indicators + series 来自 useComponentData。 */
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import { getPropString } from '@/shared/utils/chartData'
import { colors } from '@/shared/theme/colors'

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const chartOption = computed(() => {
  const data = liveData.value as {
    indicators?: Array<{ name: string; max?: number }>
    series?: Array<{ name?: string; value?: number[] }>
  }
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
    color: [colors.primary, colors.success],
    animation: true,
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: colors.textMuted, fontSize: 14 },
    },
    tooltip: {},
    legend: { bottom: 0, textStyle: { color: colors.textMuted } },
    radar: {
      indicator: indicators,
      center: ['50%', '52%'],
      radius: '58%',
      axisName: { color: colors.textMuted },
      splitLine: { lineStyle: { color: colors.split } },
      splitArea: { areaStyle: { color: [colors.panelA20, colors.elevatedA25] } },
      axisLine: { lineStyle: { color: colors.axis } },
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
