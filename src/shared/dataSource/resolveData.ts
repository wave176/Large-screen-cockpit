/**
 * 动态数据源：请求、路径抽取、字段映射、JS 脚本转换。
 */

import type { DataSourceConfig } from '@/shared/types/schema'
import {
  runTransformScript,
  type TransformComponentContext,
} from '@/shared/dataSource/runTransformScript'

/** 按 a.b.0.c 从对象取值 */
export function getByPath(source: unknown, path?: string): unknown {
  if (!path || !path.trim()) return source
  const segments = path.split('.').filter(Boolean)
  let cursor: unknown = source
  for (const key of segments) {
    if (cursor == null || typeof cursor !== 'object') return undefined
    cursor = (cursor as Record<string, unknown>)[key]
  }
  return cursor
}

/**
 * mapping: 组件字段 → 远端字段。
 * 从 remote 取出远端字段，写入以组件字段为 key 的新对象。
 */
export function applyFieldMapping(
  remote: unknown,
  mapping?: Record<string, string>,
): unknown {
  if (!mapping || !Object.keys(mapping).length) return remote
  if (remote == null || typeof remote !== 'object' || Array.isArray(remote)) {
    return remote
  }
  const src = remote as Record<string, unknown>
  const out: Record<string, unknown> = { ...src }
  for (const [localKey, remoteKey] of Object.entries(mapping)) {
    if (!remoteKey) continue
    out[localKey] = getByPath(src, remoteKey)
  }
  return out
}

function asObjectData(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return { value }
}

/** 接口有时返回 JSON 字符串（甚至双重编码），尝试解析为对象 */
export function coerceJsonValue(value: unknown, maxDepth = 3): unknown {
  let cursor = value
  for (let i = 0; i < maxDepth; i++) {
    if (typeof cursor !== 'string') break
    const trimmed = cursor.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) break
    try {
      cursor = JSON.parse(trimmed) as unknown
    } catch {
      break
    }
  }
  return cursor
}

async function fetchHttp(config: DataSourceConfig): Promise<unknown> {
  if (!config.url?.trim()) {
    throw new Error('HTTP 数据源未配置 url')
  }
  const method = config.method ?? 'GET'
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(config.headers ?? {}),
  }
  const init: RequestInit = { method, headers }
  if (method === 'POST') {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }
    init.body = config.body ?? '{}'
  }
  const res = await fetch(config.url, init)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

async function fetchSql(config: DataSourceConfig): Promise<unknown> {
  const res = await fetch('/api/data/sql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sql: config.sql,
      sqlId: config.sqlId,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `SQL 代理错误 ${res.status}`)
  }
  return res.json()
}

/** dataPath → mapping → transformScript */
export function applyDataPipeline(
  raw: unknown,
  config: DataSourceConfig,
  component?: TransformComponentContext,
): unknown {
  let data = raw
  if (config.type !== 'static') {
    data = getByPath(raw, config.dataPath)
    data = applyFieldMapping(data, config.mapping)
  } else if (config.transformScript?.trim()) {
    // 数据样例也可走脚本转换
    data = raw
  }
  return runTransformScript(config.transformScript, data, component)
}

/**
 * 解析组件最终数据（含静态 / HTTP / SQL）。
 * WebSocket 请走订阅后在消息回调里调 applyDataPipeline。
 */
export async function resolveComponentData(
  config: DataSourceConfig,
  component?: TransformComponentContext,
): Promise<unknown> {
  if (config.type === 'static') {
    return applyDataPipeline(config.data ?? {}, config, component)
  }
  if (config.type === 'websocket') {
    throw new Error('WebSocket 数据源请使用订阅模式，不能单次 resolve')
  }

  let raw: unknown
  switch (config.type) {
    case 'http':
      raw = await fetchHttp(config)
      break
    case 'sql':
      raw = await fetchSql(config)
      break
    default:
      raw = config.data ?? {}
  }
  return applyDataPipeline(raw, config, component)
}

/** @deprecated 使用 resolveComponentData */
export async function resolveDynamicData(config: DataSourceConfig): Promise<unknown> {
  return resolveComponentData(config)
}

/** 将结果规范为组件常用的对象形态 */
export function normalizeComponentData(value: unknown): Record<string, unknown> {
  return asObjectData(value)
}
