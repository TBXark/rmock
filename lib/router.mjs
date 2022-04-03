import Router from '@koa/router';
import {customMapper, mapJSON, redirect} from './mock.mjs';
import {
  dynamicImportWithVM,
  dynamicImportCjs,
  dynamicImportWithTempFile,
} from './importer.mjs';
import * as config from './config.mjs';
import log from './log.mjs';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

/*

External Router Example

// example.js
// sandbox: fs, fetch, path, log
//
function register(router, utils) {
    const { mapJSON, customMapper, redirect } = utils;

    // 1. disable some api log
    router.get('/', mapJSON(null, { canLog: false }))

    // 2. change response body
    router.get('/status', mapJSON((res, ctx) => {
      return {
        ...res,
        inject: 'Hello World???'
      };
    }))

    // 3. async mapper
    router.get('/users/:id', mapJSON(async (res, ctx) => {
      const { id } = ctx.params;
      const repos = await fetch(`https://api.github.com/users/${id}/repos`).then(res => res.json());
      return {
        ...res,
        repos
      };
    }))
}

// add in esm mode
module.register = register;
// add in cjs mode
exports.register = register;

*/

export async function createRouter(captureAllRequest, externalRouter) {
  const router = new Router();
  if (externalRouter) {
    try {
      const utils = {mapJSON, customMapper, redirect};
      const sandbox = {fs, path, fetch, log};
      switch (config.IMPORTER_MODE) {
        case 'vm': {
          // Compatible with other modes
          sandbox.module = {};
          sandbox.exports = {};
          const {register} = await dynamicImportWithVM(externalRouter, sandbox, 'register'); // eslint-disable-line max-len
          register(router, utils, sandbox, config);
          break;
        }
        case 'cjs': {
          const {register} = dynamicImportCjs(externalRouter);
          register(router, utils, sandbox, config);
          break;
        }
        case 'esm': {
          console.error('This will leak memory and eventually crash your system.'); // eslint-disable-line max-len
          console.error('Please avoid modifying files frequently, resulting in multiple imports.'); // eslint-disable-line max-len
          const {register} = await dynamicImportWithTempFile(externalRouter);
          register(router, utils, sandbox, config);
          break;
        }
      }
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
