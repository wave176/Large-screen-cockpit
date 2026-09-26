<!--
  指标卡：主数值 + 单位 + 可选同比/环比。

  Props（经 component: ScreenComponent）：
  - props.title / value / unit
  - props.fontSize?: number      主数值字号，默认 36
  - props.showYoy?: boolean      是否显示同比，默认 true
  - props.showMom?: boolean      是否显示环比，默认 true
  - props.yoy / mom: number
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import type { ScreenComponent } from '@/shared/types/schema'
import { useContentFitLayout } from '@/shared/composables/useContentFitLayout'

const props = defineProps<{ component: ScreenComponent }>()

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)

const liveProps = computed(() => {
  const found = schema.value.components.find((item) => item.id === props.component.id)
  return found?.props ?? props.component.props
})

const title = computed(() => String(liveProps.value.title ?? '关键指标'))
const value = computed(() => Number(liveProps.value.value ?? 86.5))
const unit = computed(() => String(liveProps.value.unit ?? '%'))
const yoy = computed(() => Number(liveProps.value.yoy ?? 0))
const mom = computed(() => Number(liveProps.value.mom ?? 0))

const fontSize = computed(() => {
  const n = Number(liveProps.value.fontSize ?? 36)
  return Number.isFinite(n) && n > 0 ? n : 36
})

const showYoy = computed(() => {
  const v = liveProps.value.showYoy
  if (v === undefined || v === null || v === '') return true
  return Boolean(v)
})

const showMom = computed(() => {
  const v = liveProps.value.showMom
  if (v === undefined || v === null || v === '') return true
  return Boolean(v)
})

const showTrends = computed(() => showYoy.value || showMom.value)

const titleSize = computed(() => Math.max(12, Math.round(fontSize.value * 0.36)))
const unitSize = computed(() => Math.max(12, Math.round(fontSize.value * 0.39)))
const trendSize = computed(() => Math.max(11, Math.round(fontSize.value * 0.33)))

useContentFitLayout({
  getComponentId: () => props.component.id,
  getDeps: () => [
    title.value,
    value.value,
    unit.value,
    fontSize.value,
    showYoy.value,
    showMom.value,
    yoy.value,
    mom.value,
  ],
  measure: () => {
    const host = document.createElement('div')
    host.style.cssText = [
      'position:absolute',
      'left:-99999px',
      'top:0',
      'visibility:hidden',
      'display:flex',
      'flex-direction:column',
      'justify-content:center',
      'gap:8px',
      'padding:16px 18px',
      'box-sizing:border-box',
      'pointer-events:none',
      'min-width:120px',
    ].join(';')

    const titleEl = document.createElement('div')
    titleEl.textContent = title.value || ' '
    titleEl.style.cssText = `font-size:${titleSize.value}px;line-height:1.2;white-space:nowrap`
    host.appendChild(titleEl)

    const valueEl = document.createElement('div')
    valueEl.style.cssText = `font-size:${fontSize.value}px;font-weight:700;line-height:1.1;white-space:nowrap`
    valueEl.textContent = `${Number.isFinite(value.value) ? value.value : 0}`
    const unitEl = document.createElement('small')
    unitEl.textContent = unit.value
    unitEl.style.cssText = `margin-left:4px;font-size:${unitSize.value}px`
    valueEl.appendChild(unitEl)
    host.appendChild(valueEl)

    if (showTrends.value) {
      const trends = document.createElement('div')
      trends.style.cssText = `display:flex;gap:16px;font-size:${trendSize.value}px;white-space:nowrap`
      if (showYoy.value) {
        const s = document.createElement('span')
        s.textContent = `同比 ${yoy.value >= 0 ? '+' : ''}${yoy.value}%`
        trends.appendChild(s)
      }
      if (showMom.value) {
        const s = document.createElement('span')
        s.textContent = `环比 ${mom.value >= 0 ? '+' : ''}${mom.value}%`
        trends.appendChild(s)
      }
      host.appendChild(trends)
    }

    document.body.appendChild(host)
    const width = host.offsetWidth
    const height = host.offsetHeight
    document.body.removeChild(host)
    return { width, height }
  },
  paddingX: 8,
  paddingY: 8,
  minWidth: 140,
  minHeight: 72,
})
</script>

<template>
  <div
    class="metric-card"
    :style="{
      '--metric-title-size': `${titleSize}px`,
      '--metric-value-size': `${fontSize}px`,
      '--metric-unit-size': `${unitSize}px`,
      '--metric-trend-size': `${trendSize}px`,
    }"
  >
    <div class="metric-card__title">{{ title }}</div>
    <div class="metric-card__value">
      {{ value }}<small>{{ unit }}</small>
    </div>
    <div v-if="showTrends" class="metric-card__trends">
      <span v-if="showYoy" :class="yoy >= 0 ? 'up' : 'down'">
        同比 {{ yoy >= 0 ? '+' : '' }}{{ yoy }}%
      </span>
      <span v-if="showMom" :class="mom >= 0 ? 'up' : 'down'">
        环比 {{ mom >= 0 ? '+' : '' }}{{ mom }}%
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.metric-card {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  border: 1px solid var(--dp-primary-a25);
  border-radius: 10px;
  background: linear-gradient(135deg, var(--dp-panel-a90), var(--dp-elevated-a55));

  &__title {
    font-size: var(--metric-title-size, 13px);
    color: var(--dp-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__value {
    font-size: var(--metric-value-size, 36px);
    font-weight: 700;
    color: var(--dp-text-primary);
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    small {
      margin-left: 4px;
      font-size: var(--metric-unit-size, 14px);
      color: var(--dp-color-primary);
    }
  }

  &__trends {
    display: flex;
    gap: 16px;
    font-size: var(--metric-trend-size, 12px);
    white-space: nowrap;

    .up {
      color: var(--dp-color-success);
    }

    .down {
      color: var(--dp-color-danger);
    }
  }
}
</style>
