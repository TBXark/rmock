import process from 'node:process';
import {resolveConfig} from './config.js';
import {ServerController} from './server.js';
import type {CliFlags} from './types.js';

export async function main(flags: CliFlags) {
  const config = resolveConfig(flags);
  const server = new ServerController(config);
  await server.start();
  const shutdown = async () => {
    await server.stop();
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}
