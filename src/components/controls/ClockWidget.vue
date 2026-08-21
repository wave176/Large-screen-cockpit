<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'

defineProps<{ component: ScreenComponent }>()

const nowText = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatNow(): string {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

onMounted(() => {
  nowText.value = formatNow()
  timer = setInterval(() => {
    nowText.value = formatNow()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="clock-widget">
    <span class="clock-widget__label">当前时间</span>
    <span class="clock-widget__time">{{ nowText }}</span>
  </div>
</template>

<style scoped lang="scss">
.clock-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.65);

  &__label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
  }

  &__time {
    font-size: 24px;
    font-weight: 600;
    color: #38bdf8;
    font-variant-numeric: tabular-nums;
  }
}
</style>
