<!--
  进度环 / 水位半环（ECharts gauge）。

  Props（经 component: ScreenComponent）：
  - props.title: string
  - props.value: number   0–100
  - props.mode: 'ring' | 'water'
    ring  = 满环进度；water = 半环（0°–180°）示意水位

  百分比文字、标题、环宽随组件宽高自动缩放。
  注意：勿在此 import useScreenStore，会与 registry → ProgressGauge 形成循环依赖。
-->
<script setup lang="ts">
import { computed } from 'vue'
import ChartHost from '@/components/charts/ChartHost.vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { colors } from '@/shared/theme/colors'

const props = defineProps<{ component: ScreenComponent }>()

/** 画布传入的是 schema 里的响应式对象，直接读 layout 即可随拖拽更新 */
const scaleBase = computed(() => {
  const { width, height } = props.component.layout
  return Math.max(80, Math.min(width, height))
})

const titleFontSize = computed(() =>
  Math.max(11, Math.min(22, Math.round(scaleBase.value * 0.06))),
)
const detailFontSize = computed(() =>
  Math.max(14, Math.min(72, Math.round(scaleBase.value * 0.14))),
)
const progressWidth = computed(() =>
  Math.max(6, Math.min(28, Math.round(scaleBase.value * 0.065))),
)

const chartOption = computed(() => {
  const value = Number(props.component.props.value ?? 72)
  const title = String(props.component.props.title ?? '完成率')
  const mode = String(props.component.props.mode ?? 'ring')
  const titleSize = titleFontSize.value
  const detailSize = detailFontSize.value
  const lineWidth = progressWidth.value

  if (mode === 'water') {
    return {
      backgroundColor: 'transparent',
      animation: true,
      title: {
        text: title,
        left: 'center',
        top: Math.max(4, Math.round(scaleBase.value * 0.03)),
        textStyle: { color: colors.textMuted, fontSize: titleSize },
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
          progress: { show: true, width: lineWidth },
          axisLine: { lineStyle: { width: lineWidth, color: [[1, colors.split]] } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: detailSize,
            color: colors.primary,
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
      top: Math.max(4, Math.round(scaleBase.value * 0.03)),
      textStyle: { color: colors.textMuted, fontSize: titleSize },
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
          itemStyle: { color: colors.primary },
          width: lineWidth,
        },
        axisLine: { lineStyle: { width: lineWidth, color: [[1, colors.split]] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: detailSize,
          color: colors.textPrimary,
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
