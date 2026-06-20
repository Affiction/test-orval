import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * MSW server for Node-based environments (Vitest / jsdom).
 * Wired into `src/test-setup.ts`.
 */
export const server = setupServer(...handlers);
