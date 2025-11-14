import path from 'node:path';
import process from 'node:process';
import type {CliFlags, RuntimeConfig} from './types.js';

export function resolveConfig(flags: CliFlags): RuntimeConfig {
  const targetUrl = new URL(flags.target);
  const targetProtocol = targetUrl.protocol === 'https:' ? 'https:' : 'http:';
  const targetPort = flags.targetPort ?? (targetProtocol === 'https:' ? 443 : 80);
  const routerPath = flags.router ? path.resolve(process.cwd(), flags.router) : undefined;

  return {
    port: flags.port,
    captureAll: flags.capture === 'all',
    routerPath,
    showRequestHeader: flags.requestHeader,
    showRequestBody: flags.requestBody,
    showResponseBody: flags.responseBody,
    prettyJson: flags.prettyJson,
    watchRouter: flags.routerWatch,
    targetHost: targetUrl.hostname,
    targetPort,
    targetProtocol,
    targetUrl
  };
}

export function summarizeConfig(config: RuntimeConfig) {
  return {
    port: config.port,
    captureAll: config.captureAll,
    routerPath: config.routerPath ?? null,
    watchRouter: config.watchRouter,
    prettyJson: config.prettyJson,
    showRequestHeader: config.showRequestHeader,
    showRequestBody: config.showRequestBody,
    showResponseBody: config.showResponseBody,
    target: `${config.targetProtocol}//${config.targetHost}:${config.targetPort}`
  };
}
