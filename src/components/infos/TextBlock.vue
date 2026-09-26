<!--
  纯文本块：标题/说明等静态文案。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.text: string
  - props.fontSize: number
  - props.color: string
  - props.align: 'left' | 'center' | 'right'
  - props.fontWeight: number
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { colors } from '@/shared/theme/colors'

const props = defineProps<{
  component: ScreenComponent
}>()

const text = computed(() => String(props.component.props.text ?? ''))
const fontSize = computed(() => Number(props.component.props.fontSize ?? 24))
const color = computed(() => String(props.component.props.color ?? colors.textPrimary))
const align = computed(() => String(props.component.props.align ?? 'left'))
const fontWeight = computed(() => Number(props.component.props.fontWeight ?? 500))
</script>

<template>
  <div
    class="text-block"
    :style="{
      fontSize: `${fontSize}px`,
      color,
      textAlign: align as 'left' | 'center' | 'right',
      fontWeight,
    }"
  >
    {{ text }}
  </div>
</template>

<style scoped lang="scss">
.text-block {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 1.2;
  text-shadow: 0 0 12px var(--dp-primary-a35);
}
</style>
