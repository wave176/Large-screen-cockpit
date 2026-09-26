<!--
  科技风边框装饰：四角描边；可作面板容器（默认插槽）。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.title?: string
  - props.variant: 1 | 2 | 3   1 蓝、2 绿、3 切角金
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropNumber, getPropString } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const variant = computed(() => getPropNumber(props.component, 'variant', 1))
const title = computed(() => getPropString(props.component, 'title', ''))
</script>

<template>
  <div class="border-box" :class="`border-box--v${variant}`">
    <div class="border-box__corner border-box__corner--tl" />
    <div class="border-box__corner border-box__corner--tr" />
    <div class="border-box__corner border-box__corner--bl" />
    <div class="border-box__corner border-box__corner--br" />
    <div v-if="title" class="border-box__title">{{ title }}</div>
    <div class="border-box__body">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.border-box {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid var(--dp-primary-a35);
  background: linear-gradient(180deg, var(--dp-panel-a85), var(--dp-panel-a55));
  box-shadow: inset 0 0 24px var(--dp-primary-a08);
  overflow: hidden;

  &--v2 {
    border-color: var(--dp-success-a35);
    box-shadow: inset 0 0 24px var(--dp-success-a08);
  }

  &--v3 {
    border-color: var(--dp-warning-a35);
    clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
  }

  &__corner {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid var(--dp-color-primary);
    z-index: 2;

    &--tl {
      top: -1px;
      left: -1px;
      border-right: none;
      border-bottom: none;
    }

    &--tr {
      top: -1px;
      right: -1px;
      border-left: none;
      border-bottom: none;
    }

    &--bl {
      bottom: -1px;
      left: -1px;
      border-right: none;
      border-top: none;
    }

    &--br {
      bottom: -1px;
      right: -1px;
      border-left: none;
      border-top: none;
    }
  }

  &--v2 &__corner {
    border-color: var(--dp-color-success);
  }

  &--v3 &__corner {
    border-color: var(--dp-color-warning);
  }

  &__title {
    position: absolute;
    top: 10px;
    left: 16px;
    z-index: 2;
    font-size: 14px;
    color: var(--dp-text-muted);
    letter-spacing: 0.05em;
  }

  &__body {
    width: 100%;
    height: 100%;
  }
}
</style>
