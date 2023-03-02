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
    this.app = null;
  }

  async start() {
    this.app = await this.createServerApp();
    this.server = http.createServer(this.app.callback());
    this.server.listen(config.SERVER_PORT, '0.0.0.0');
    console.log('\n', JSON.stringify(config, null, 2));
    console.log(`\nProcess Id: ${process.pid}\n`)
    console.log(`\nServer: http://${ip.address()}:${config.SERVER_PORT}'\n\n\n\n`);
  }

  async restart() {
    const router = await createRouter(
      config.CAPTURE_ALL_REQUEST,
      config.DYNAMIC_ROUTER_PATH,
    );
    this.app.middleware.splice(3, 1, router.routes())
    console.log('\n', JSON.stringify(config, null, 2));
    console.log(`\nServer: http://${ip.address()}:${config.SERVER_PORT}\n`);
  }

  async createServerApp() {
    const app = new Koa();
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
    return app;
  }
}
