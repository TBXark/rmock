#!/usr/bin/env node
import process from 'node:process';
import {Command, Option, InvalidArgumentError} from 'commander';
import pkg from '../../package.json' with {type: 'json'};
import {main} from '../main.js';
import type {CliFlags} from '../types.js';

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError('Expected a number.');
  }
  return parsed;
}

async function run() {
  const program = new Command();
  program
      .name('rmock')
      .description('Modern JSON mock proxy for HTTP APIs.')
      .version(pkg.version as string, '-v, --version', 'Output version number');

  program
      .addOption(new Option('-p, --port <port>', 'Port to expose the mock server').argParser(parseInteger).default(3000))
      .option('-t, --target <url>', 'Target URL to proxy', 'https://api.github.com')
      .addOption(new Option('-P, --target-port <port>', 'Target port override').argParser(parseInteger))
      .addOption(new Option('-c, --capture <all|none>', 'Capture all requests or only matched routes').choices(['all', 'none']).default('all'))
      .option('-r, --router <path>', 'External router file (CJS or ESM)')
      .option('-H, --request-header', 'Log request headers', false)
      .option('-B, --request-body', 'Log request body', true)
      .option('-R, --response-body', 'Log response body', true)
      .option('-J, --pretty-json', 'Pretty print JSON logs', false)
      .option('--no-router-watch', 'Disable router file watcher when using -r/--router');

  const options = await program.parseAsync(process.argv);
  const flags = options.opts<CliFlags>();

  await main({
    ...flags,
    routerWatch: flags.routerWatch ?? true,
  });
}

run().catch((error) => {
  console.error('[rmock] Unexpected error:', error);
  process.exitCode = 1;
});
