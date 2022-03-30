import Router from "@koa/router";
import { mapBody } from "./utils.js";

export const router = new Router();

// Add Code Here
router.get( "/users/:name", mapBody((res) => {
    return {
      ...res,
      login: `Inject: ${res.login}`
    };
  })
);

// --------------------------------
router.all("(.*)", mapBody());
