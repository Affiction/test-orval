import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/**
 * MSW Service Worker for the browser (dev/Storybook). Start it with
 * `await worker.start()`; requires `public/mockServiceWorker.js`
 * (generated via `npx msw init apps/frontend/public --save`).
 */
export const worker = setupWorker(...handlers);
