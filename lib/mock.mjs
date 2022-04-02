import fetch from 'node-fetch';
import {
  PRINT_RESPONSE_JSON_PRETTY,
  SHOW_REQUEST_BODY,
  SHOW_REQUEST_HEADER,
  SHOW_RESPONSE_BODY,
  TARGET_HOST,
  TARGET_IS_HTTPS,
  TARGET_PORT,
} from './config.mjs';
import log from './log.mjs';
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({keepAlive: true});
const httpsAgent = new https.Agent({keepAlive: true});

const defaultMapResponseConfig = {
  canLog: true,
  showRequestHeader: SHOW_REQUEST_HEADER,
  showRequestBody: SHOW_REQUEST_BODY,
  showResponseBody: SHOW_RESPONSE_BODY,
};

// / JSON Mapper
function jsonRequestBuilder(ctx) {
  const url = ctx.request.URL;
  url.host = TARGET_HOST;
  url.protocol = TARGET_IS_HTTPS ? 'https' : 'http';
  url.port = TARGET_PORT;

  const body =
        ctx.request.method === 'GET' ? null : JSON.stringify(ctx.request.body);
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

function jsonResponseStringify(pretty) {
  return (obj) => {
    if (pretty) {
      return JSON.stringify(obj, null, 2);
    } else {
      return JSON.stringify(obj);
    }
  };
}

async function jsonResponseBodyGetter(res) {
  return await res.json();
}

export function mapJSON(map, config) {
  return async (ctx) => {
    const {
      requestBuilder,
      responseStringify,
      responseBodyGetter,
      printResponseJsonPretty,
    } = {
      printResponseJsonPretty: PRINT_RESPONSE_JSON_PRETTY,
      responseBodyGetter: jsonResponseBodyGetter,
      requestBuilder: jsonRequestBuilder,
      ...config,
    };
    const mapper = customMapper(
        requestBuilder,
        responseBodyGetter,
        responseStringify || jsonResponseStringify(printResponseJsonPretty),
        config,
        map,
    );
    await mapper(ctx);
  };
}

// / Custom Mapper
export function customMapper(
    requestBuilder,
    responseBodyGetter,
    responseStringify,
    config,
    map,
) {
  return async (ctx) => {
    const {canLog, showRequestHeader, showRequestBody, showResponseBody} = {
      ...config,
      ...defaultMapResponseConfig,
    };
    const req = requestBuilder(ctx);
    const res = await fetch(req.url, req.config);
    let resBody = await responseBodyGetter(res);
    ctx.status = res.status;
    ctx.statusText = res.statusText;

    const logText = canLog ?
            {
              status: res.status,
              statusText: res.statusText,
              method: req.config.method,
              url: req.url.href,
              header: showRequestHeader ? req.headers : null,
              body: showRequestBody ? req.body : null,
              response: showResponseBody ? responseStringify(resBody) : null,
            } :
            {};

    if (map) {
      if (map.constructor.name === 'AsyncFunction') {
        resBody = await map(resBody, ctx);
      } else {
        resBody = map(resBody, ctx);
      }
      if (canLog) {
        logText.map = responseStringify(resBody);
      }
    }
    if (canLog) {
      log.request(logText);
    } else {
      console.log(
          log.summary(
              res.status,
              req.config.method,
              res.statusText,
              req.url.href,
          ),
      );
    }
    ctx.body = resBody;
  };
}

// / Redirect
export function redirect(config) {
  const {host, protocol, port} = config || {};
  return (ctx) => {
    const url = ctx.request.URL;
    url.host = host || TARGET_HOST;
    url.protocol = protocol || (TARGET_IS_HTTPS ? 'https' : 'http');
    url.port = port || (url.protocol.startsWith('https') ? 443 : 80);
    console.log(log.summary(302, ctx.request.method, 'Redirect', url.href));
    ctx.redirect(url);
  };
}
