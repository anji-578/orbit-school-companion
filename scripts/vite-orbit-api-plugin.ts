import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Connect, Plugin, ViteDevServer } from 'vite'

const ROUTES: Record<string, string> = {
  '/api/gemini': path.resolve('api/gemini.ts'),
  '/api/ensure-demo': path.resolve('api/ensure-demo.ts'),
  '/api/notify': path.resolve('api/notify.ts'),
  '/api/razorpay/order': path.resolve('api/razorpay/order.ts'),
  '/api/razorpay/verify': path.resolve('api/razorpay/verify.ts'),
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function toRequestHeaders(req: IncomingMessage): Headers {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else {
      headers.set(key, value)
    }
  }
  return headers
}

async function handleOrbitApi(
  server: ViteDevServer,
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
): Promise<void> {
  const urlPath = (req.url ?? '').split('?')[0] ?? ''
  const file = ROUTES[urlPath]
  if (!file) {
    next()
    return
  }
  try {
    const mod = await server.ssrLoadModule(file)
    const handler = mod.default as (request: Request) => Promise<Response>
    const method = req.method ?? 'GET'
    const body = method === 'GET' || method === 'HEAD' || method === 'OPTIONS' ? undefined : await readBody(req)
    const origin = `http://${req.headers.host ?? '127.0.0.1'}`
    const request = new Request(`${origin}${req.url ?? urlPath}`, {
      method,
      headers: toRequestHeaders(req),
      body: body && body.length > 0 ? new Uint8Array(body) : undefined,
    })
    const response = await handler(request)
    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    const buf = Buffer.from(await response.arrayBuffer())
    res.end(buf)
  } catch (err) {
    next(err)
  }
}

/** Serves `/api/*` Vercel handlers during `vite` so GEMINI_API_KEY in `.env` works locally. */
export function orbitApiPlugin(): Plugin {
  return {
    name: 'orbit-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleOrbitApi(server, req, res, next)
      })
    },
  }
}
