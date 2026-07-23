'use strict';

const path = require('node:path');
const {spawn, spawnSync} = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const preload = path.join(__dirname, 'install-fetch-timeout.js');
const target = path.join(__dirname, 'capture-redesign-review.js');
const hardTimeoutMinutes = Number.parseInt(process.env.RESPONSIVE_REVIEW_TIMEOUT_MINUTES || '30', 10);
const hardTimeoutMs = hardTimeoutMinutes * 60 * 1000;
const startedAt = Date.now();
let timedOut = false;
let settled = false;

function elapsed() {
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
}

function terminateProcessTree(child) {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true
    });
    return;
  }
  child.kill('SIGKILL');
}

console.log(`Starting bounded responsive review with a ${hardTimeoutMinutes}-minute hard limit.`);
const child = spawn(process.execPath, ['--require', preload, target], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true
});

const heartbeat = setInterval(() => {
  console.log(`Responsive review heartbeat: elapsed ${elapsed()}, child PID ${child.pid || 'unknown'}.`);
}, 60 * 1000);

const timeout = setTimeout(() => {
  timedOut = true;
  console.error(`Responsive review exceeded ${hardTimeoutMinutes} minutes; terminating the browser process tree.`);
  terminateProcessTree(child);
}, hardTimeoutMs);

function finish(code) {
  if (settled) return;
  settled = true;
  clearInterval(heartbeat);
  clearTimeout(timeout);
  process.exitCode = code;
}

child.on('error', (error) => {
  console.error(`Unable to start responsive review: ${error.stack || error.message}`);
  finish(1);
});

child.on('exit', (code, signal) => {
  if (timedOut) {
    console.error(`Responsive review terminated after ${elapsed()}.`);
    finish(124);
    return;
  }
  if (signal) {
    console.error(`Responsive review ended from signal ${signal} after ${elapsed()}.`);
    finish(1);
    return;
  }
  console.log(`Responsive review completed with exit code ${code ?? 1} after ${elapsed()}.`);
  finish(code ?? 1);
});
