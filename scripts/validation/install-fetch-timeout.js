'use strict';

const originalFetch = globalThis.fetch;

if (typeof originalFetch !== 'function') {
  throw new Error('Global fetch is unavailable; Node.js 18 or later is required.');
}

const timeoutMs = Number.parseInt(process.env.RESPONSIVE_FETCH_TIMEOUT_MS || '10000', 10);

function combineSignals(existingSignal, timeoutSignal) {
  if (!existingSignal) return timeoutSignal;
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([existingSignal, timeoutSignal]);
  if (existingSignal.aborted) return existingSignal;

  const controller = new AbortController();
  const abort = (signal) => controller.abort(signal.reason);
  existingSignal.addEventListener('abort', () => abort(existingSignal), {once: true});
  timeoutSignal.addEventListener('abort', () => abort(timeoutSignal), {once: true});
  return controller.signal;
}

globalThis.fetch = function fetchWithTimeout(input, init = {}) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return originalFetch(input, {
    ...init,
    signal: combineSignals(init.signal, timeoutSignal)
  });
};

console.log(`Installed ${timeoutMs}ms timeout for responsive-review fetch requests.`);
