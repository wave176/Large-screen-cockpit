<!--
  大屏图标：园区 / 人物 / 警告等常用符号，纯视觉，无 dataSource。

  Props（经 component: ScreenComponent）：
  - props.icon: IconName
  - props.color?: string
  - props.showBg?: boolean  是否显示圆形底
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import type { ScreenComponent } from '@/shared/types/schema'
import { getIconDef } from '@/components/icons/iconDefs'
import { colors } from '@/shared/theme/colors'

const props = defineProps<{ component: ScreenComponent }>()

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)

/** 从 Store 读最新 props，保证属性面板修改能立刻驱动样式 */
const liveProps = computed(() => {
  const found = schema.value.components.find((item) => item.id === props.component.id)
  return found?.props ?? props.component.props
})

const iconName = computed(() => String(liveProps.value.icon ?? 'park'))
const color = computed(() => String(liveProps.value.color ?? colors.primary))
const showBg = computed(() => {
  const v = liveProps.value.showBg
  if (v === undefined || v === null || v === '') return true
  return Boolean(v)
})

const iconDef = computed(() => getIconDef(iconName.value))
</script>

<template>
  <div class="icon-widget" :style="{ '--icon-color': color }">
    <div class="icon-widget__glyph" :class="{ 'icon-widget__glyph--bg': showBg }">
      <svg
        class="icon-widget__svg"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          v-for="(d, i) in iconDef.paths"
          :key="i"
          :d="d"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          :fill="iconDef.fill ? 'currentColor' : 'none'"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.icon-widget {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--icon-color, var(--dp-color-primary));
  overflow: hidden;
  user-select: none;

  &__glyph {
    box-sizing: border-box;
    display: grid;
    place-items: center;
    width: min(100%, 120px);
    aspect-ratio: 1 / 1;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    min-width: 0;
    min-height: 0;

    &--bg {
      border-radius: 50%;
      background: color-mix(in srgb, var(--icon-color) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--icon-color) 40%, transparent);
      box-shadow: inset 0 0 16px color-mix(in srgb, var(--icon-color) 18%, transparent);
    }
  }

  &__svg {
    display: block;
    width: 54%;
    height: 54%;
    margin: 0;
    overflow: visible;
  }
}
</style>
