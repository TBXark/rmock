import type {Middleware} from 'koa';

export function errorHandler(): Middleware {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      ctx.status = (error as any)?.statusCode ?? (error as any)?.status ?? 500;
      ctx.body = {
        message: (error as Error).message,
      };
    }
  };
}

export function cors(): Middleware {
  return async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', '*');
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (ctx.method === 'OPTIONS') {
      ctx.status = 200;
      return;
    }
    await next();
  };
}
