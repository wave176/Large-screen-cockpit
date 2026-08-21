<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropNumber, getPropString } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const variant = computed(() => getPropNumber(props.component, 'variant', 1))
const title = computed(() => getPropString(props.component, 'title', ''))
const animated = computed(() => Boolean(props.component.props.animated ?? true))
</script>

<template>
  <div
    class="border-box"
    :class="[`border-box--v${variant}`, { 'border-box--animated': animated }]"
  >
    <div class="border-box__corner border-box__corner--tl" />
    <div class="border-box__corner border-box__corner--tr" />
    <div class="border-box__corner border-box__corner--bl" />
    <div class="border-box__corner border-box__corner--br" />
    <div class="border-box__scan" />
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
  border: 1px solid rgba(56, 189, 248, 0.35);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.55));
  box-shadow: inset 0 0 24px rgba(56, 189, 248, 0.08);
  overflow: hidden;

  &--v2 {
    border-color: rgba(99, 226, 183, 0.35);
    box-shadow: inset 0 0 24px rgba(99, 226, 183, 0.08);
  }

  &--v3 {
    border-color: rgba(251, 191, 36, 0.35);
    clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
  }

  &__corner {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid #38bdf8;
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
    border-color: #63e2b7;
  }

  &--v3 &__corner {
    border-color: #fbbf24;
  }

  &__scan {
    display: none;
  }

  &--animated &__scan {
    display: block;
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent);
    animation: scan 3.2s linear infinite;
    pointer-events: none;
  }

  &__title {
    position: absolute;
    top: 10px;
    left: 16px;
    z-index: 2;
    font-size: 14px;
    color: #94a3b8;
    letter-spacing: 0.05em;
  }

  &__body {
    width: 100%;
    height: 100%;
  }
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}
</style>
