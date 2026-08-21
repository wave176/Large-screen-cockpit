import type { ScaleMode, ScaleResult } from '@/shared/types/schema'

export function calcScale(
  canvasW: number,
  canvasH: number,
  viewportW: number,
  viewportH: number,
  mode: ScaleMode = 'fit',
): ScaleResult {
  if (mode === 'none') {
    return { scaleX: 1, scaleY: 1 }
  }

  const scaleX = viewportW / canvasW
  const scaleY = viewportH / canvasH

  if (mode === 'stretch') {
    return { scaleX, scaleY }
  }

  if (mode === 'fill') {
    const scale = Math.max(scaleX, scaleY)
    return { scaleX: scale, scaleY: scale }
  }

  const scale = Math.min(scaleX, scaleY)
  return { scaleX: scale, scaleY: scale }
}

export function createId(prefix = 'cmp'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
