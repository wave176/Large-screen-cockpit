<script setup lang="ts">
/** 迷你趋势图；values 来自 useComponentData。 */
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import { getPropString } from '@/shared/utils/chartData'
import { colors } from '@/shared/theme/colors'

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const chartOption = computed(() => {
  const raw = liveData.value as { values?: number[] }
  const values = raw.values?.length ? raw.values : [3, 5, 4, 8, 6, 9, 7, 10, 8, 12]
  const color = getPropString(props.component, 'color', colors.primary)

  return {
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { type: 'category', show: false, data: values.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}66` },
              { offset: 1, color: `${color}00` },
            ],
          },
        },
      },
    ],
  }
})
</script>

<template>
  <div class="sparkline">
    <div v-if="component.props.title" class="sparkline__title">
      {{ component.props.title }}
    </div>
    <ChartHost class="sparkline__chart" plain :option="chartOption" />
  </div>
</template>

<style scoped lang="scss">
.sparkline {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__title {
    font-size: 12px;
    color: var(--dp-text-muted);
    flex: none;
  }

  &__chart {
    flex: 1;
    min-height: 0;
  }
}
</style>
