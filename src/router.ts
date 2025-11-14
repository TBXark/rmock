import Router from '@koa/router';
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createMapperUtils} from './mock.js';
import type {RuntimeConfig, RegisterExternalRouter} from './types.js';

const requireModule = createRequire(import.meta.url);

export async function createRouter(config: RuntimeConfig) {
  const router = new Router();
  const utils = createMapperUtils(config);

  if (config.routerPath) {
    await registerExternalRouter(router, utils, config.routerPath);
  }

  if (config.captureAll) {
    router.all(/(.*)/, utils.mapJSON());
  } else {
    router.all(/(.*)/, utils.redirect());
  }

  return router;
}

async function registerExternalRouter(router: Router, utils: ReturnType<typeof createMapperUtils>, filePath: string) {
  try {
    const register = await loadRegisterFunction(filePath);
    const importModule = async (specifier: string) => import(specifier);
    await register(router, utils, importModule);
  } catch (error) {
    console.error(`[rmock] create/run external router error`, error);
  }
}

async function loadRegisterFunction(filePath: string): Promise<RegisterExternalRouter> {
  const absolute = path.resolve(filePath);
  const loader = await loadModule(absolute);
  const register = extractRegister(loader);
  if (!register) {
    throw new Error(`No register function exported from ${absolute}`);
  }
  return register;
}

async function loadModule(filePath: string) {
  try {
    const resolved = requireModule.resolve(filePath);
    delete requireModule.cache[resolved];
    return requireModule(filePath);
  } catch (error: unknown) {
    if (isRequireEsmError(error)) {
      const url = createCacheBustingUrl(filePath);
      return import(url);
    }
    throw error;
  }
}

function extractRegister(moduleExports: any): RegisterExternalRouter | null {
  if (typeof moduleExports?.register === 'function') {
    return moduleExports.register;
  }
  if (typeof moduleExports?.default === 'function') {
    return moduleExports.default;
  }
  if (typeof moduleExports?.default?.register === 'function') {
    return moduleExports.default.register;
  }
  return null;
}

function isRequireEsmError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error) &&
    typeof error === 'object' &&
    error !== null &&
    'code' in (error as Record<string, unknown>) &&
    (error as NodeJS.ErrnoException).code === 'ERR_REQUIRE_ESM';
}

function createCacheBustingUrl(filePath: string) {
  const url = pathToFileURL(filePath);
  url.searchParams.set('updated', Date.now().toString());
  return url.href;
}
