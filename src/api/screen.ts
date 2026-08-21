/**
 * 大屏文档 HTTP API 客户端（对接 Vite 中间件 / 模拟后端）。
 *
 * 依赖：`ScreenSchema`。
 * 落库形态：data/screens/{id}.json，结构见 ScreenDocument。
 * Store 的 hydrate / persist / saveNow 均经由此模块。
 */

import type { ScreenSchema } from '@/shared/types/schema'

/** 模拟后端落库的文档结构（对应 data/screens/*.json） */
export interface ScreenDocument {
  version: number
  updatedAt: string
  schema: ScreenSchema
}

/** 大屏列表项（首页卡片用，不含完整 schema） */
export interface ScreenListItem {
  id: string
  name: string
  version: number
  updatedAt: string | null
  canvasWidth: number | null
  canvasHeight: number | null
}

/** 统一解析 JSON 响应；非 2xx 抛出带 message 的 Error */
async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { message?: string }
  if (!res.ok) {
    throw new Error(data.message || `请求失败: ${res.status}`)
  }
  return data
}

/** 获取大屏列表 */
export async function fetchScreenList(): Promise<ScreenListItem[]> {
  const res = await fetch('/api/screens')
  const data = await parseResponse<{ list: ScreenListItem[] }>(res)
  return data.list
}

/** 读取单个大屏文档 */
export async function fetchScreenDocument(id: string): Promise<ScreenDocument> {
  const res = await fetch(`/api/screens/${encodeURIComponent(id)}`)
  return parseResponse<ScreenDocument>(res)
}

/**
 * 保存大屏（整份 Schema 写入 JSON 文件，模拟后端）。
 * version 用于乐观锁；服务端校验失败时由 parseResponse 抛错。
 */
export async function saveScreenDocument(
  schema: ScreenSchema,
  version?: number,
): Promise<ScreenDocument> {
  const res = await fetch(`/api/screens/${encodeURIComponent(schema.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema, version }),
  })
  return parseResponse<ScreenDocument>(res)
}

/** 新建大屏文档（POST，version 固定从 1 起） */
export async function createScreenDocument(schema: ScreenSchema): Promise<ScreenDocument> {
  const res = await fetch('/api/screens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema, version: 1 }),
  })
  return parseResponse<ScreenDocument>(res)
}
