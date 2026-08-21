<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropString } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const title = computed(() => getPropString(props.component, 'title', '全屏容器'))
const background = computed(() =>
  getPropString(props.component, 'background', 'rgba(15,23,42,0.35)'),
)
</script>

<template>
  <div class="fullscreen-box" :style="{ background }">
    <div class="fullscreen-box__hint">{{ title }}</div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.fullscreen-box {
  width: 100%;
  height: 100%;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 8px;
  position: relative;

  &__hint {
    position: absolute;
    top: 8px;
    left: 10px;
    font-size: 11px;
    color: #64748b;
  }
}
</style>
