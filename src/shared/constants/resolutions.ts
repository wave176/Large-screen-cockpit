/**
 * 编辑器画布分辨率与预览缩放常量。
 *
 * 依赖：`ResolutionPreset`（schema）。
 * 使用方：属性面板分辨率下拉、编辑器预览缩放控件。
 */

import type { ResolutionPreset } from '@/shared/types/schema'

/** 常用大屏分辨率预设（含超宽、竖屏） */
export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: '1920 × 1080 (FHD)', width: 1920, height: 1080 },
  { label: '2560 × 1440 (2K)', width: 2560, height: 1440 },
  { label: '3840 × 2160 (4K)', width: 3840, height: 2160 },
  { label: '3840 × 1080 (超宽)', width: 3840, height: 1080 },
  { label: '1080 × 1920 (竖屏)', width: 1080, height: 1920 },
]

/** 编辑器画布预览缩放档位（相对设计稿 1.0） */
export const EDITOR_PREVIEW_SCALES = [0.25, 0.5, 0.75, 1] as const
