export function errorHandler() {
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message,
            };
        }
    };
}


export function csrf() {
    return async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Headers', '*');
        ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        if (ctx.method === 'OPTIONS') {
            ctx.body = 200;
        } else {
            await next();
        }
    }
}