<!--
  数字翻牌器：目标值变化时做短动画过渡，按位数补零展示。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.title: string
  - props.value: number       目标数值
  - props.digits: number      最少位数（左侧补 0）
  - props.prefix / suffix: string  前后缀文案
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropNumber, getPropString } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const display = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const target = computed(() => getPropNumber(props.component, 'value', 12345))
const prefix = computed(() => getPropString(props.component, 'prefix', ''))
const suffix = computed(() => getPropString(props.component, 'suffix', ''))
const title = computed(() => getPropString(props.component, 'title', '实时指标'))

function animateTo(next: number) {
  const start = display.value
  const diff = next - start
  const steps = 24
  let i = 0
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    i += 1
    display.value = Math.round(start + (diff * i) / steps)
    if (i >= steps && timer) clearInterval(timer)
  }, 30)
}

watch(target, (v) => animateTo(v), { immediate: true })

onMounted(() => animateTo(target.value))
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const digits = computed(() =>
  String(Math.abs(display.value))
    .padStart(getPropNumber(props.component, 'digits', 5), '0')
    .split(''),
)
</script>

<template>
  <div class="flipper">
    <div class="flipper__title">{{ title }}</div>
    <div class="flipper__row">
      <span v-if="prefix" class="flipper__affix">{{ prefix }}</span>
      <span v-for="(d, idx) in digits" :key="`${idx}-${d}`" class="flipper__digit">{{ d }}</span>
      <span v-if="suffix" class="flipper__affix">{{ suffix }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flipper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &__title {
    font-size: 13px;
    color: var(--dp-text-muted);
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__digit {
    min-width: 36px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: var(--dp-text-highlight);
    background: linear-gradient(180deg, var(--dp-bg-elevated), var(--dp-bg-panel));
    border: 1px solid var(--dp-primary-a35);
    border-radius: 6px;
    box-shadow: inset 0 -8px 12px rgba(0, 0, 0, 0.35);
  }

  &__affix {
    font-size: 18px;
    color: var(--dp-color-primary);
  }
}
</style>
