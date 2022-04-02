import fetch from "node-fetch";
import {
  SHOW_REQUEST_HEADER,
  SHOW_REQUEST_BODY,
  SHOW_RESPONSE_BODY,
  TARGET_HOST,
  TARGET_IS_HTTPS,
  TARGET_PORT,
  PRINT_RESPONSE_JSON_PRETTY,
} from "./config.mjs";

import http from "http";
import https from "https";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const defaultMapBodyConfig = {
  canLog: true,
  showRequestHeader: SHOW_REQUEST_HEADER,
  showRequestBody: SHOW_REQUEST_BODY,
  showResponseBody: SHOW_RESPONSE_BODY,
  printResponseJsonPretty: PRINT_RESPONSE_JSON_PRETTY,
  requestBuilder: defaultRequestBuilder,
};

export function defaultRequestBuilder(ctx) {
  const url = ctx.request.URL;
  url.host = TARGET_HOST;
  url.protocol = TARGET_IS_HTTPS ? "https" : "http";
  url.port = TARGET_PORT;

  const body =
    ctx.request.method === "GET" ? null : JSON.stringify(ctx.request.body);
  const headers = {
    ...ctx.request.headers,
    host: TARGET_HOST,
  };

  return {
    url,
    config: {
      method: ctx.request.method,
      headers,
      body,
      agent: TARGET_IS_HTTPS ? httpsAgent : httpAgent,
    },
  };
}

export function customRequestBuilder(mapRequest) {
  return (ctx) => {
    return mapRequest(defaultMapBodyConfig(ctx));
  };
}

export function disableLog() {
  return mapResponse(null, { canLog: false });
}

export function redirect(config) {
  const { host, protocol, port } = config || {};
  return (ctx) => {
    const url = ctx.request.URL;
    url.host = host || TARGET_HOST;
    url.protocol = protocol || (TARGET_IS_HTTPS ? "https" : "http");
    url.port = port || (url.protocol.startsWith("https") ? 443 : 80);
    console.log(requestSummary(302, ctx.request.method, "Redirect", url.href));
    ctx.redirect(url);
  };
}

export function mapResponse(map, config) {
  return async (ctx) => {
    const {
      canLog,
      showRequestHeader,
      showRequestBody,
      showResponseBody,
      printResponseJsonPretty,
      requestBuilder,
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

    const req = requestBuilder(ctx);
    const res = await fetch(req.url, req.config);
    let resBody = await res.json();

    const log = canLog
      ? {
          status: res.status,
          statusText: res.statusText,
          method: req.config.method,
          url: req.url.href,
          header: showRequestHeader ? req.headers : null,
          body: showRequestBody ? req.body : null,
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
    } else {
      console.log(
        requestSummary(
          res.status,
          req.config.method,
          res.statusText,
          req.url.href
        )
      );
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

function requestSummary(status, method, statusText, url) {
  return `\x1B[${statusToColor(status)}m${method} [${status} ${statusText}]\x1B[0m : \x1B[1m${url}\x1B[0m\n`;
}

function logRequest(log) {
  console.group(
    requestSummary(log.status, log.method, log.statusText, log.url)
  );
  if (log.header) {
    console.log("\n--Request Header---------------------------\n");
    console.log(JSON.stringify(log.header, null, 2));
  }
  if (log.body) {
    console.log("\n--Request Body-----------------------------\n");
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
