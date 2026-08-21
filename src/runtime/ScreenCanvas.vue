<script setup lang="ts">
/**
 * Schema 驱动的大屏画布：按 zIndex 渲染 ComponentWrapper。
 * - 运行时：useScale 计算 fit/fill/stretch，transform:scale 适配视口。
 * - editable 模式：改用 editorPreviewScale 做预览缩放（当前主编辑器已改用 EditorCanvas+CSS zoom，
 *   本分支保留给可能的旧入口或嵌入场景）。
 */
import { computed, toRef } from 'vue'
import type { ScreenSchema } from '@/shared/types/schema'
import { useScale } from '@/runtime/hooks/useScale'
import ComponentWrapper from '@/runtime/ComponentWrapper.vue'

const props = withDefaults(
  defineProps<{
    schema: ScreenSchema
    editable?: boolean
    selectedIds?: string[]
    isHighlighted?: (id: string) => boolean
    editorPreviewScale?: number
  }>(),
  {
    editable: false,
    selectedIds: () => [],
    isHighlighted: () => false,
    editorPreviewScale: 1,
  },
)

const emit = defineEmits<{
  select: [id: string, event: MouseEvent]
}>()

const canvasWidth = toRef(() => props.schema.canvas.width)
const canvasHeight = toRef(() => props.schema.canvas.height)
const scaleMode = toRef(() => props.schema.canvas.scaleMode)

const { wrapperRef, scale } = useScale(canvasWidth, canvasHeight, scaleMode)

const sortedComponents = computed(() =>
  [...props.schema.components].sort((a, b) => a.layout.zIndex - b.layout.zIndex),
)

const canvasStyle = computed(() => ({
  width: `${props.schema.canvas.width}px`,
  height: `${props.schema.canvas.height}px`,
  background: props.schema.canvas.background,
  backgroundImage: props.schema.canvas.backgroundImage
    ? `url(${props.schema.canvas.backgroundImage})`
    : undefined,
}))

/**
 * 运行时用 scaleX/scaleY（可能非等比）；编辑预览用单一 preview 系数。
 * 布局宽高仍是设计分辨率像素，缩放只发生在外层 stage。
 */
const transformStyle = computed(() => {
  if (props.editable) {
    const preview = props.editorPreviewScale
    return {
      transform: `scale(${preview})`,
      transformOrigin: 'top left',
    }
  }

  return {
    transform: `scale(${scale.value.scaleX}, ${scale.value.scaleY})`,
    transformOrigin: 'center center',
  }
})

function handleCanvasClick(event: MouseEvent) {
  if (!props.editable) return
  if (event.target === event.currentTarget) {
    emit('select', '', event)
  }
}
</script>

<template>
  <div ref="wrapperRef" class="screen-canvas-wrapper" :class="{ 'screen-canvas-wrapper--editor': editable }">
    <div class="screen-canvas-stage" :style="transformStyle">
      <div class="screen-canvas" :style="canvasStyle" @mousedown.self="handleCanvasClick">
        <ComponentWrapper
          v-for="item in sortedComponents"
          :key="item.id"
          :component="item"
          :editable="editable"
          :selected="selectedIds.includes(item.id)"
          :highlighted="isHighlighted(item.id)"
          @select="(id, event) => emit('select', id, event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.screen-canvas-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020617;

  &--editor {
    align-items: flex-start;
    justify-content: flex-start;
    overflow: auto;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      #111827;
    background-size: 20px 20px;
  }
}

.screen-canvas-stage {
  flex-shrink: 0;
}

.screen-canvas {
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}
</style>
