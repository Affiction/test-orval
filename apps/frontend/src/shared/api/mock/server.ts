import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * MSW server for Node-based environments (Vitest / jsdom integration tests).
 */
export const server = setupServer(...handlers);
