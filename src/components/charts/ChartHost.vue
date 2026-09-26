<!--
  图表宿主：封装 vue-echarts，供各 Chart* / ProgressGauge 复用。

  Props：
  - option: ECharts option 对象（由父组件 computed 生成）
  - plain?: 为 true 时去掉内边距与深色底框（迷你图等嵌入场景）

  无 dataSource：本组件不读 Schema，只负责渲染与 resize。
-->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { setupEcharts } from '@/components/charts/echartsSetup'

setupEcharts()

withDefaults(
  defineProps<{
    option: Record<string, unknown>
    plain?: boolean
  }>(),
  { plain: false },
)

const chartRef = ref<{ resize?: () => void } | null>(null)

function forceResize() {
  requestAnimationFrame(() => {
    chartRef.value?.resize?.()
  })
}

onMounted(forceResize)

watch(
  () => chartRef.value,
  () => forceResize(),
)
</script>

<template>
  <div class="chart-host" :class="{ 'chart-host--plain': plain }">
    <VChart ref="chartRef" class="chart-host__canvas" :option="option" autoresize />
  </div>
</template>

<style scoped lang="scss">
.chart-host {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 4px;
  /* 不透明底，避免与下层组件叠在一起时“串图” */
  background: var(--dp-panel-a95);
  border: 1px solid var(--dp-primary-a18);
  overflow: hidden;

  &--plain {
    padding: 0;
    background: transparent;
    border: none;
  }
}

.chart-host__canvas {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
