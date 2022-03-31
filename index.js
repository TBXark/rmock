import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { router } from "./router.js";
import { errorHandler, csrf } from "./middleware.js";
import ip from "ip"

const app = new Koa();
app.use(errorHandler()).use(csrf()).use(bodyParser()).use(router.routes()).use(router.allowedMethods());
app.listen(3000, "0.0.0.0");
console.log(`\nServer: http://${ip.address()}:3000`)
