<!--
  数字翻牌器：目标值变化时做短动画过渡，按位数补零展示。

  Props（经 component: ScreenComponent）：
  - props.digits / fontSize / prefix / suffix

  数据（dataSource）：
  - { value: number }  翻牌目标值；样例见 getDefaultDataSource('MetricFlipper')
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import { useContentFitLayout } from '@/shared/composables/useContentFitLayout'

const props = defineProps<{ component: ScreenComponent }>()

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)
const { data: liveData } = useComponentData(() => props.component)

const liveProps = computed(() => {
  const found = schema.value.components.find((item) => item.id === props.component.id)
  return found?.props ?? props.component.props
})

const display = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const target = computed(() => {
  const fromData = liveData.value.value
  if (fromData !== undefined && fromData !== null && fromData !== '') {
    const n = Number(fromData)
    if (Number.isFinite(n)) return n
  }
  const fallback = Number(liveProps.value.value ?? 0)
  return Number.isFinite(fallback) ? fallback : 0
})

const prefix = computed(() => String(liveProps.value.prefix ?? ''))
const suffix = computed(() => String(liveProps.value.suffix ?? ''))
const digitCount = computed(() => {
  const n = Number(liveProps.value.digits ?? 5)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 5
})
const fontSize = computed(() => {
  const n = Number(liveProps.value.fontSize ?? 28)
  return Number.isFinite(n) && n > 0 ? n : 28
})

const digitWidth = computed(() => Math.round(fontSize.value * 1.28))
const digitHeight = computed(() => Math.round(fontSize.value * 1.72))
const affixSize = computed(() => Math.round(fontSize.value * 0.64))
const gap = computed(() => Math.max(4, Math.round(fontSize.value * 0.22)))

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
  String(Math.abs(display.value)).padStart(digitCount.value, '0').split(''),
)

useContentFitLayout({
  getComponentId: () => props.component.id,
  getDeps: () => [
    digitCount.value,
    fontSize.value,
    prefix.value,
    suffix.value,
    digits.value.length,
  ],
  measure: () => {
    const host = document.createElement('div')
    host.style.cssText =
      'position:absolute;left:-99999px;top:0;visibility:hidden;display:flex;align-items:center;pointer-events:none'
    host.style.gap = `${gap.value}px`

    if (prefix.value) {
      const affix = document.createElement('span')
      affix.textContent = prefix.value
      affix.style.cssText = `font-size:${affixSize.value}px;font-weight:600;white-space:nowrap`
      host.appendChild(affix)
    }

    for (let i = 0; i < digitCount.value; i += 1) {
      const card = document.createElement('span')
      card.textContent = '0'
      card.style.cssText = [
        `width:${digitWidth.value}px`,
        `min-width:${digitWidth.value}px`,
        `height:${digitHeight.value}px`,
        'display:inline-flex',
        'align-items:center',
        'justify-content:center',
        `font-size:${fontSize.value}px`,
        'font-weight:700',
        'box-sizing:border-box',
      ].join(';')
      host.appendChild(card)
    }

    if (suffix.value) {
      const affix = document.createElement('span')
      affix.textContent = suffix.value
      affix.style.cssText = `font-size:${affixSize.value}px;font-weight:600;white-space:nowrap`
      host.appendChild(affix)
    }

    document.body.appendChild(host)
    const width = host.offsetWidth
    const height = host.offsetHeight
    document.body.removeChild(host)
    return { width, height }
  },
  paddingX: 20,
  paddingY: 16,
  minWidth: 120,
  minHeight: 48,
})
</script>

<template>
  <div class="flipper" :style="{ '--flipper-gap': `${gap}px` }">
    <div class="flipper__row">
      <span
        v-if="prefix"
        class="flipper__affix"
        :style="{ fontSize: `${affixSize}px` }"
      >{{ prefix }}</span>
      <span
        v-for="(d, idx) in digits"
        :key="`${idx}-${d}`"
        class="flipper__digit"
        :style="{
          width: `${digitWidth}px`,
          minWidth: `${digitWidth}px`,
          height: `${digitHeight}px`,
          fontSize: `${fontSize}px`,
        }"
      >{{ d }}</span>
      <span
        v-if="suffix"
        class="flipper__affix"
        :style="{ fontSize: `${affixSize}px` }"
      >{{ suffix }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flipper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &__row {
    display: flex;
    align-items: center;
    gap: var(--flipper-gap, 6px);
    max-width: 100%;
  }

  &__digit {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    font-weight: 700;
    color: var(--dp-text-highlight);
    background: linear-gradient(180deg, var(--dp-bg-elevated), var(--dp-bg-panel));
    border: 1px solid var(--dp-primary-a35);
    border-radius: 6px;
    box-shadow: inset 0 -8px 12px rgba(0, 0, 0, 0.35);
  }

  &__affix {
    flex: none;
    font-weight: 600;
    color: var(--dp-color-primary);
    white-space: nowrap;
  }
}
</style>
