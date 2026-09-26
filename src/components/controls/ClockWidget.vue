<!--
  实时时钟：每秒刷新本地时间。

  Props（经 component: ScreenComponent）：
  - props.format: 见 clockFormats 中的 value
  - props.fontSize?: number  字号，默认 24

  内容始终在框内；字号/格式变化时自动调整组件宽高。
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import type { ScreenComponent } from '@/shared/types/schema'
import { formatClock, normalizeClockFormat } from '@/components/controls/clockFormats'
import {
  measureTextBox,
  useContentFitLayout,
} from '@/shared/composables/useContentFitLayout'

const props = defineProps<{ component: ScreenComponent }>()

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)

const liveProps = computed(() => {
  const found = schema.value.components.find((item) => item.id === props.component.id)
  return found?.props ?? props.component.props
})

const nowText = ref('')
let timer: ReturnType<typeof setInterval> | undefined

const formatPattern = computed(() =>
  normalizeClockFormat(String(liveProps.value.format ?? '')),
)

const fontSize = computed(() => {
  const n = Number(liveProps.value.fontSize ?? 24)
  return Number.isFinite(n) && n > 0 ? n : 24
})

function tick() {
  nowText.value = formatClock(new Date(), formatPattern.value)
}

watch(formatPattern, () => tick())

useContentFitLayout({
  getComponentId: () => props.component.id,
  getDeps: () => [formatPattern.value, fontSize.value, nowText.value.length],
  measure: () =>
    measureTextBox(nowText.value || formatClock(new Date(), formatPattern.value), {
      fontSize: fontSize.value,
      fontWeight: 600,
      letterSpacing: '0.04em',
    }),
  paddingX: 28,
  paddingY: 24,
  minWidth: 96,
  minHeight: 40,
})

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="clock-widget">
    <span class="clock-widget__time" :style="{ fontSize: `${fontSize}px` }">{{ nowText }}</span>
  </div>
</template>

<style scoped lang="scss">
.clock-widget {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px dashed var(--dp-muted-a35);
  border-radius: 8px;
  background: var(--dp-panel-a65);

  &__time {
    font-weight: 600;
    color: var(--dp-color-primary);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    white-space: nowrap;
    line-height: 1.2;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
  }
}
</style>
