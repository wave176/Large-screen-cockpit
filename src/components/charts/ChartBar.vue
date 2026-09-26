<script setup lang="ts">
/**
 * 柱状图（纵向 / 横向 / 堆叠）。
 * 数据：useComponentData → categories / values / series（支持 static | http | sql）。
 */
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
  const mode = getPropString(props.component, 'mode', 'vertical')
  const title = getPropString(props.component, 'title', '柱状图')
  const palette = (props.component.props.color as string[] | undefined) ?? [
    ...chartPalette.slice(0, 4),
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
    color: palette,
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
