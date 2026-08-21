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
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
  background: radial-gradient(circle at 50% 30%, #1e3a5f 0%, #0f172a 55%, #020617 100%);

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
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
    color: #e2e8f0;
  }

  &__hint {
    font-size: 14px;
    color: #94a3b8;
  }

  &__badge {
    margin-top: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.35);
    background: rgba(15, 23, 42, 0.75);
  }
}
</style>
