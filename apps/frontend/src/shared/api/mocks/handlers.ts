import { http, HttpResponse } from 'msw';

import { getDefaultMock } from '../index';
import { todoFactory } from '../../testing/factories';

/**
 * MSW request handlers — V3 hybrid strategy.
 *
 * Orval generates a full set of MSW handlers via `getDefaultMock()` using faker,
 * which gives complete coverage but unpredictable data. For the endpoints we
 * actually assert against in tests we place deterministic Fishery-backed
 * overrides FIRST.
 *
 * IMPORTANT (MSW v2 resolution order): the FIRST matching handler wins, so the
 * custom overrides MUST come before `...getDefaultMock()`. The spread acts as a
 * fallback for every endpoint we did not explicitly override.
 */
export const handlers = [
  // --- Deterministic Fishery overrides (must be FIRST so they win) ---
  http.get('*/todos', () => HttpResponse.json(todoFactory.buildList(3))),
  http.get('*/todos/:id', ({ params }) =>
    HttpResponse.json(todoFactory.build({ id: Number(params['id']) })),
  ),

  // --- Orval/faker fallback for everything else (must be LAST) ---
  ...getDefaultMock(),
];
