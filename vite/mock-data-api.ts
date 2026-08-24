/**
 * 开发态演示数据 API（Vite 中间件）
 *
 * - GET  /api/demo/chart-bar|chart-line|chart-pie|chart-radar|scroll-table
 * - POST /api/data/sql  body: { sql?, sqlId? } → 按关键字返回演示结构（不真正连库）
 *
 * 生产请替换为真实 HTTP / SQL 网关；浏览器不要直连数据库。
 */

import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function jitter(base: number, range = 8): number {
  return Math.max(0, Math.round(base + (Math.random() * 2 - 1) * range))
}

const demos: Record<string, () => unknown> = {
  'chart-bar': () => ({
    data: {
      categories: ['A区', 'B区', 'C区', 'D区'],
      values: [jitter(120), jitter(90), jitter(150), jitter(80)],
    },
  }),
  'chart-line': () => ({
    data: {
      categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      values: [jitter(12, 4), jitter(8, 3), jitter(15, 4), jitter(6, 2), jitter(10, 3), jitter(4, 2), jitter(7, 3)],
    },
  }),
  'chart-pie': () => ({
    data: {
      items: [
        { name: '在线', value: jitter(40, 10) },
        { name: '离线', value: jitter(20, 6) },
        { name: '告警', value: jitter(15, 5) },
        { name: '维护', value: jitter(10, 4) },
      ],
    },
  }),
  'chart-radar': () => ({
    data: {
      indicators: [
        { name: '性能', max: 100 },
        { name: '稳定', max: 100 },
        { name: '安全', max: 100 },
        { name: '体验', max: 100 },
        { name: '成本', max: 100 },
      ],
      series: [
        { name: '本期', value: [jitter(80, 10), jitter(72, 10), jitter(90, 8), jitter(68, 10), jitter(75, 10)] },
        { name: '上期', value: [65, 70, 78, 60, 80] },
      ],
    },
  }),
  'scroll-table': () => ({
    data: {
      rows: [
        { rank: 1, name: 'A区域', value: jitter(1280, 40) },
        { rank: 2, name: 'B区域', value: jitter(1120, 40) },
        { rank: 3, name: 'C区域', value: jitter(980, 30) },
        { rank: 4, name: 'D区域', value: jitter(860, 30) },
        { rank: 5, name: 'E区域', value: jitter(740, 30) },
      ],
    },
  }),
}

function resolveSqlDemo(sql?: string, sqlId?: string): unknown {
  const key = `${sqlId ?? ''} ${sql ?? ''}`.toLowerCase()
  if (key.includes('pie') || key.includes('占比')) return demos['chart-pie']()
  if (key.includes('radar') || key.includes('雷达')) return demos['chart-radar']()
  if (key.includes('line') || key.includes('趋势') || key.includes('告警')) {
    return demos['chart-line']()
  }
  if (key.includes('rank') || key.includes('排行') || key.includes('scroll')) {
    return demos['scroll-table']()
  }
  // 默认柱状类目结构
  return demos['chart-bar']()
}

export function mockDataApiPlugin(): Plugin {
  return {
    name: 'mock-data-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''

        try {
          if (url.startsWith('/api/demo/') && req.method === 'GET') {
            const name = url.slice('/api/demo/'.length)
            const factory = demos[name]
            if (!factory) {
              sendJson(res, 404, { message: `未知演示接口: ${name}` })
              return
            }
            sendJson(res, 200, factory())
            return
          }

          if (url === '/api/data/sql' && req.method === 'POST') {
            const raw = await readBody(req)
            const body = raw ? (JSON.parse(raw) as { sql?: string; sqlId?: string }) : {}
            // 演示：不执行真实 SQL，按关键字返回结构化数据
            const payload = resolveSqlDemo(body.sql, body.sqlId) as { data?: unknown }
            sendJson(res, 200, {
              ok: true,
              // 与 http demo 一致：外层可配 dataPath=data
              data: payload.data ?? payload,
              meta: {
                mock: true,
                sqlId: body.sqlId ?? null,
                hint: '开发态 Mock，未连接真实数据库',
              },
            })
            return
          }

          next()
        } catch (error) {
          sendJson(res, 500, {
            message: error instanceof Error ? error.message : 'data api error',
          })
        }
      })
    },
  }
}
