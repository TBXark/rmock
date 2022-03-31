import Router from "@koa/router";
import { mapBody } from "./utils.js";

export const router = new Router();

// Add Code Here

// Example
router.get( "/users/:name", mapBody((res, ctx) => {
    const { params, query } = ctx;
    console.log(params);
    return {
      ...res,
      login: `Inject: ${res.login}`
    };
  })
);








// Final
// --------------------------------
router.all("(.*)", mapBody());
