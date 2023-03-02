import {DYNAMIC_ROUTER_PATH, SHOW_VERSION} from './config.mjs';
import {Server} from './server.mjs';
import fs from 'fs';

export async function main() {
  if (SHOW_VERSION) {
    console.log('v1.0.1');
    return;
  }
  const server = new Server();
  await server.start();
  if (DYNAMIC_ROUTER_PATH) {
    fs.watchFile(DYNAMIC_ROUTER_PATH, () => {
      console.log(`File ${DYNAMIC_ROUTER_PATH} changed, reloading...`);
      server.restart().then(() => {
        console.log(`Reloaded at ${new Date()}\n`);
      });
    });
  }
}
