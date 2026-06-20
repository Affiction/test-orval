import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './shared/api/mocks/server';
import { resetDb } from './shared/api/mocks/db';
import { seedDb } from './shared/testing/factories/todo.factory';

/**
 * MSW + @mswjs/data stateful database lifecycle.
 *
 * Kept in its own setup module (no Angular TestBed init) so it can be shared by
 * both test runners:
 *   - the standalone `vitest.config.ts` (imported from `test-setup.ts`), and
 *   - the Angular `@angular/build:unit-test` builder (referenced via the
 *     `setupFiles` option in `angular.json`).
 */

// Start the MSW server once. `onUnhandledRequest: 'error'` surfaces any request
// that is not mocked so tests fail loudly instead of silently hitting the
// network.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  seedDb();
});

// After every test: reset per-test handler overrides, wipe the database and the
// auto-increment id counter, then reseed deterministically. Keeps each test
// isolated while still exercising the stateful db within a single test.
afterEach(() => {
  server.resetHandlers();
  resetDb();
  seedDb();
});

afterAll(() => {
  server.close();
});
