import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** MSW worker for browser-based development mocking. */
export const worker = setupWorker(...handlers);
