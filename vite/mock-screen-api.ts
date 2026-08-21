import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const SCREENS_DIR = path.resolve(process.cwd(), 'data/screens')

function ensureDir() {
  if (!fs.existsSync(SCREENS_DIR)) {
    fs.mkdirSync(SCREENS_DIR, { recursive: true })
  }
}

function screenFilePath(id: string) {
  // 防止路径穿越
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(SCREENS_DIR, `${safeId}.json`)
}

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

/**
 * 开发态模拟后端：把大屏 Schema 读写到 data/screens/*.json
 *
 * GET  /api/screens           → 列表
 * GET  /api/screens/:id       → 读取文档
 * PUT  /api/screens/:id       → 保存文档（整份 schema）
 * POST /api/screens           → 新建（body 含 schema）
 */
export function mockScreenApiPlugin(): Plugin {
  return {
    name: 'mock-screen-api',
    configureServer(server) {
      ensureDir()

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/api/screens')) {
          next()
          return
        }

        try {
          // 列表
          if (url === '/api/screens' && req.method === 'GET') {
            ensureDir()
            const files = fs.readdirSync(SCREENS_DIR).filter((f) => f.endsWith('.json'))
            const list = files.map((file) => {
              const raw = fs.readFileSync(path.join(SCREENS_DIR, file), 'utf-8')
              const doc = JSON.parse(raw) as {
                version?: number
                updatedAt?: string
                schema?: { id?: string; name?: string; canvas?: { width?: number; height?: number } }
              }
              return {
                id: doc.schema?.id ?? file.replace(/\.json$/, ''),
                name: doc.schema?.name ?? file,
                version: doc.version ?? 1,
                updatedAt: doc.updatedAt ?? null,
                canvasWidth: doc.schema?.canvas?.width ?? null,
                canvasHeight: doc.schema?.canvas?.height ?? null,
              }
            })
            sendJson(res, 200, { list })
            return
          }

          // 新建
          if (url === '/api/screens' && req.method === 'POST') {
            const body = JSON.parse(await readBody(req)) as {
              schema: { id: string; name: string }
              version?: number
            }
            if (!body?.schema?.id) {
              sendJson(res, 400, { message: 'schema.id 必填' })
              return
            }
            const filePath = screenFilePath(body.schema.id)
            if (fs.existsSync(filePath)) {
              sendJson(res, 409, { message: '大屏已存在' })
              return
            }
            const doc = {
              version: body.version ?? 1,
              updatedAt: new Date().toISOString(),
              schema: body.schema,
            }
            fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf-8')
            sendJson(res, 201, doc)
            return
          }

          const match = url.match(/^\/api\/screens\/([^/]+)$/)
          if (!match) {
            sendJson(res, 404, { message: 'Not Found' })
            return
          }

          const id = match[1]
          const filePath = screenFilePath(id)

          // 读取
          if (req.method === 'GET') {
            if (!fs.existsSync(filePath)) {
              sendJson(res, 404, { message: `未找到大屏: ${id}` })
              return
            }
            const doc = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            sendJson(res, 200, doc)
            return
          }

          // 保存
          if (req.method === 'PUT') {
            const body = JSON.parse(await readBody(req)) as {
              schema: unknown
              version?: number
            }
            if (!body?.schema) {
              sendJson(res, 400, { message: 'schema 必填' })
              return
            }
            ensureDir()
            let nextVersion = body.version ?? 1
            if (fs.existsSync(filePath)) {
              const prev = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as { version?: number }
              nextVersion = (prev.version ?? 0) + 1
            }
            const doc = {
              version: nextVersion,
              updatedAt: new Date().toISOString(),
              schema: body.schema,
            }
            fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf-8')
            sendJson(res, 200, doc)
            return
          }

          sendJson(res, 405, { message: 'Method Not Allowed' })
        } catch (error) {
          sendJson(res, 500, {
            message: error instanceof Error ? error.message : 'Internal Error',
          })
        }
      })
    },
  }
}
