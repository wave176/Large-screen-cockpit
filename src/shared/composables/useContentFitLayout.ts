/**
 * 内容驱动组件框尺寸：文字变大时框跟着变，内容始终落在框内。
 */

import { nextTick, watch } from 'vue'
import { useScreenStore } from '@/store/screen'

export interface ContentFitMeasure {
  width: number
  height: number
}

interface UseContentFitLayoutOptions {
  getComponentId: () => string
  /** 触发重新测量的依赖（字号、文案、格式等） */
  getDeps: () => unknown
  measure: () => ContentFitMeasure
  paddingX?: number
  paddingY?: number
  minWidth?: number
  minHeight?: number
}

export function useContentFitLayout(options: UseContentFitLayoutOptions) {
  const screenStore = useScreenStore()
  const paddingX = options.paddingX ?? 24
  const paddingY = options.paddingY ?? 20
  const minWidth = options.minWidth ?? 80
  const minHeight = options.minHeight ?? 36

  async function syncLayout() {
    await nextTick()
    const componentId = options.getComponentId()
    const measured = options.measure()
    const width = Math.max(minWidth, Math.ceil(measured.width + paddingX))
    const height = Math.max(minHeight, Math.ceil(measured.height + paddingY))

    const target = screenStore.schema.components.find((item) => item.id === componentId)
    if (!target || target.locked) return
    if (
      Math.abs(target.layout.width - width) < 2 &&
      Math.abs(target.layout.height - height) < 2
    ) {
      return
    }
    screenStore.updateComponentLayout(componentId, { width, height })
  }

  watch(
    () => [options.getComponentId(), options.getDeps()] as const,
    () => {
      void syncLayout()
    },
    { immediate: true, flush: 'post' },
  )

  return { syncLayout }
}

/** 离屏测量单行文本尺寸（不受组件当前框限制） */
export function measureTextBox(
  text: string,
  style: {
    fontSize: number
    fontWeight?: number | string
    letterSpacing?: string
    fontFamily?: string
  },
): ContentFitMeasure {
  const el = document.createElement('span')
  el.textContent = text || ' '
  el.style.cssText = [
    'position:absolute',
    'left:-99999px',
    'top:0',
    'visibility:hidden',
    'white-space:nowrap',
    'pointer-events:none',
    `font-size:${style.fontSize}px`,
    `font-weight:${style.fontWeight ?? 600}`,
    `letter-spacing:${style.letterSpacing ?? 'normal'}`,
    style.fontFamily ? `font-family:${style.fontFamily}` : '',
    'font-variant-numeric:tabular-nums',
    'line-height:1.2',
  ]
    .filter(Boolean)
    .join(';')
  document.body.appendChild(el)
  const width = el.offsetWidth
  const height = el.offsetHeight
  document.body.removeChild(el)
  return { width, height }
}
