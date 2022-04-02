import Router from "@koa/router";
import {customMapper, mapJSON, redirect} from "./mock.mjs";
import {dynamicImport} from "./utils.mjs";


// example.js
//
// function register(router, utils) {
//
//     const { mapJSON, customMapper, redirect } = utils;
//
//     // 1. disable some api log
//     router.get('/', mapJSON(null, { canLog: false }))
//
//     // 2. change response body
//     router.get('/status', mapJSON((res, ctx) => {
//         return {
//             ...res,
//             inject: 'Hello World???'
//         };
//     }))
// }
//
//

export function createRouter(captureAllRequest, externalRouter) {
    const router = new Router();
    if (externalRouter) {
        try {
            const {register} = dynamicImport(externalRouter, "register");
            register(router, {mapJSON, customMapper, redirect,});
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
