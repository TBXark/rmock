import Router from "@koa/router";
import { mapResponse, disableLog, redirect } from "./utils.js";

export const router = new Router();

// Add Code Here

// Example
// 1. disable some api log 
router.get('/', disableLog())
// 2. change response body
router.get( "/users/:name", mapResponse((res, ctx) => {
    // const { params, query } = ctx;
    return {
      ...res,
      login: `Inject: ${res.login}`
    };
  })
);








// Final
// --------------------------------
// change `mapResponse` to `disableLog` or `redirect` to disable others api log
router.all("(.*)", redirect());
