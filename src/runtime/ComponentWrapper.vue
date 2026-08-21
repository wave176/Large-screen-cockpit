<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getComponentView } from '@/components/registry'

const props = defineProps<{
  component: ScreenComponent
  editable?: boolean
  /** 主选中：有 Moveable 控制框 */
  selected?: boolean
  /** 同组/多选中的其它项：弱选中，不单独出控制框 */
  coSelected?: boolean
  highlighted?: boolean
}>()

const emit = defineEmits<{
  select: [id: string, event: MouseEvent]
}>()

const viewComponent = computed(() => getComponentView(props.component.type))

const wrapperStyle = computed(() => ({
  left: `${props.component.layout.x}px`,
  top: `${props.component.layout.y}px`,
  width: `${props.component.layout.width}px`,
  height: `${props.component.layout.height}px`,
  zIndex: String(props.component.layout.zIndex),
  // 编辑模式下 transform 由 Moveable / 成组拖拽控制
  transform:
    !props.editable && props.component.layout.rotate
      ? `rotate(${props.component.layout.rotate}deg)`
      : undefined,
  visibility: props.component.visible ? 'visible' : 'hidden',
  pointerEvents: props.component.visible
    ? props.component.locked && props.editable
      ? 'none'
      : 'auto'
    : 'none',
}))

function handleMouseDown(event: MouseEvent) {
  if (!props.editable || props.component.locked) return
  emit('select', props.component.id, event)
}
</script>

<template>
  <div
    class="component-wrapper"
    :class="{
      'component-wrapper--editable': editable && !component.locked,
      'component-wrapper--selected': selected,
      'component-wrapper--co-selected': coSelected && !selected,
      'component-wrapper--highlighted': highlighted && !selected && !coSelected,
      'component-wrapper--locked': component.locked,
    }"
    :style="wrapperStyle"
    :data-component-id="component.id"
    @mousedown.stop="handleMouseDown"
  >
    <div class="component-wrapper__inner">
      <component
        :is="viewComponent"
        v-if="viewComponent"
        :component="component"
        class="component-wrapper__view"
      />
      <div v-else class="component-wrapper__missing">
        未知组件：{{ component.type }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.component-wrapper {
  position: absolute;
  box-sizing: border-box;

  &--editable {
    cursor: move;

    &:hover {
      outline: 1px dashed rgba(56, 189, 248, 0.55);
    }

    // 编辑态禁止点选内部图表/文字，整体作为一个组件
    .component-wrapper__inner {
      pointer-events: none;
      user-select: none;
    }
  }

  &--selected {
    outline: 2px solid #38bdf8;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
  }

  &--co-selected {
    outline: 1px solid rgba(56, 189, 248, 0.55);
    box-shadow: none;
  }

  &--highlighted {
    outline: 1px dashed rgba(99, 226, 183, 0.75);
  }

  &--locked {
    cursor: not-allowed;
  }

  &__inner {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  &__view {
    display: block;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  &__missing {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 12px;
    color: #f87171;
    border: 1px dashed #f87171;
    background: rgba(127, 29, 29, 0.25);
  }
}
</style>
