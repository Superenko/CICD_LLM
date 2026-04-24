import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { SyncService } from './services/sync.service';
import { handleApiError } from './utils/api';
import { isDevMode } from './utils/misc';
import apiRouter from './routes';

const ALLOWED_ORIGINS = ['https://llm-app.superenko312.workers.dev'];

if (isDevMode()) {
  ALLOWED_ORIGINS.push('http://localhost:5173');
}

const app = new Hono<{ Bindings: Env }>();

app.use(
  logger(),
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
  })
);

app.onError((err, ctx) => {
  const status =
    err instanceof Error && 'status' in err ? (err.status as ContentfulStatusCode) : 500;

  return ctx.json(handleApiError(err.message), status);
});

app.route('/api', apiRouter);

// SPA fallback: для всіх не-API маршрутів повертаємо index.html для React Router
app.get('*', async (ctx) => {
  const url = new URL(ctx.req.url);
  // Пропускаємо файли зі статичних ресурсів (мають розширення)
  if (url.pathname.includes('.')) {
    return new Response('Not Found', { status: 404 });
  }
  // Для всіх SPA маршрутів — index.html
  const indexRequest = new Request(new URL('/', ctx.req.url).toString(), ctx.req.raw);
  const assetResponse = await ctx.env.ASSETS.fetch(indexRequest);
  return assetResponse;
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  async scheduled(_: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const syncService = new SyncService(env);
    ctx.waitUntil(syncService.syncAll());
  }
};
