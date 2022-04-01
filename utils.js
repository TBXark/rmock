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
  keepAlive: true,
});

const defaultMapBodyConfig = {
  canLog: true,
  showRequestHeader: SHOW_REQUEST_HEADER,
  showRequestBody: SHOW_REQUEST_BODY,
  showResponseBody: SHOW_RESPONSE_BODY,
  printResponseJsonPretty: PRINT_RESPONSE_JSON_PRETTY,
};

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
    };

    const url = ctx.request.URL;
    url.host = TARGET_HOST;
    url.protocol = "https";
    url.port = 443;

    const body =
      ctx.request.method === "POST" && ctx.request.body
        ? JSON.stringify(ctx.request.body)
        : null;

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

    let log = canLog
      ? {
          status:  res.status,
          statusText: res.statusText,
          method: ctx.request.method,
          url: url.href,
          header: showRequestHeader
            ? JSON.stringify(ctx.request.headers, null, 2)
            : null,
          body: showRequestBody ? body : null,
          response: showResponseBody ? responseStringify(resBody) : null,
        }
      : {};
    if (map) {
      resBody = map(resBody, ctx);
      if (canLog) {
        log.map = responseStringify(resBody);
      }
    }
    if (canLog) {
      logRequest(log);
    }
    ctx.status = res.status;
    ctx.statusText = res.statusText;
    ctx.body = resBody;
  };
}

function statusToColor(status) {
  if (status >= 200 && status < 300) {
    return 32;
  } else if (status >= 300 && status < 400) {
    return 33;
  } else if (status >= 400 && status < 500) {
    return 36;
  } else {
    return 31;
  }
}

function logRequest(log) {
  console.group(`\x1B[${statusToColor(log.status)}m${log.method} [${log.status} ${log.statusText}]\x1B[0m : \x1B[1m${log.url}\x1B[0m`);
  if (log.header) {
    console.log("\n--Request Header--------------------------\n");
    console.log(log.header);
  }
  if (log.body) {
    console.log("\n--Request Body----------------------------\n");
    console.log(log.body);
  }
  if (log.response) {
    console.log("\n--Response Body----------------------------\n");
    console.log(log.response);
  }
  if (log.map) {
    console.log("\n--Map Response Body------------------------\n");
    console.log(log.map);
  }
  console.log("\n--End--------------------------------------\n\n");
  console.groupEnd();
}

