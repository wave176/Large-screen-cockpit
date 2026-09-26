/**
 * 图标目录配置（扩展入口）
 *
 * 新增自定义图标步骤：
 * 1. 把 SVG 放到 src/assets/icons/（打包内）或 public/icons/（静态）
 * 2. 在本文件 iconCatalog 追加一条配置
 * 3. 刷新后组件库「图标」分类自动出现
 *
 * file 规则：
 * - `xxx.svg`          → 读取 src/assets/icons/xxx.svg（推荐，可着色）
 * - `/icons/xxx.svg`   → 读取 public/icons/xxx.svg
 * - `https://...`      → 远端地址（建议 tintable: false）
 *
 * 可着色 SVG 请使用 currentColor 作为 stroke/fill；
 * 多色原创图设 tintable: false，颜色配置将不生效。
 */

import { colors } from '@/shared/theme/colors'

export interface IconCatalogItem {
  /** 唯一 id，写入组件 props.icon */
  id: string
  /** 组件库 / 属性面板显示名 */
  label: string
  /** 见上方 file 规则 */
  file: string
  /** 新建时的默认颜色 */
  defaultColor?: string
  /** 是否跟随颜色配置着色，默认 true */
  tintable?: boolean
  /** 新建时是否显示圆形底，默认 true */
  showBg?: boolean
}

/** 图标清单：只改这里即可扩展 */
export const iconCatalog: IconCatalogItem[] = [
  { id: 'park', label: '园区', file: 'park.svg', defaultColor: colors.primary },
  { id: 'person', label: '人物', file: 'person.svg', defaultColor: colors.primary },
  { id: 'people', label: '人群', file: 'people.svg', defaultColor: colors.primary },
  { id: 'warning', label: '警告', file: 'warning.svg', defaultColor: colors.danger },
  { id: 'building', label: '建筑', file: 'building.svg', defaultColor: colors.primary },
  { id: 'camera', label: '监控', file: 'camera.svg', defaultColor: colors.primary },
  { id: 'car', label: '车辆', file: 'car.svg', defaultColor: colors.primary },
  { id: 'device', label: '设备', file: 'device.svg', defaultColor: colors.primary },
  { id: 'location', label: '位置', file: 'location.svg', defaultColor: colors.primary },
  { id: 'energy', label: '能源', file: 'energy.svg', defaultColor: colors.primary },
  { id: 'shield', label: '安防', file: 'shield.svg', defaultColor: colors.primary },
  { id: 'fire', label: '消防', file: 'fire.svg', defaultColor: colors.danger },
  { id: 'network', label: '网络', file: 'network.svg', defaultColor: colors.primary },
  { id: 'server', label: '服务器', file: 'server.svg', defaultColor: colors.primary },
]

export function getIconCatalogItem(id: string): IconCatalogItem | undefined {
  return iconCatalog.find((item) => item.id === id)
}

export function getIconSelectOptions(): { label: string; value: string }[] {
  return iconCatalog.map((item) => ({ label: item.label, value: item.id }))
}
