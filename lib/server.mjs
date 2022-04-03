import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import {createRouter} from './router.mjs';
import {csrf, errorHandler} from './middleware.mjs';
import * as config from './config.mjs';
import ip from 'ip';
import http from 'http';


export class Server {
  constructor() {
    this.server = null;
  }

  async start() {
    const app = await this.createServerApp();
    this.server = http.createServer(app.callback());
    this.server.listen(config.SERVER_PORT, '0.0.0.0');
  }

  async restart() {
    const app = await this.createServerApp({isRestart: true});
    this.server.removeAllListeners('request');
    this.server.on('request', app.callback());
  }

  async createServerApp(ctx) {
    const app = new Koa();
    const { isRestart = false } = ctx || {}
    const router = await createRouter(
        config.CAPTURE_ALL_REQUEST,
        config.DYNAMIC_ROUTER_PATH,
    );
    app
        .use(errorHandler())
        .use(csrf())
        .use(bodyParser())
        .use(router.routes())
        .use(router.allowedMethods());
    console.log('\n', JSON.stringify(config, null, 2));
    console.log(`\nServer: http://${ip.address()}:${config.SERVER_PORT}${isRestart ? '\n': '\n\n\n\n'}`);
    return app;
  }
}
