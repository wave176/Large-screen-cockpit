<script setup lang="ts">
/**
 * 运行时预览页：只读渲染 Schema，用 ScreenCanvas + useScale 做屏幕适配。
 * 与设计器共享同一 screenStore；可在此切换 scaleMode 后返回设计器。
 */
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton, NSelect, NSpace, NTag } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useScreenStore } from '@/store/screen'
import ScreenCanvas from '@/runtime/ScreenCanvas.vue'

const router = useRouter()
const screenStore = useScreenStore()
const { schema, hydrated } = storeToRefs(screenStore)

const scaleModeOptions = [
  { label: '等比适应 (fit)', value: 'fit' },
  { label: '等比铺满 (fill)', value: 'fill' },
  { label: '拉伸 (stretch)', value: 'stretch' },
  { label: '原尺寸 (none)', value: 'none' },
]

onMounted(() => {
  if (!hydrated.value) {
    void screenStore.hydrate()
  }
})
</script>

<template>
  <div class="runtime-view">
    <div class="runtime-view__toolbar">
      <div class="runtime-view__info">
        <strong>{{ schema.name }}</strong>
        <NTag size="small" type="success">Runtime</NTag>
        <span>{{ schema.canvas.width }} × {{ schema.canvas.height }}</span>
      </div>

      <NSpace align="center">
        <NSelect
          :value="schema.canvas.scaleMode"
          :options="scaleModeOptions"
          style="width: 160px"
          @update:value="screenStore.setScaleMode"
        />
        <NButton @click="router.push('/editor')">返回设计器</NButton>
      </NSpace>
    </div>

    <div class="runtime-view__stage">
      <ScreenCanvas :schema="schema" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.runtime-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--dp-bg-page);

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--dp-border);
    background: var(--dp-panel-a95-solid);
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--dp-text-primary);

    span {
      font-size: 12px;
      color: var(--dp-text-dim);
    }
  }

  &__stage {
    flex: 1;
    min-height: 0;
  }
}
</style>
