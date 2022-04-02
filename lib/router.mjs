import Router from "@koa/router";
import { mapResponse, disableLog, redirect } from "./mock.mjs";
import { dynamicImport } from "./utils.mjs";


// Example
//
// 1. disable some api log
// router.get('/', disableLog())
//
// 2. change response body
// // https://api.github.com/users/tbxark
// router.get( "/users/:name", mapResponse((res, ctx) => {
//     // const { params, query } = ctx;
//     return {
//       ...res,
//       login: `Inject: ${res.login}`
//     };
//   })
// );

// Import from external file
//
// function register(router, utils) {
//   const { mapResponse, disableLog, redirect } = utils;
//   router.get('/status', mapResponse((res, ctx) => {
//     return {
//       ...res,
//       inject: 'Hello World!!!'
//     };
//   }))
// }

export function createRouter(captureAllRequest, externalRouter) {
  const router = new Router();
  if (externalRouter) {
    try {
      const { register } = dynamicImport(externalRouter, "register");
      register(router, { mapResponse, disableLog, redirect });
    } catch (error) {
      console.log(
        "create/run external router register function error",
        error.message
      );
    }
  }
  if (captureAllRequest) {
    router.all("(.*)", mapResponse());
  } else {
    router.all("(.*)", redirect());
  }
  return router;
}
