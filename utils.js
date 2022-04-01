import fetch from "node-fetch";
import {
  SHOW_REQUEST_HEADER,
  SHOW_REQUEST_BODY,
  SHOW_RESPONSE_BODY,
  TARGET_HOST,
  TARGET_IS_HTTPS,
  TARGET_PORT,
  PRINT_RESPONSE_JSON_PRETTY,
} from "./config.js";

import http from "http";
import https from "https";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true});

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
    url.protocol = TARGET_IS_HTTPS ? "https" : "http";
    url.port = TARGET_PORT;

    const body = ctx.request.method === "GET" ? null : JSON.stringify(ctx.request.body);
    const headers = {
      ...ctx.request.headers,
      host: TARGET_HOST,
    }

    let res = await fetch(url, {
      method: ctx.request.method,
      headers,
      body,
      agent: TARGET_IS_HTTPS ? httpsAgent : httpAgent,
    });
    let resBody = await res.json();

    let log = canLog
      ? {
          status:  res.status,
          statusText: res.statusText,
          method: ctx.request.method,
          url: url.href,
          header: showRequestHeader ? headers : null,
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
    console.log(JSON.stringify(log.header, null, 2));
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

