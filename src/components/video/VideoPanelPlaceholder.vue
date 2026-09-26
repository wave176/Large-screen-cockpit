<!--
  视频监控面板占位（后续可接 hls.js / WebRTC；registry type 为 VideoPanel）。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.title: string
  - props.layout?: string      如 '1x1'，当前 UI 未消费，保留给多宫格扩展
  - props.placeholder: string  画面中央提示文案
-->
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
  border: 1px solid var(--dp-muted-a25);
  border-radius: 8px;
  background: var(--dp-panel-a75);
  overflow: hidden;

  &__header {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--dp-text-muted);
    border-bottom: 1px solid var(--dp-border);
  }

  &__screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--dp-bg-page);
  }

  &__icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 18px;
    color: var(--dp-color-primary);
    border: 1px solid var(--dp-primary-a35);
    background: var(--dp-primary-a08);
  }

  &__text {
    font-size: 13px;
    color: var(--dp-text-dim);
    text-align: center;
    padding: 0 16px;
  }

  &__badge {
    font-size: 11px;
    color: var(--dp-text-dim);
  }
}
</style>
