import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * MSW request-interception server for Node-based tests (Vitest).
 * Wired into `src/test-setup.ts` with `onUnhandledRequest: 'error'`.
 */
export const server = setupServer(...handlers);
