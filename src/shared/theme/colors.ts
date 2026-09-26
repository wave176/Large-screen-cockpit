/**
 * 主体配色 JS 令牌（与 styles/theme.scss 保持一致）。
 * 供 ECharts option、registry 默认 props、无法使用 CSS 变量的逻辑读取。
 */

export const colors = {
  primary: '#38bdf8',
  primaryStrong: '#7dd3fc',
  primaryBright: '#67e8f9',
  success: '#63e2b7',
  warning: '#fbbf24',
  danger: '#f87171',
  accent: '#a78bfa',
  accent2: '#f472b6',
  mapMid: '#1e3a5f',

  bgPage: '#020617',
  bgPanel: '#0f172a',
  bgElevated: '#1e293b',
  bgInput: '#020617',
  bgDeep: '#0d1b2a',
  bgBoard: '#111827',

  textPrimary: '#e2e8f0',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  textFaint: '#475569',
  textHighlight: '#e0f2fe',

  axis: '#334155',
  split: '#1e293b',

  /** 主色半透明（ECharts 等不支持 CSS var 的场景） */
  primaryA45: 'rgba(56, 189, 248, 0.45)',
  panelA20: 'rgba(15, 23, 42, 0.2)',
  elevatedA25: 'rgba(30, 41, 59, 0.25)',
} as const

/** 图表默认色板 */
export const chartPalette = [
  colors.primary,
  colors.success,
  colors.warning,
  colors.accent,
  colors.accent2,
] as const

export type ThemeColorKey = keyof typeof colors
