<!--
  纯文本块：标题/说明等静态文案。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.text / fontSize / color / align / fontWeight

  内容始终在框内；字号或文案变化时自动调整组件宽高。
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import type { ScreenComponent } from '@/shared/types/schema'
import { colors } from '@/shared/theme/colors'
import {
  measureTextBox,
  useContentFitLayout,
} from '@/shared/composables/useContentFitLayout'

const props = defineProps<{
  component: ScreenComponent
}>()

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)

const liveProps = computed(() => {
  const found = schema.value.components.find((item) => item.id === props.component.id)
  return found?.props ?? props.component.props
})

const text = computed(() => String(liveProps.value.text ?? ''))
const fontSize = computed(() => {
  const n = Number(liveProps.value.fontSize ?? 24)
  return Number.isFinite(n) && n > 0 ? n : 24
})
const color = computed(() => String(liveProps.value.color ?? colors.textPrimary))
const align = computed(() => String(liveProps.value.align ?? 'left'))
const fontWeight = computed(() => Number(liveProps.value.fontWeight ?? 500))

useContentFitLayout({
  getComponentId: () => props.component.id,
  getDeps: () => [text.value, fontSize.value, fontWeight.value],
  measure: () =>
    measureTextBox(text.value, {
      fontSize: fontSize.value,
      fontWeight: fontWeight.value,
    }),
  paddingX: 24,
  paddingY: 16,
  minWidth: 48,
  minHeight: 32,
})
</script>

<template>
  <div
    class="text-block"
    :style="{
      fontSize: `${fontSize}px`,
      color,
      textAlign: align as 'left' | 'center' | 'right',
      fontWeight,
      justifyContent:
        align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
    }"
  >
    <span class="text-block__inner">{{ text }}</span>
  </div>
</template>

<style scoped lang="scss">
.text-block {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  line-height: 1.2;
  text-shadow: 0 0 12px var(--dp-primary-a35);

  &__inner {
    white-space: nowrap;
    overflow: hidden;
    max-width: 100%;
  }
}
</style>
