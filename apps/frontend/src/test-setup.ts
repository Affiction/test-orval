import { getTestBed, ɵgetCleanupHook as getCleanupHook } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { server } from './shared/api/mocks/server';

beforeEach(getCleanupHook(false));
afterEach(getCleanupHook(true));

// --- MSW lifecycle ---
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TESTBED_SETUP = Symbol.for('@angular/cli/testbed-setup');

if (!(globalThis as Record<symbol, unknown>)[TESTBED_SETUP]) {
  (globalThis as Record<symbol, unknown>)[TESTBED_SETUP] = true;

  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  });
}
