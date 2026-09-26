<!--
  3D 地图占位（后续可替换为 CesiumJS 实现；registry type 仍为 Map3D）。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.title: string
  - props.hint: string   副文案，如「Cesium 占位」
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'

const props = defineProps<{
  component: ScreenComponent
}>()

const title = computed(() => String(props.component.props.title ?? '3D 地图'))
const hint = computed(() => String(props.component.props.hint ?? 'Cesium 占位'))
</script>

<template>
  <div class="map3d-placeholder">
    <div class="map3d-placeholder__grid" />
    <div class="map3d-placeholder__content">
      <div class="map3d-placeholder__title">{{ title }}</div>
      <div class="map3d-placeholder__hint">{{ hint }}</div>
      <div class="map3d-placeholder__badge">P3 · CesiumJS</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.map3d-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--dp-primary-a25);
  border-radius: 8px;
  background: radial-gradient(circle at 50% 30%, var(--dp-color-map-mid) 0%, var(--dp-bg-panel) 55%, var(--dp-bg-page) 100%);

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--dp-primary-a08) 1px, transparent 1px),
      linear-gradient(90deg, var(--dp-primary-a08) 1px, transparent 1px);
    background-size: 40px 40px;
    transform: perspective(500px) rotateX(58deg) scale(1.4);
    transform-origin: center 80%;
    opacity: 0.7;
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    color: var(--dp-text-primary);
  }

  &__hint {
    font-size: 14px;
    color: var(--dp-text-muted);
  }

  &__badge {
    margin-top: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    color: var(--dp-color-primary);
    border: 1px solid var(--dp-primary-a35);
    background: var(--dp-panel-a75);
  }
}
</style>
