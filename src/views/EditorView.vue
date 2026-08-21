<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  NButton,
  NSelect,
  NSpace,
  NTag,
} from 'naive-ui'
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
  propertyPanelVisible,
  saveStatus,
  saveError,
  documentVersion,
  documentUpdatedAt,
  hydrated,
} = storeToRefs(screenStore)

const scaleModeOptions = [
  { label: '等比适应 (fit)', value: 'fit' },
  { label: '等比铺满 (fill)', value: 'fill' },
  { label: '拉伸 (stretch)', value: 'stretch' },
  { label: '原尺寸 (none)', value: 'none' },
]

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
        <NButton
          :type="propertyPanelVisible ? 'primary' : 'default'"
          @click="propertyPanelVisible = !propertyPanelVisible"
        >
          属性面板
        </NButton>
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

        <Transition name="panel-slide">
          <aside v-if="propertyPanelVisible" class="editor-view__property-overlay">
            <PropertyPanel floating @close="propertyPanelVisible = false" />
          </aside>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #020617;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    background: #0f172a;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #e2e8f0;
    flex-shrink: 0;
  }

  &__meta {
    font-size: 11px;
    color: #64748b;
  }

  &__body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 280px 1fr;
  }

  &__left {
    min-height: 0;
  }

  &__workspace {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  &__property-overlay {
    position: absolute;
    top: 12px;
    right: 12px;
    bottom: 12px;
    width: 320px;
    z-index: 30;
    pointer-events: auto;
  }
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(16px);
  opacity: 0;
}
</style>
