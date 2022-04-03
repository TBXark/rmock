import Router from '@koa/router';
import {customMapper, mapJSON, redirect} from './mock.mjs';
import {createRequire} from 'module';
import path from 'path';

export function dynamicImport(uri) {
  const require = createRequire(import.meta.url);
  const modulePath = path.resolve(uri);
  if (require.cache[modulePath]) {
    delete require.cache[modulePath];
  }
  return require(modulePath);
}


export async function createRouter(captureAllRequest, externalRouter) {
  const router = new Router();
  if (externalRouter) {
    try {
      const utils = {mapJSON, customMapper, redirect};
      const {register} = dynamicImport(externalRouter);
      const importModule = async (name) => {
        return await import(name);
      };
      await register(router, utils, importModule);
    } catch (error) {
      console.log(
          'create/run external router register function error',
          error.message,
      );
    }
  }
  if (captureAllRequest) {
    router.all('(.*)', mapJSON());
  } else {
    router.all('(.*)', redirect());
  }
  return router;
}
