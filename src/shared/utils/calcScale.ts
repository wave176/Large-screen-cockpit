/**
 * 画布缩放计算与简易 ID 生成。
 *
 * 依赖：`ScaleMode` / `ScaleResult`（schema）。
 * 使用场景：编辑器预览、运行时适配视口；createId 供 store 新建组件/组。
 */

import type { ScaleMode, ScaleResult } from '@/shared/types/schema'

/**
 * 根据设计稿尺寸与视口尺寸计算缩放比例。
 *
 * - none：不缩放（1:1）
 * - stretch：分别拉伸 X/Y，可能变形
 * - fill：等比放大至铺满（可能裁切）
 * - fit（默认）：等比缩小至完整可见（可能留边）
 */
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

  // fit：取较小边，保证完整落入视口
  const scale = Math.min(scaleX, scaleY)
  return { scaleX: scale, scaleY: scale }
}

/**
 * 生成带前缀的短唯一 id（时间戳 + 随机段）。
 * 非加密场景足够；prefix 便于在调试时区分组件/组来源。
 */
export function createId(prefix = 'cmp'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
