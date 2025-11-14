import type Router from '@koa/router';
import {fetch} from 'undici';
import type {Response} from 'undici';
import log from './log.js';
import type {RequestLog} from './log.js';
import type {
  MapResponseConfig,
  MapperUtils,
  RedirectConfig,
  RequestBuilder,
  ResponseBodyGetter,
  ResponseMapper,
  RuntimeConfig,
} from './types.js';

export function createMapperUtils(config: RuntimeConfig): MapperUtils {
  const jsonBuilder = createJsonRequestBuilder(config);
  const stringifyJson = createJsonStringifier(config.prettyJson);
  const defaultLoggingConfig: Required<MapResponseConfig> = {
    canLog: true,
    showRequestHeader: config.showRequestHeader,
    showRequestBody: config.showRequestBody,
    showResponseBody: config.showResponseBody,
  };

  const customMapper = (
      requestBuilder: RequestBuilder = jsonBuilder,
      responseBodyGetter: ResponseBodyGetter = jsonResponseBodyGetter,
      responseStringify: (body: unknown) => string = stringifyJson,
      mapConfig?: MapResponseConfig,
      mapper?: ResponseMapper | null,
  ): Router.Middleware => {
    return async (ctx) => {
      const logSettings = {...defaultLoggingConfig, ...mapConfig};
      const request = requestBuilder(ctx);
      const normalizedHeaders = normalizeHeaders(request.headers);
      const response = await fetch(request.url, {
        ...request.init,
        body: request.body ?? undefined,
        headers: normalizedHeaders,
      });
      let responseBody = await responseBodyGetter(response);
      ctx.status = response.status;
      ctx.message = response.statusText;

      const logEntry: (RequestLog & {map?: string}) | null = logSettings.canLog ? {
        status: response.status,
        statusText: response.statusText,
        method: request.init.method ?? ctx.method,
        url: request.url.href,
        header: logSettings.showRequestHeader ? request.headers : undefined,
        body: logSettings.showRequestBody ? request.body : undefined,
        response: logSettings.showResponseBody ? responseStringify(responseBody) : undefined,
      } : null;

      if (mapper) {
        responseBody = await mapper(responseBody, ctx);
        if (logEntry) {
          logEntry.map = responseStringify(responseBody);
        }
      }

      if (logEntry) {
        log.request(logEntry);
      } else {
        console.log(
            log.summary(
                response.status,
                request.init.method ?? ctx.method,
                response.statusText,
                request.url.href,
            ),
        );
      }

      ctx.body = responseBody;
    };
  };

  const mapJSON = (mapper?: ResponseMapper | null, mapConfig?: MapResponseConfig): Router.Middleware => {
    return customMapper(jsonBuilder, jsonResponseBodyGetter, stringifyJson, mapConfig, mapper ?? undefined);
  };

  const redirectFactory = (override?: RedirectConfig): Router.Middleware => {
    return (ctx) => {
      const url = new URL(ctx.URL.href);
      const protocol = (override?.protocol ?? (config.targetProtocol === 'https:' ? 'https' : 'http'));
      url.protocol = `${protocol}:`;
      url.host = override?.host ?? config.targetHost;
      const port = override?.port ?? config.targetPort;
      url.port = String(port);
      console.log(log.summary(302, ctx.method, 'Redirect', url.href));
      ctx.redirect(url.href);
    };
  };

  return {
    mapJSON,
    customMapper,
    redirect: redirectFactory,
  };
}

function createJsonRequestBuilder(config: RuntimeConfig): RequestBuilder {
  return (ctx) => {
    const url = new URL(ctx.URL.href);
    url.protocol = config.targetProtocol;
    url.hostname = config.targetHost;
    url.port = String(config.targetPort);
    const isBodyLessMethod = ctx.method === 'GET' || ctx.method === 'HEAD';
    const body = isBodyLessMethod ? null : JSON.stringify(ctx.request.body ?? {});
    const headers: Record<string, string | string[] | undefined> = {
      ...ctx.request.headers,
      host: config.targetHost,
    };
    delete headers['content-length'];
    return {
      url,
      init: {
        method: ctx.method,
      },
      headers,
      body,
    };
  };
}

function createJsonStringifier(pretty: boolean) {
  return (body: unknown) => {
    return JSON.stringify(body, null, pretty ? 2 : undefined);
  };
}

async function jsonResponseBodyGetter(response: Response) {
  return response.headers.get('content-type')?.includes('application/json') ?
      await response.json() :
      await response.text();
}

function normalizeHeaders(headers: Record<string, string | string[] | undefined>) {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value.join(', ');
    }
  }
  return normalized;
}
