import type { ScreenSchema } from '@/shared/types/schema'

/** 模拟后端落库的文档结构（对应 data/screens/*.json） */
export interface ScreenDocument {
  version: number
  updatedAt: string
  schema: ScreenSchema
}

export interface ScreenListItem {
  id: string
  name: string
  version: number
  updatedAt: string | null
  canvasWidth: number | null
  canvasHeight: number | null
}

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

/** 保存大屏（整份 Schema 写入 JSON 文件，模拟后端） */
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

/** 新建大屏文档 */
export async function createScreenDocument(schema: ScreenSchema): Promise<ScreenDocument> {
  const res = await fetch('/api/screens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema, version: 1 }),
  })
  return parseResponse<ScreenDocument>(res)
}
