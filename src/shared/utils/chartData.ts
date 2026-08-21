import type { ScreenComponent } from '@/shared/types/schema'

export interface CategorySeriesData {
  categories?: string[]
  values?: number[]
  series?: Array<{ name?: string; data?: number[] }>
}

export interface NameValueItem {
  name?: string
  value?: number
}

export function getStaticData<T>(component: ScreenComponent): T {
  return (component.dataSource?.data ?? {}) as T
}

export function getPropString(component: ScreenComponent, key: string, fallback = ''): string {
  return String(component.props[key] ?? fallback)
}

export function getPropNumber(component: ScreenComponent, key: string, fallback = 0): number {
  return Number(component.props[key] ?? fallback)
}

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

export const chartTextStyle = { color: '#94a3b8', fontSize: 12 }

export const darkAxis = {
  axisLabel: { color: '#94a3b8' },
  axisLine: { lineStyle: { color: '#334155' } },
  splitLine: { lineStyle: { color: '#1e293b' } },
}
