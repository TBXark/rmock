import Router from "@koa/router";
import { mapBody, disableLog } from "./utils.js";

export const router = new Router();

// Add Code Here

// Example
// 1. disable some api log 
router.get('/', disableLog())
// 2. change response body
router.get( "/users/:name", mapBody((res, ctx) => {
    // const { params, query } = ctx;
    return {
      ...res,
      login: `Inject: ${res.login}`
    };
  })
);








// Final
// --------------------------------
// change `mapBody` to `disableLog` to disable others api log
router.all("(.*)", mapBody());
