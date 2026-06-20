import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/**
 * MSW worker for the browser. Requires the generated service worker script
 * (`public/mockServiceWorker.js`, created via `npx msw init`).
 *
 * Start it during app bootstrap (development only), e.g.:
 *
 *   import { worker } from './shared/api/mocks/browser';
 *   if (import.meta.env.DEV) {
 *     await worker.start();
 *   }
 */
export const worker = setupWorker(...handlers);
