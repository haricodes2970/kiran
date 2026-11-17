#!/usr/bin/env node
/**
 * Shell-safe development & production launcher for @kirans/api.
 *
 * Why this exists:
 * `@nestjs/cli`'s `StartAction.spawnChildProcess` (`@nestjs/cli/actions/start.action.js:93`)
 * resolves `tsconfig.outDir` to an absolute path, only quotes paths containing spaces
 * (`outputFilePath.indexOf(' ') >= 0`), and invokes `child_process.spawn(..., { shell: true })`.
 * When the workspace directory name contains an apostrophe (e.g. `Kiran'sInfoTech`), `/bin/sh -c`
 * fails immediately with:
 *   `/bin/sh: -c: line 1: unexpected EOF while looking for matching '''`
 *
 * This launcher uses `spawn(..., { shell: false })` with argument arrays so no shell
 * interpolation ever occurs.
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const apiRoot = path.resolve(__dirname, '..');
const tscBin = path.resolve(apiRoot, '../../node_modules/typescript/bin/tsc');
const entryFile = path.resolve(apiRoot, 'dist/src/main.js');

const isWatch = process.argv.includes('--watch');

function buildOnce() {
  const res = spawnSync(
    process.execPath,
    [tscBin, '-p', path.join(apiRoot, 'tsconfig.build.json')],
    {
      cwd: apiRoot,
      stdio: 'inherit',
      shell: false,
    },
  );
  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}

buildOnce();

if (!fs.existsSync(entryFile)) {
  console.error(`Compiled entry file not found at: ${entryFile}`);
  process.exit(1);
}

const nodeArgs = ['--enable-source-maps'];
if (isWatch) {
  nodeArgs.push('--watch-path', path.join(apiRoot, 'src'));
}
nodeArgs.push(entryFile);

const child = spawn(process.execPath, nodeArgs, {
  cwd: apiRoot,
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
