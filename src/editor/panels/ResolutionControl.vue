<script setup lang="ts">
/**
 * 工具栏分辨率控件：预设下拉 + 自定义宽高 Popover。
 * 改尺寸走 screenStore.setCanvasSize，画布会随之居中并刷新 Moveable。
 */
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  NButton,
  NInputNumber,
  NPopover,
  NSelect,
  NSpace,
  NTag,
} from 'naive-ui'
import { useScreenStore } from '@/store/screen'
import { RESOLUTION_PRESETS } from '@/shared/constants/resolutions'

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)

/** 下拉中「自定义」哨兵值，非真实分辨率 */
const CUSTOM_VALUE = '__custom__'
const customWidth = ref(schema.value.canvas.width)
const customHeight = ref(schema.value.canvas.height)
const showPopover = ref(false)

const presetOptions = [
  ...RESOLUTION_PRESETS.map((item) => ({
    label: item.label,
    value: `${item.width}x${item.height}`,
  })),
  { label: '自定义分辨率…', value: CUSTOM_VALUE },
]

const currentPreset = ref<string>(
  presetOptions.some(
    (item) => item.value === `${schema.value.canvas.width}x${schema.value.canvas.height}`,
  )
    ? `${schema.value.canvas.width}x${schema.value.canvas.height}`
    : CUSTOM_VALUE,
)

/** schema 尺寸被其它入口改动时，同步下拉与自定义输入框 */
watch(
  () => [schema.value.canvas.width, schema.value.canvas.height],
  ([width, height]) => {
    customWidth.value = width
    customHeight.value = height
    const key = `${width}x${height}`
    currentPreset.value = presetOptions.some((item) => item.value === key) ? key : CUSTOM_VALUE
  },
)

function handlePresetChange(value: string) {
  currentPreset.value = value
  if (value === CUSTOM_VALUE) {
    showPopover.value = true
    return
  }

  const [width, height] = value.split('x').map(Number)
  if (width && height) {
    screenStore.setCanvasSize(width, height)
  }
}

function applyCustomResolution() {
  if (!customWidth.value || !customHeight.value) return
  screenStore.setCanvasSize(customWidth.value, customHeight.value)
  showPopover.value = false
}
</script>

<template>
  <NSpace align="center" :size="8">
    <NSelect
      :value="currentPreset"
      :options="presetOptions"
      style="width: 200px"
      @update:value="handlePresetChange"
    />

    <NPopover v-model:show="showPopover" trigger="manual" placement="bottom">
      <template #trigger>
        <NButton
          :type="currentPreset === CUSTOM_VALUE ? 'primary' : 'default'"
          @click="showPopover = !showPopover"
        >
          自定义
        </NButton>
      </template>

      <div class="resolution-control">
        <div class="resolution-control__title">自定义画布分辨率</div>
        <div class="resolution-control__fields">
          <label>
            <span>宽度 (px)</span>
            <NInputNumber v-model:value="customWidth" :min="320" :max="7680" :step="1" />
          </label>
          <label>
            <span>高度 (px)</span>
            <NInputNumber v-model:value="customHeight" :min="240" :max="4320" :step="1" />
          </label>
        </div>
        <div class="resolution-control__current">
          当前：{{ schema.canvas.width }} × {{ schema.canvas.height }}
        </div>
        <NSpace justify="end">
          <NButton size="small" @click="showPopover = false">取消</NButton>
          <NButton size="small" type="primary" @click="applyCustomResolution">应用</NButton>
        </NSpace>
      </div>
    </NPopover>

    <NTag size="small" :bordered="false">
      {{ schema.canvas.width }} × {{ schema.canvas.height }}
    </NTag>
  </NSpace>
</template>

<style scoped lang="scss">
.resolution-control {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  &__fields {
    display: grid;
    gap: 10px;

    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      color: #94a3b8;
    }
  }

  &__current {
    font-size: 12px;
    color: #64748b;
  }
}
</style>
