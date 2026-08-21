<script setup lang="ts">
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropNumber, getPropString } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const chartOption = computed(() => {
  const value = getPropNumber(props.component, 'value', 72)
  const title = getPropString(props.component, 'title', '完成率')
  const mode = getPropString(props.component, 'mode', 'ring') // ring | water

  if (mode === 'water') {
    return {
      backgroundColor: 'transparent',
      animation: true,
      title: {
        text: title,
        left: 'center',
        top: 8,
        textStyle: { color: '#94a3b8', fontSize: 13 },
      },
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: '95%',
          center: ['50%', '70%'],
          progress: { show: true, width: 14 },
          axisLine: { lineStyle: { width: 14, color: [[1, '#1e293b']] } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 28,
            color: '#38bdf8',
            offsetCenter: [0, '-10%'],
            formatter: '{value}%',
          },
          data: [{ value }],
        },
      ],
    }
  }

  return {
    backgroundColor: 'transparent',
    animation: true,
    title: {
      text: title,
      left: 'center',
      top: 8,
      textStyle: { color: '#94a3b8', fontSize: 13 },
    },
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        min: 0,
        max: 100,
        radius: '80%',
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: { color: '#38bdf8' },
        },
        axisLine: { lineStyle: { width: 12, color: [[1, '#1e293b']] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 26,
          color: '#e2e8f0',
          formatter: '{value}%',
        },
        data: [{ value }],
      },
    ],
  }
})
</script>

<template>
  <ChartHost :option="chartOption" />
</template>
