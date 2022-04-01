import Router from "@koa/router";
import { CAPUTRE_ALL_REQUEST } from "./config.js";
import { mapResponse, disableLog, redirect } from "./utils.js";

export const router = new Router();

// Add Code Here

// Example
// 1. disable some api log 
// router.get('/', disableLog())
// 
// 2. change response body
// https://api.github.com/users/tbxark
// router.get( "/users/:name", mapResponse((res, ctx) => {
//     // const { params, query } = ctx;
//     return {
//       ...res,
//       login: `Inject: ${res.login}`
//     };
//   })
// );








// Final
// --------------------------------
// change `mapResponse` to `disableLog` or `redirect` to disable others api log
if (CAPUTRE_ALL_REQUEST) {
  router.all("(.*)", mapResponse());
} else {
  router.all("(.*)", redirect());
}
