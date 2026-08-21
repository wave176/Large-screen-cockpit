import type { ResolutionPreset } from '@/shared/types/schema'

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: '1920 × 1080 (FHD)', width: 1920, height: 1080 },
  { label: '2560 × 1440 (2K)', width: 2560, height: 1440 },
  { label: '3840 × 2160 (4K)', width: 3840, height: 2160 },
  { label: '3840 × 1080 (超宽)', width: 3840, height: 1080 },
  { label: '1080 × 1920 (竖屏)', width: 1080, height: 1920 },
]

export const EDITOR_PREVIEW_SCALES = [0.25, 0.5, 0.75, 1] as const
