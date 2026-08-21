<!--
  迷你趋势图：无坐标轴，适合指标旁嵌套展示。

  Props（经 component: ScreenComponent）：
  - props.title?: string  有值时显示上方小标题
  - props.color?: string  折线/面积主色，默认 #38bdf8

  dataSource.static.data：
  - values: number[]
-->
<script setup lang="ts">
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropString, getStaticData } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const chartOption = computed(() => {
  const data = getStaticData<{ values?: number[] }>(props.component)
  const values = data.values?.length ? data.values : [3, 5, 4, 8, 6, 9, 7, 10, 8, 12]
  const color = getPropString(props.component, 'color', '#38bdf8')

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
    color: #94a3b8;
    flex: none;
  }

  &__chart {
    flex: 1;
    min-height: 0;
  }
}
</style>
