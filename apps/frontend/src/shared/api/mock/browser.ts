import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/**
 * MSW worker for the browser. Start it during app bootstrap (development only):
 *
 *   import { worker } from 'shared/api/mock/browser';
 *   await worker.start();
 *
 * Requires `public/mockServiceWorker.js` (generated via `msw init`).
 */
export const worker = setupWorker(...handlers);
