import fetch from "node-fetch";
import {
  SHOW_REQUEST_HEADER,
  SHOW_REQUEST_BODY,
  SHOW_RESPONSE_BODY,
  TARGET_HOST,
  PRINT_RESPONSE_JSON_PRETTY,
} from "./config.js";

function responseStringify(obj) {
  if (PRINT_RESPONSE_JSON_PRETTY) {
    return JSON.stringify(obj, null, 2);
  } else {
    return JSON.stringify(obj)
  }
}

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
      SHOW_REQUEST_HEADER ? "\n" + JSON.stringify(ctx.request.headers, null, 2) : ""
    }${SHOW_REQUEST_BODY ? "\n" + body : ""}
--Response------------------------------------------------------
${
  SHOW_RESPONSE_BODY
    ? responseStringify(resBody)
    : `${res.status}: ${res.statusText}`
}`;
    if (map) {
      resBody = map(resBody, ctx);
      log += `
--Map-----------------------------------------------------------      
${responseStringify(resBody)}
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
