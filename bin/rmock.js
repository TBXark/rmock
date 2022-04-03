#!/usr/bin/env node
(async () => {
  const {main} = await import('../lib/main.mjs');
  await main();
})();
