import fetch from "node-fetch";
import {
  SHOW_HEADER,
  SHOW_BODY,
  SHOW_RESPONSE,
  TARGET_HOST,
} from "./config.js";

export function mapBody(map) {
  return async (ctx) => {
    const url = ctx.request.URL;
    url.host = TARGET_HOST;
    url.protocol = "https";
    url.port = 443;
    const body =
      ctx.request.method === "POST" ? JSON.stringify(ctx.request.body) : null;
    let res = await fetch(url, {
      method: ctx.request.method,
      headers: {
        ...ctx.request.headers,
        host: url.host,
      },
      body,
    });
    let resBody = await res.json();
    let log = `
--Request-------------------------------------------------------
${ctx.request.method} : ${url.toString()}${
      SHOW_HEADER ? "\n" + JSON.stringify(ctx.request.headers, null, 2) : ""
    }${SHOW_BODY ? "\n" + body : ""}
--Response------------------------------------------------------
${
  SHOW_RESPONSE
    ? JSON.stringify(res, null, 2)
    : `${res.status}: ${res.statusText}`
}`;
    if (map) {
      resBody = map(resBody, ctx);
      log += `
--Map-----------------------------------------------------------      
${JSON.stringify(resBody, null, 2)}
--End-----------------------------------------------------------   

    `;
    } else {
      log +=
        "\n--End-----------------------------------------------------------\n";
    }
    console.log(log);
    ctx.status = res.status;
    ctx.statusText = res.statusText;
    ctx.body = resBody;
  };
}
