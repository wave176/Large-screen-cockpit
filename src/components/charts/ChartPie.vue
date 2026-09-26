<script setup lang="ts">
/** 饼图/环形图；items 来自 useComponentData。 */
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import {
  getPropBoolean,
  getPropString,
  type NameValueItem,
} from '@/shared/utils/chartData'
import { chartPalette, colors } from '@/shared/theme/colors'

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const chartOption = computed(() => {
  const raw = liveData.value as { items?: NameValueItem[] }
  const title = getPropString(props.component, 'title', '饼图')
  const ring = getPropBoolean(props.component, 'ring', false)
  const items = raw.items?.length
    ? raw.items
    : [
        { name: 'A类', value: 36 },
        { name: 'B类', value: 28 },
        { name: 'C类', value: 22 },
        { name: 'D类', value: 14 },
      ]

  return {
    backgroundColor: 'transparent',
    color: [...chartPalette],
    animation: true,
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: { color: colors.textMuted, fontSize: 14 },
    },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: colors.textMuted } },
    series: [
      {
        type: 'pie',
        radius: ring ? ['42%', '68%'] : ['0%', '68%'],
        center: ['50%', '48%'],
        data: items,
        label: { color: colors.textSecondary, formatter: '{b}\n{d}%' },
        labelLine: { lineStyle: { color: colors.textDim } },
        itemStyle: { borderColor: colors.bgDeep, borderWidth: 2 },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: colors.primaryA45,
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
