/**
 * 解析图标资源：配置 id → SVG 原始内容或外部 URL。
 */

import { getIconCatalogItem, type IconCatalogItem } from '@/components/icons/iconCatalog'

/** 打包内 SVG（?raw） */
const bundledSvgModules = import.meta.glob('../../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function bundledKey(fileName: string): string | undefined {
  const needle = `/${fileName}`.replace(/\\/g, '/')
  return Object.keys(bundledSvgModules).find((key) => key.replace(/\\/g, '/').endsWith(needle))
}

export interface ResolvedIcon {
  item: IconCatalogItem
  /** 原始 SVG 文本（打包资源） */
  svg?: string
  /** 外链 / public 路径 */
  url?: string
  tintable: boolean
}

/** 去掉固定宽高，保证容器内等比缩放 */
export function normalizeSvgMarkup(raw: string): string {
  return raw
    .replace(/\s(width|height)="[^"]*"/gi, '')
    .replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => {
      let next = String(attrs)
      if (!/\bxmlns=/.test(next)) {
        next += ' xmlns="http://www.w3.org/2000/svg"'
      }
      if (!/\bpreserveAspectRatio=/.test(next)) {
        next += ' preserveAspectRatio="xMidYMid meet"'
      }
      return `<svg${next}>`
    })
}

/**
 * 生成可直接用于 <img src> 的 data URL。
 * 可着色时把 currentColor 替换成实际颜色（避免 v-html 解析丢 rect/circle）。
 */
export function svgToDataUrl(raw: string, color?: string): string {
  let markup = normalizeSvgMarkup(raw)
  if (color) {
    markup = markup
      .replace(/currentColor/gi, color)
      .replace(
        /(stroke|fill)=["']currentColor["']/gi,
        (_m, attr: string) => `${attr}="${color}"`,
      )
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
}

export function resolveIcon(id: string): ResolvedIcon | null {
  const item = getIconCatalogItem(id) ?? getIconCatalogItem('park')
  if (!item) return null

  const tintable = item.tintable !== false
  const file = item.file.trim()

  if (/^(https?:)?\/\//.test(file) || file.startsWith('/')) {
    return { item, url: file, tintable }
  }

  const key = bundledKey(file)
  if (key) {
    return {
      item,
      svg: bundledSvgModules[key] ?? '',
      tintable,
    }
  }

  return { item, url: `/icons/${file}`, tintable }
}
