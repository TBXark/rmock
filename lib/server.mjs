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

  start() {
    const app = this.createServerApp();
    this.server = http.createServer(app.callback());
    this.server.listen(config.SERVER_PORT, '0.0.0.0');
  }

  restart() {
    const app = this.createServerApp();
    this.server.removeAllListeners('request');
    this.server.on('request', app.callback());
  }

  createServerApp() {
    const app = new Koa();
    const router = createRouter(
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
    console.log(`\nServer: http://${ip.address()}:${config.SERVER_PORT}\n\n\n\n`);
    return app;
  }
}
