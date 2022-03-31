import fetch from "node-fetch";
import {
  SHOW_REQUEST_HEADER,
  SHOW_REQUEST_BODY,
  SHOW_RESPONSE_BODY,
  TARGET_HOST,
  PRINT_RESPONSE_JSON_PRETTY,
} from "./config.js";

import https from "https";

const httpsAgent = new https.Agent({
  keepAlive: true
});


const defaultMapBodyConfig = {
  canLog: true,
  showRequestHeader: SHOW_REQUEST_HEADER,
  showRequestBody: SHOW_REQUEST_BODY,
  showResponseBody: SHOW_RESPONSE_BODY,
  printResponseJsonPretty: PRINT_RESPONSE_JSON_PRETTY,
}

export function disableLog() {
  return mapBody(null, { canLog: false });
}

export function mapBody(map, config) {
  return async (ctx) => {
    const {
      canLog,
      showRequestHeader,
      showRequestBody,
      showResponseBody,
      printResponseJsonPretty,
    } = {
      ...defaultMapBodyConfig,
      ...config,
    };
    const responseStringify = (obj) => {
      if (printResponseJsonPretty) {
        return JSON.stringify(obj, null, 2);
      } else {
        return JSON.stringify(obj);
      }
    }
    
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
      agent: httpsAgent,
    });
    let resBody = await res.json();
    let log = `
--Request-------------------------------------------------------
${ctx.request.method} : ${url.toString()}${
      showRequestHeader
        ? "\n" + JSON.stringify(ctx.request.headers, null, 2)
        : ""
    }${showRequestBody ? "\n" + body : ""}
--Response------------------------------------------------------
${
  showResponseBody
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
    if (canLog) {
      console.log(log);
    }
    ctx.status = res.status;
    ctx.statusText = res.statusText;
    ctx.body = resBody;
  };
}
