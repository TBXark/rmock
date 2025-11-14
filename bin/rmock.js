#!/usr/bin/env node
import('../dist/bin/rmock.js').catch((error) => {
  console.error('[rmock] Failed to start CLI:', error);
  process.exit(1);
});
