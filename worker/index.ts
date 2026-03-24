import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { SyncService } from './services/sync.service';
import { handleApiError } from './utils/api';
import { isDevMode } from './utils/misc';
import apiRouter from './routes';

const ALLOWED_ORIGINS = ['https://llm-app.brett-4e2.workers.dev'];

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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  async scheduled(_: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const syncService = new SyncService(env);
    ctx.waitUntil(syncService.syncAll());
  }
};
