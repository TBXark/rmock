import http from 'node:http';
import process from 'node:process';
import ip from 'ip';
import chokidar from 'chokidar';
import type {FSWatcher} from 'chokidar';
import type Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import type {Middleware as KoaMiddleware} from 'koa';
import {createRouter} from './router.js';
import {cors, errorHandler} from './middleware.js';
import {summarizeConfig} from './config.js';
import type {RuntimeConfig} from './types.js';

export class ServerController {
  private app: Koa | null = null;
  private server: http.Server | null = null;
  private routerMiddleware?: KoaMiddleware;
  private routerAllowedMiddleware?: KoaMiddleware;
  private watcher?: FSWatcher;

  constructor(private readonly config: RuntimeConfig) {}

  async start() {
    if (this.server) {
      return;
    }
    const app = new Koa();
    this.app = app;

    app
        .use(errorHandler())
        .use(cors())
        .use(bodyParser());

    const router = await createRouter(this.config);
    this.installRouter(router);

    this.server = http.createServer(app.callback());
    await new Promise<void>((resolve) => {
      this.server?.listen(this.config.port, '0.0.0.0', resolve);
    });

    this.printBanner();
    this.startWatcher();
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
    }
    if (this.server) {
      await new Promise<void>((resolve) => this.server?.close(() => resolve()));
      this.server = null;
    }
  }

  private async reloadRouter() {
    if (!this.app) {
      return;
    }
    const router = await createRouter(this.config);
    this.replaceRouter(router);
    console.log(`[rmock] Router reloaded at ${new Date().toLocaleTimeString()}`);
  }

  private installRouter(router: Router) {
    if (!this.app) {
      return;
    }
    const routes = router.routes() as unknown as KoaMiddleware;
    const allowed = router.allowedMethods() as unknown as KoaMiddleware;
    this.routerMiddleware = routes;
    this.routerAllowedMiddleware = allowed;
    this.app.use(routes);
    this.app.use(allowed);
  }

  private replaceRouter(router: Router) {
    if (!this.app) {
      return;
    }
    const nextRoutes = router.routes() as unknown as KoaMiddleware;
    const nextAllowed = router.allowedMethods() as unknown as KoaMiddleware;
    this.swapMiddleware(this.routerMiddleware, nextRoutes);
    this.swapMiddleware(this.routerAllowedMiddleware, nextAllowed);
    this.routerMiddleware = nextRoutes;
    this.routerAllowedMiddleware = nextAllowed;
  }

  private swapMiddleware(previous: KoaMiddleware | undefined, next: KoaMiddleware) {
    if (!this.app) {
      return;
    }
    if (!previous) {
      this.app.use(next);
      return;
    }
    const index = this.app.middleware.indexOf(previous);
    if (index === -1) {
      this.app.use(next);
      return;
    }
    this.app.middleware.splice(index, 1, next);
  }

  private startWatcher() {
    if (!this.config.routerPath || !this.config.watchRouter) {
      return;
    }
    this.watcher = chokidar.watch(this.config.routerPath, {ignoreInitial: true});
    this.watcher.on('change', () => {
      void this.reloadRouter();
    });
  }

  private printBanner() {
    console.log('\n', JSON.stringify(summarizeConfig(this.config), null, 2));
    console.log(`\nProcess Id: ${process.pid}\n`);
    console.log(`Server: http://${ip.address()}:${this.config.port}\n`);
  }
}
