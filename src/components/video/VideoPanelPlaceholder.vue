<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'

const props = defineProps<{
  component: ScreenComponent
}>()

const title = computed(() => String(props.component.props.title ?? '监控窗口'))
const placeholder = computed(() =>
  String(props.component.props.placeholder ?? '视频流占位'),
)
</script>

<template>
  <div class="video-panel">
    <div class="video-panel__header">{{ title }}</div>
    <div class="video-panel__screen">
      <div class="video-panel__icon">▶</div>
      <div class="video-panel__text">{{ placeholder }}</div>
      <div class="video-panel__badge">P4 · hls.js / WebRTC</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.video-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.75);
  overflow: hidden;

  &__header {
    padding: 10px 14px;
    font-size: 13px;
    color: #94a3b8;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  }

  &__screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #020617;
  }

  &__icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 18px;
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.35);
    background: rgba(56, 189, 248, 0.08);
  }

  &__text {
    font-size: 13px;
    color: #64748b;
    text-align: center;
    padding: 0 16px;
  }

  &__badge {
    font-size: 11px;
    color: #64748b;
  }
}
</style>
