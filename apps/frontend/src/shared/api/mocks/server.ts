import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** MSW server for Node-based (Vitest) test runs. */
export const server = setupServer(...handlers);
