import Router from "@koa/router";
import {customMapper, mapJSON, redirect} from "./mock.mjs";
import {dynamicImport} from "./utils.mjs";
import log from "./log.mjs";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as config from "./config.mjs";

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

*/

export function createRouter(captureAllRequest, externalRouter) {
    const router = new Router();
    if (externalRouter) {
        try {
            const sandbox = {fs, path, fetch, log}
            const {register} = dynamicImport(externalRouter, sandbox, "register");
            register(router, {mapJSON, customMapper, redirect,}, config);
        } catch (error) {
            console.log(
                "create/run external router register function error",
                error.message
            );
        }
    }
    if (captureAllRequest) {
        router.all("(.*)", mapJSON());
    } else {
        router.all("(.*)", redirect());
    }
    return router;
}
