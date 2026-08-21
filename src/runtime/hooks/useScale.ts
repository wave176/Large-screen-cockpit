/**
 * 运行时画布适配：根据容器/窗口尺寸与 scaleMode 计算 scaleX/scaleY。
 * 挂到 wrapperRef 上的元素 clientWidth/Height 优先；否则退回窗口尺寸。
 * 返回值供 ScreenCanvas 做 transform:scale，不修改 schema 内的布局坐标。
 */
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { calcScale } from '@/shared/utils/calcScale'
import type { ScaleMode, ScaleResult } from '@/shared/types/schema'

export function useScale(
  canvasWidth: Ref<number>,
  canvasHeight: Ref<number>,
  scaleMode: Ref<ScaleMode>,
) {
  const wrapperRef = ref<HTMLElement | null>(null)
  const { width: windowWidth, height: windowHeight } = useWindowSize()
  const scale = ref<ScaleResult>({ scaleX: 1, scaleY: 1 })

  /** 设计分辨率 → 视口可用区域的缩放系数（fit/fill/stretch/none 由 calcScale 实现） */
  function updateScale() {
    const viewportW = wrapperRef.value?.clientWidth ?? windowWidth.value
    const viewportH = wrapperRef.value?.clientHeight ?? windowHeight.value

    scale.value = calcScale(
      canvasWidth.value,
      canvasHeight.value,
      viewportW,
      viewportH,
      scaleMode.value,
    )
  }

  onMounted(updateScale)
  watch([canvasWidth, canvasHeight, scaleMode, windowWidth, windowHeight], updateScale)

  onMounted(() => {
    window.addEventListener('resize', updateScale)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
  })

  return {
    wrapperRef,
    scale,
    updateScale,
  }
}
