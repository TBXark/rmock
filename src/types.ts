import type Router from '@koa/router';
import type {RequestInit, Response} from 'undici';

export type CaptureMode = 'all' | 'none';

export interface RuntimeConfig {
  port: number;
  captureAll: boolean;
  routerPath?: string;
  showRequestHeader: boolean;
  showRequestBody: boolean;
  showResponseBody: boolean;
  prettyJson: boolean;
  watchRouter: boolean;
  targetHost: string;
  targetPort: number;
  targetProtocol: 'http:' | 'https:';
  targetUrl: URL;
}

export interface MapResponseConfig {
  canLog?: boolean;
  showRequestHeader?: boolean;
  showRequestBody?: boolean;
  showResponseBody?: boolean;
}

export interface RedirectConfig {
  host?: string;
  protocol?: 'http' | 'https';
  port?: number;
}

export type ResponseMapper = (body: unknown, ctx: Router.RouterContext) => unknown | Promise<unknown>;

export interface MapperUtils {
  mapJSON: (mapper?: ResponseMapper | null, config?: MapResponseConfig) => Router.Middleware;
  customMapper: (
    requestBuilder?: RequestBuilder,
    responseBodyGetter?: ResponseBodyGetter,
    responseStringify?: (body: unknown) => string,
    config?: MapResponseConfig,
    map?: ResponseMapper | null,
  ) => Router.Middleware;
  redirect: (config?: RedirectConfig) => Router.Middleware;
}

export type RequestBuilder = (ctx: Router.RouterContext) => {
  url: URL;
  init: RequestInit;
  headers: Record<string, string | string[] | undefined>;
  body?: string | null;
};
export type ResponseBodyGetter = (response: Response) => Promise<unknown>;

export type ImportModule = <T = unknown>(specifier: string) => Promise<T>;
export type RegisterExternalRouter = (router: Router, utils: MapperUtils, importModule: ImportModule) => Promise<void> | void;

export interface CliFlags {
  port: number;
  target: string;
  targetPort?: number;
  capture: CaptureMode;
  router?: string | null;
  requestHeader: boolean;
  requestBody: boolean;
  responseBody: boolean;
  prettyJson: boolean;
  routerWatch: boolean;
}
