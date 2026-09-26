<script setup lang="ts">
/**
 * 设计器页面：顶栏 + 左栏（组件/图层）+ 中央画布 + 右栏（属性，固定）。
 * 负责 hydrate、保存状态、预览缩放 / 适配模式与跳转 Runtime。
 */
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton, NSelect, NSpace, NTag } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useScreenStore } from '@/store/screen'
import { EDITOR_PREVIEW_SCALES } from '@/shared/constants/resolutions'
import EditorCanvas from '@/editor/canvas/EditorCanvas.vue'
import LeftSidebar from '@/editor/panels/LeftSidebar.vue'
import PropertyPanel from '@/editor/panels/PropertyPanel.vue'
import ResolutionControl from '@/editor/panels/ResolutionControl.vue'

const router = useRouter()
const screenStore = useScreenStore()
const {
  schema,
  editorPreviewScale,
  saveStatus,
  saveError,
  documentVersion,
  documentUpdatedAt,
  hydrated,
} = storeToRefs(screenStore)

/** 写入 schema.canvas.scaleMode，影响 Runtime 适配，不改变编辑器 CSS zoom */
const scaleModeOptions = [
  { label: '等比适应 (fit)', value: 'fit' },
  { label: '等比铺满 (fill)', value: 'fill' },
  { label: '拉伸 (stretch)', value: 'stretch' },
  { label: '原尺寸 (none)', value: 'none' },
]

/** 编辑器预览缩放百分比，对应 EditorCanvas 的 CSS zoom */
const previewScaleOptions = EDITOR_PREVIEW_SCALES.map((value) => ({
  label: `${Math.round(value * 100)}%`,
  value,
}))

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'loading':
      return '加载中…'
    case 'saving':
      return '保存中…'
    case 'saved':
      return `已保存 · v${documentVersion.value}`
    case 'error':
      return saveError.value ? `保存失败: ${saveError.value}` : '保存失败'
    default:
      return '未保存'
  }
})

const saveStatusType = computed(() => {
  if (saveStatus.value === 'error') return 'error'
  if (saveStatus.value === 'saved') return 'success'
  if (saveStatus.value === 'saving' || saveStatus.value === 'loading') return 'warning'
  return 'default'
})

onMounted(() => {
  if (!hydrated.value) {
    void screenStore.hydrate()
  }
})

function openPreview() {
  router.push('/runtime')
}
</script>

<template>
  <div class="editor-view">
    <header class="editor-view__toolbar">
      <div class="editor-view__title">
        <strong>{{ schema.name }}</strong>
        <NTag size="small" type="info">设计器</NTag>
        <NTag size="small" :type="saveStatusType" :bordered="false">
          {{ saveStatusText }}
        </NTag>
        <span v-if="documentUpdatedAt" class="editor-view__meta">
          {{ documentUpdatedAt }}
        </span>
      </div>

      <NSpace align="center" :size="12" wrap>
        <ResolutionControl />
        <NSelect
          :value="schema.canvas.scaleMode"
          :options="scaleModeOptions"
          style="width: 160px"
          @update:value="screenStore.setScaleMode"
        />
        <NSelect
          v-model:value="editorPreviewScale"
          :options="previewScaleOptions"
          style="width: 100px"
        />
        <NButton @click="screenStore.createGroupFromSelection()">成组</NButton>
        <NButton @click="screenStore.removeSelected()">删除选中</NButton>
        <NButton @click="screenStore.resetSchema()">重置示例</NButton>
        <NButton :loading="saveStatus === 'saving'" @click="screenStore.saveNow()">
          保存到 JSON
        </NButton>
        <NButton type="primary" @click="openPreview">预览 Runtime</NButton>
      </NSpace>
    </header>

    <div class="editor-view__body">
      <aside class="editor-view__left">
        <LeftSidebar />
      </aside>

      <main class="editor-view__workspace">
        <EditorCanvas />
      </main>

      <aside class="editor-view__right">
        <PropertyPanel />
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: var(--dp-bg-page);

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--dp-border);
    background: var(--dp-bg-panel);
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--dp-text-primary);
    flex-shrink: 0;
  }

  &__meta {
    font-size: 11px;
    color: var(--dp-text-dim);
  }

  &__body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 280px 1fr 300px;
  }

  &__left,
  &__right {
    min-height: 0;
    min-width: 0;
  }

  &__workspace {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
