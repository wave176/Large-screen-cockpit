<script setup lang="ts">
/**
 * 编辑器画布：固定分辨率 board + CSS zoom 预览缩放 + Moveable 交互。
 *
 * 结构：viewport（滚动/平移）→ workspace（留白居中）→ zoom（CSS zoom）→ board（真实像素布局）。
 *
 * 关键约定：
 * - 组件布局坐标始终是「未缩放」画布像素；缩放只影响显示，不改 schema。
 * - 用 CSS `zoom`（而非 transform:scale）缩放，便于 Moveable 的 `:zoom` 与控制框对齐。
 * - `selectionChromeVisible` 为 false 时隐藏选中描边与 Moveable（属性面板输入聚焦时）。
 * - 成组/多选拖拽：只给主选中挂 Moveable，其余成员用 inline transform 做预览，松手后写回 schema。
 */
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

/** 画布四周留白，方便滚到边缘外选中/平移 */
const PAD = 240

const screenStore = useScreenStore()
const { schema, selectedIds, editorPreviewScale, primarySelected, selectionChromeVisible } =
  storeToRefs(screenStore)

const moveableRef = ref<InstanceType<typeof Moveable> | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const boardRef = ref<HTMLElement | null>(null)
/** Moveable 的 target：主选中组件 DOM（锁定时为空） */
const selectedElement = ref<HTMLElement | null>(null)
/** 布局回写期间禁止再次选中，避免与 updateRect 竞态 */
const syncingLayout = ref(false)

/** 空格按下 = 进入「抓手」模式，左键拖视口平移（中键同样可平移） */
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

/**
 * 编辑器预览缩放：CSS zoom 改变视觉尺寸，layout 仍按 1:1 像素。
 * Moveable 需同步传入相同 `:zoom`，否则控制框会与元素错位。
 */
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

/** 根据主选中 id 刷新 Moveable target；锁定组件不显示控制框 */
function refreshSelectedElement() {
  const id = primarySelected.value?.id
  if (!id || !boardRef.value || primarySelected.value?.locked) {
    selectedElement.value = null
    return
  }
  selectedElement.value = getElementById(id)
}

/** 滚动/缩放/选中变化后，强制 Moveable 按当前 DOM 盒模型重算控制框 */
function updateMoveableRect() {
  moveableRef.value?.moveable?.updateRect()
}

/** 清除拖拽预览留下的 inline transform，避免与 schema 的 left/top 叠加 */
function clearInlineTransform(el: HTMLElement | null) {
  if (!el) return
  el.style.transform = ''
  el.removeAttribute('data-x')
  el.removeAttribute('data-y')
}

/**
 * 从 Moveable 事件中取出位移（画布像素，未再除以 zoom）。
 * 拖拽用 translate；缩放伴随位移时优先 drag.translate，否则用 dist。
 */
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

/**
 * 拖拽过程中的视觉预览：主目标用 Moveable 的 transform；
 * 同组/多选其它成员手动套相同 translate，实现「成组一起动」的观感。
 * 此时尚未写 store，松手后由 moveSelectedBy 统一落盘。
 */
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

/**
 * 布局已写入 schema、Vue 即将按 left/top 重排后：
 * 1) 清掉预览 transform，防止与新坐标叠加；
 * 2) 刷新 Moveable target；
 * 3) 下一帧 updateRect，避免控制框留在旧位置。
 */
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

/** 视口滚动会改变元素相对屏幕的位置，需同步 Moveable */
function handleViewportScroll() {
  updateMoveableRect()
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return Boolean(el.isContentEditable)
}

function onKeyDown(event: KeyboardEvent) {
  if (event.code === 'Delete' || event.code === 'Backspace') {
    if (isEditableTarget(event.target)) return
    if (!selectedIds.value.length) return
    event.preventDefault()
    screenStore.removeSelected()
    return
  }

  if (event.code !== 'Space') return
  if (isEditableTarget(event.target)) return
  event.preventDefault()
  spacePressed.value = true
}

function onKeyUp(event: KeyboardEvent) {
  if (event.code !== 'Space') return
  spacePressed.value = false
  panning.value = false
}

/** 中键 或 空格+左键：开始平移视口（改 scroll，不改组件坐标） */
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
  // 同步布局 / 平移中忽略点击，避免误切换选中
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

/** 松手：把位移写入 schema（含成组成员），再清预览并重绑 Moveable */
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

/** 仅单选可缩放；松手后写回 width/height，以及缩放时可能产生的 x/y 偏移 */
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
            <!-- selectionChromeVisible=false 时隐藏描边，避免与属性面板输入抢视觉焦点 -->
            <ComponentWrapper
              v-for="item in sortedComponents"
              :key="item.id"
              :component="item"
              editable
              :selected="selectionChromeVisible && primarySelected?.id === item.id"
              :co-selected="selectionChromeVisible && screenStore.isCoSelected(item.id)"
              :highlighted="selectionChromeVisible && screenStore.isGroupHighlighted(item.id)"
              @select="handleSelect"
            />

            <!--
              多选/成组时只对主选中挂 Moveable；resizable 仅单成员时开启。
              :zoom 必须等于 CSS zoom，bounds 使用未缩放的画布尺寸。
            -->
            <Moveable
              v-if="selectionChromeVisible && selectedElement && primarySelected && !panning"
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
      var(--dp-bg-board);
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
    outline: 1px solid var(--dp-border-strong);
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
    color: var(--dp-text-muted);
    background: var(--dp-panel-a75);
    pointer-events: none;
  }
}
</style>
