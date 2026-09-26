<!--
  纯视觉装饰：线条 / 网格 / 光晕，不承载业务数据。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.mode: 'line' | 'grid' | 'glow'
  - props.color: string  CSS 色值，驱动 --decor-color
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropString } from '@/shared/utils/chartData'
import { colors } from '@/shared/theme/colors'

const props = defineProps<{ component: ScreenComponent }>()

const mode = computed(() => getPropString(props.component, 'mode', 'line')) // line | grid | glow
const color = computed(() => getPropString(props.component, 'color', colors.primary))
</script>

<template>
  <div class="decor" :class="`decor--${mode}`" :style="{ '--decor-color': color }">
    <div class="decor__inner" />
  </div>
</template>

<style scoped lang="scss">
.decor {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  &--line &__inner {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--decor-color), transparent);
  }

  &--grid {
    background-image:
      linear-gradient(var(--dp-primary-a08) 1px, transparent 1px),
      linear-gradient(90deg, var(--dp-primary-a08) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  &--glow {
    background: radial-gradient(circle at center, color-mix(in srgb, var(--decor-color) 35%, transparent), transparent 70%);
  }
}
</style>
