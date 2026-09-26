<!--
  大屏顶栏标题：左右渐变线 + 主副标题。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.title: string
  - props.subtitle?: string
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropString } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const title = computed(() => getPropString(props.component, 'title', '数据可视化大屏'))
const subtitle = computed(() => getPropString(props.component, 'subtitle', ''))
</script>

<template>
  <div class="title-bar">
    <div class="title-bar__line title-bar__line--left" />
    <div class="title-bar__main">
      <div class="title-bar__title">{{ title }}</div>
      <div v-if="subtitle" class="title-bar__subtitle">{{ subtitle }}</div>
    </div>
    <div class="title-bar__line title-bar__line--right" />
  </div>
</template>

<style scoped lang="scss">
.title-bar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;

  &__line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--dp-primary-a70));

    &--right {
      background: linear-gradient(90deg, var(--dp-primary-a70), transparent);
    }
  }

  &__main {
    text-align: center;
  }

  &__title {
    font-size: 28px;
    font-weight: 700;
    color: var(--dp-text-highlight);
    letter-spacing: 0.12em;
    text-shadow: 0 0 16px var(--dp-primary-a35);
  }

  &__subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--dp-text-dim);
  }
}
</style>
