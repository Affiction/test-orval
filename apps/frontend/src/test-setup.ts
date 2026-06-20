import { getTestBed, ɵgetCleanupHook as getCleanupHook } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach } from 'vitest';

// MSW + @mswjs/data stateful database lifecycle (beforeAll/afterEach/afterAll).
import './test-setup-msw';

beforeEach(getCleanupHook(false));
afterEach(getCleanupHook(true));

const TESTBED_SETUP = Symbol.for('@angular/cli/testbed-setup');

if (!(globalThis as Record<symbol, unknown>)[TESTBED_SETUP]) {
  (globalThis as Record<symbol, unknown>)[TESTBED_SETUP] = true;

  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  });
}
