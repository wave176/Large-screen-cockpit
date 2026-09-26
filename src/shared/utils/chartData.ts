/**
 * 图表/组件渲染侧的数据与 props 读取小工具。
 *
 * 动态数据请优先用 `useComponentData`；本文件的 getStaticData 仅作兜底/兼容。
 */

import type { ScreenComponent } from '@/shared/types/schema'
import { colors } from '@/shared/theme/colors'

/** 柱状/折线等「类目 + 数值」静态数据结构 */
export interface CategorySeriesData {
  categories?: string[]
  values?: number[]
  series?: Array<{ name?: string; data?: number[] }>
}

/** 饼图等「名称-数值」项 */
export interface NameValueItem {
  name?: string
  value?: number
}

/**
 * 读取组件静态数据源，缺省返回空对象。
 * 调用方自行指定期望结构 T（如 CategorySeriesData）。
 */
export function getStaticData<T>(component: ScreenComponent): T {
  return (component.dataSource?.data ?? {}) as T
}

/** 读取字符串 props；缺失时用 fallback */
export function getPropString(component: ScreenComponent, key: string, fallback = ''): string {
  return String(component.props[key] ?? fallback)
}

/** 读取数值 props；缺失时用 fallback（经 Number 转换） */
export function getPropNumber(component: ScreenComponent, key: string, fallback = 0): number {
  return Number(component.props[key] ?? fallback)
}

/**
 * 读取布尔 props，兼容属性面板可能写入的字符串/数字。
 * 空串、null、undefined 走 fallback，避免「清空输入」被当成 false。
 */
export function getPropBoolean(component: ScreenComponent, key: string, fallback = false): boolean {
  const value = component.props[key]
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const text = String(value).trim().toLowerCase()
  if (text === 'true' || text === '1' || text === 'yes') return true
  if (text === 'false' || text === '0' || text === 'no') return false
  return Boolean(value)
}

/** ECharts 暗色主题共用文字样式 */
export const chartTextStyle = { color: colors.textMuted, fontSize: 12 }

/** ECharts 暗色坐标轴/分割线样式，供多图表复用 */
export const darkAxis = {
  axisLabel: { color: colors.textMuted },
  axisLine: { lineStyle: { color: colors.axis } },
  splitLine: { lineStyle: { color: colors.split } },
}
