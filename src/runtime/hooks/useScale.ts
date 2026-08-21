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
