import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { router } from "./router.js";
import { errorHandler, csrf } from "./middleware.js";
import ip from "ip"
import * as config from "./config.js";

const app = new Koa();
app.use(errorHandler()).use(csrf()).use(bodyParser()).use(router.routes()).use(router.allowedMethods());
app.listen(config.SERVER_PORT, "0.0.0.0");
console.log("\n", JSON.stringify(config, null, 2));
console.log(`\nServer: http://${ip.address()}:${config.SERVER_PORT}\n\n\n\n`)

