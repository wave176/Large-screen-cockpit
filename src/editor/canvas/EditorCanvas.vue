<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Moveable from 'vue3-moveable'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import ComponentWrapper from '@/runtime/ComponentWrapper.vue'

interface MoveableDragEvent {
  target: HTMLElement
  transform: string
  translate?: number[]
}

interface MoveableDragEndEvent {
  target: HTMLElement
  lastEvent?: MoveableDragEvent | null
}

interface MoveableResizeEvent {
  target: HTMLElement
  width: number
  height: number
  drag: { dist: number[]; transform?: string; translate?: number[] }
}

interface MoveableResizeEndEvent {
  target: HTMLElement
  lastEvent?: MoveableResizeEvent | null
}

const PAD = 240

const screenStore = useScreenStore()
const { schema, selectedIds, editorPreviewScale, primarySelected } = storeToRefs(screenStore)

const moveableRef = ref<InstanceType<typeof Moveable> | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const boardRef = ref<HTMLElement | null>(null)
const selectedElement = ref<HTMLElement | null>(null)
const syncingLayout = ref(false)

const spacePressed = ref(false)
const panning = ref(false)
const panStart = ref({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

const sortedComponents = computed(() =>
  [...schema.value.components].sort((a, b) => a.layout.zIndex - b.layout.zIndex),
)

const boardStyle = computed(() => ({
  width: `${schema.value.canvas.width}px`,
  height: `${schema.value.canvas.height}px`,
  background: schema.value.canvas.background,
  backgroundImage: schema.value.canvas.backgroundImage
    ? `url(${schema.value.canvas.backgroundImage})`
    : undefined,
}))

const zoomStyle = computed(() => ({
  zoom: String(editorPreviewScale.value),
}))

/** 四周留白 + 至少铺满视口，画布可居中并四向滚动 */
const workspaceStyle = computed(() => ({
  padding: `${PAD}px`,
  boxSizing: 'border-box' as const,
  minWidth: '100%',
  minHeight: '100%',
}))

function getElementById(id: string): HTMLElement | null {
  return boardRef.value?.querySelector(`[data-component-id="${id}"]`) as HTMLElement | null
}

function refreshSelectedElement() {
  const id = primarySelected.value?.id
  if (!id || !boardRef.value || primarySelected.value?.locked) {
    selectedElement.value = null
    return
  }
  selectedElement.value = getElementById(id)
}

function updateMoveableRect() {
  moveableRef.value?.moveable?.updateRect()
}

function clearInlineTransform(el: HTMLElement | null) {
  if (!el) return
  el.style.transform = ''
  el.removeAttribute('data-x')
  el.removeAttribute('data-y')
}

function getTranslate(event?: {
  translate?: number[]
  drag?: { translate?: number[]; dist?: number[] }
}): [number, number] {
  if (event?.translate) {
    return [event.translate[0] ?? 0, event.translate[1] ?? 0]
  }
  if (event?.drag?.translate) {
    return [event.drag.translate[0] ?? 0, event.drag.translate[1] ?? 0]
  }
  if (event?.drag?.dist) {
    return [event.drag.dist[0] ?? 0, event.drag.dist[1] ?? 0]
  }
  return [0, 0]
}

function applyDragPreview(translate: [number, number], primaryTarget: HTMLElement, transform: string) {
  primaryTarget.style.transform = transform
  const primaryId = primarySelected.value?.id
  screenStore.getMoveTogetherIds().forEach((id) => {
    if (id === primaryId) return
    const el = getElementById(id)
    if (!el) return
    el.style.transform = `translate(${translate[0]}px, ${translate[1]}px)`
  })
}

function clearAllSelectedTransforms(primaryTarget: HTMLElement) {
  clearInlineTransform(primaryTarget)
  screenStore.getMoveTogetherIds().forEach((id) => {
    clearInlineTransform(getElementById(id))
  })
}

async function syncMoveableAfterLayout(target: HTMLElement) {
  await nextTick()
  clearAllSelectedTransforms(target)
  refreshSelectedElement()
  await nextTick()
  requestAnimationFrame(() => {
    updateMoveableRect()
    syncingLayout.value = false
  })
}

/** 将可滚动区域滚到中间，避免画布钉在左上角 */
function centerCanvasInViewport() {
  const viewport = viewportRef.value
  if (!viewport) return
  viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2)
  viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2)
}

function handleViewportScroll() {
  updateMoveableRect()
}

function onKeyDown(event: KeyboardEvent) {
  if (event.code !== 'Space') return
  const tag = (event.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  spacePressed.value = true
}

function onKeyUp(event: KeyboardEvent) {
  if (event.code !== 'Space') return
  spacePressed.value = false
  panning.value = false
}

function handleViewportPointerDown(event: PointerEvent) {
  const isMiddle = event.button === 1
  const isSpaceLeft = event.button === 0 && spacePressed.value
  if (!isMiddle && !isSpaceLeft) return

  const viewport = viewportRef.value
  if (!viewport) return

  event.preventDefault()
  panning.value = true
  panStart.value = {
    x: event.clientX,
    y: event.clientY,
    scrollLeft: viewport.scrollLeft,
    scrollTop: viewport.scrollTop,
  }
  viewport.setPointerCapture(event.pointerId)
}

function handleViewportPointerMove(event: PointerEvent) {
  if (!panning.value || !viewportRef.value) return
  const dx = event.clientX - panStart.value.x
  const dy = event.clientY - panStart.value.y
  viewportRef.value.scrollLeft = panStart.value.scrollLeft - dx
  viewportRef.value.scrollTop = panStart.value.scrollTop - dy
}

function handleViewportPointerUp(event: PointerEvent) {
  if (!panning.value) return
  panning.value = false
  viewportRef.value?.releasePointerCapture(event.pointerId)
}

watch(
  () => [primarySelected.value?.id, editorPreviewScale.value] as const,
  async () => {
    await nextTick()
    refreshSelectedElement()
    await nextTick()
    updateMoveableRect()
  },
  { immediate: true },
)

watch(
  () => [schema.value.canvas.width, schema.value.canvas.height, editorPreviewScale.value] as const,
  async () => {
    await nextTick()
    centerCanvasInViewport()
    updateMoveableRect()
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  nextTick(() => {
    centerCanvasInViewport()
    updateMoveableRect()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

function handleSelect(id: string, event: MouseEvent) {
  if (syncingLayout.value || spacePressed.value || panning.value) return
  if (!id) {
    screenStore.selectComponent(null)
    return
  }
  screenStore.selectComponent(id, { append: event.ctrlKey || event.metaKey })
}

function handleBoardMouseDown(event: MouseEvent) {
  if (spacePressed.value || panning.value) return
  if (event.target === event.currentTarget) {
    screenStore.selectComponent(null)
  }
}

function handleDrag(event: MoveableDragEvent) {
  applyDragPreview(getTranslate(event), event.target, event.transform)
}

async function handleDragEnd(event: MoveableDragEndEvent) {
  const current = primarySelected.value
  if (!current) return

  const [deltaX, deltaY] = event.lastEvent ? getTranslate(event.lastEvent) : [0, 0]

  syncingLayout.value = true

  if (deltaX !== 0 || deltaY !== 0) {
    screenStore.moveSelectedBy(deltaX, deltaY)
  }

  await syncMoveableAfterLayout(event.target)
}

function handleResize(event: MoveableResizeEvent) {
  const { target, width, height, drag } = event
  target.style.width = `${width}px`
  target.style.height = `${height}px`
  target.style.transform = drag.transform ?? ''
}

async function handleResizeEnd(event: MoveableResizeEndEvent) {
  const current = primarySelected.value
  if (!current || !event.lastEvent) return

  const [deltaX, deltaY] = getTranslate(event.lastEvent)
  const { width, height } = event.lastEvent

  syncingLayout.value = true

  screenStore.updateComponentLayout(current.id, {
    x: Math.max(0, Math.round(current.layout.x + deltaX)),
    y: Math.max(0, Math.round(current.layout.y + deltaY)),
    width: Math.max(40, Math.round(width)),
    height: Math.max(40, Math.round(height)),
  })

  await syncMoveableAfterLayout(event.target)
}
</script>

<template>
  <div class="editor-canvas">
    <div
      ref="viewportRef"
      class="editor-canvas__viewport"
      :class="{
        'editor-canvas__viewport--space': spacePressed,
        'editor-canvas__viewport--panning': panning,
      }"
      @scroll="handleViewportScroll"
      @pointerdown="handleViewportPointerDown"
      @pointermove="handleViewportPointerMove"
      @pointerup="handleViewportPointerUp"
      @pointercancel="handleViewportPointerUp"
    >
      <div class="editor-canvas__workspace" :style="workspaceStyle">
        <div class="editor-canvas__zoom" :style="zoomStyle">
          <div
            ref="boardRef"
            class="editor-canvas__board"
            :style="boardStyle"
            @mousedown.self="handleBoardMouseDown"
          >
            <ComponentWrapper
              v-for="item in sortedComponents"
              :key="item.id"
              :component="item"
              editable
              :selected="primarySelected?.id === item.id"
              :co-selected="screenStore.isCoSelected(item.id)"
              :highlighted="screenStore.isGroupHighlighted(item.id)"
              @select="handleSelect"
            />

            <Moveable
              v-if="selectedElement && primarySelected && !panning"
              ref="moveableRef"
              class="editor-canvas__moveable"
              :target="selectedElement"
              :draggable="true"
              :resizable="screenStore.getMoveTogetherIds().length === 1"
              :rotatable="false"
              :origin="false"
              :snappable="true"
              :snap-gap="true"
              :snap-threshold="5"
              :throttle-drag="0"
              :zoom="editorPreviewScale"
              :bounds="{
                left: 0,
                top: 0,
                right: schema.canvas.width,
                bottom: schema.canvas.height,
              }"
              @drag="handleDrag"
              @drag-end="handleDragEnd"
              @resize="handleResize"
              @resize-end="handleResizeEnd"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="editor-canvas__hint">
      滚轮滚动 · 空格+拖拽 / 中键拖拽平移画布
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-canvas {
  position: relative;
  width: 100%;
  height: 100%;

  &__viewport {
    width: 100%;
    height: 100%;
    overflow: auto;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      #111827;
    background-size: 20px 20px;
    cursor: default;

    &--space {
      cursor: grab;
    }

    &--panning {
      cursor: grabbing;
      user-select: none;
    }
  }

  &__workspace {
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    height: max-content;
  }

  &__zoom {
    flex-shrink: 0;
    width: fit-content;
    height: fit-content;
  }

  &__board {
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    outline: 1px solid rgba(148, 163, 184, 0.2);
  }

  &__moveable {
    z-index: 1000;
  }

  &__hint {
    position: absolute;
    left: 12px;
    bottom: 10px;
    z-index: 5;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    color: #94a3b8;
    background: rgba(15, 23, 42, 0.75);
    pointer-events: none;
  }
}
</style>
