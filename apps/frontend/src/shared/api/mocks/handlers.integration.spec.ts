import { provideHttpClient, withFetch } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { DefaultService } from '../index';
import type { Todo } from '../index';
import { todoFactory } from '../../testing/factories';

/**
 * V3 hybrid integration test.
 *
 * Drives the real generated `DefaultService` (Angular HttpClient with the fetch
 * backend) through MSW. The overridden endpoints must return EXACT deterministic
 * Fishery values; the non-overridden endpoints must fall through to the orval
 * `getDefaultMock()` faker handlers, where we only assert the response shape.
 */
describe('MSW hybrid handlers (Orval scaffold + Fishery override)', () => {
  let service: DefaultService;

  beforeEach(() => {
    // Reset Fishery's sequence so the n-th built Todo is reproducible across the
    // handler invocation and our expected reference data.
    todoFactory.rewindSequence();

    TestBed.configureTestingModule({
      // CRITICAL: tests must use the fetch backend so MSW intercepts requests.
      providers: [provideHttpClient(withFetch())],
    });
    service = TestBed.inject(DefaultService);
  });

  describe('Fishery-overridden endpoints (exact values)', () => {
    it('GET /todos returns the exact deterministic Fishery list of 3', async () => {
      const result = await firstValueFrom(service.getTodos());

      // The handler built buildList(3) from sequence 1. Re-build the same
      // reference after rewinding; values depend only on the sequence index.
      todoFactory.rewindSequence();
      const expected = todoFactory.buildList(3);

      expect(result).toEqual(expected);
      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id)).toEqual([1, 2, 3]);
    });

    it('GET /todos/:id returns a Fishery todo with the requested id', async () => {
      const result = await firstValueFrom(service.getTodosId('42'));

      // The handler builds todoFactory.build({ id: Number(params.id) }).
      todoFactory.rewindSequence();
      const expected = todoFactory.build({ id: 42 });

      expect(result).toEqual(expected);
      expect(result.id).toBe(42);
      expect(typeof result.title).toBe('string');
    });
  });

  describe('Fallback endpoints (orval getDefaultMock, shape only)', () => {
    it('POST /todos falls through to the faker mock (shape check)', async () => {
      const result = await firstValueFrom(service.postTodos({ title: 'new' }));

      expectTodoShape(result);
    });

    it('PATCH /todos/:id falls through to the faker mock (shape check)', async () => {
      const result = await firstValueFrom(service.patchTodosId('7', { done: true }));

      expectTodoShape(result);
    });

    it('DELETE /todos/:id falls through to the faker mock (204, no body)', async () => {
      const result = await firstValueFrom(
        service.deleteTodosId('7', { observe: 'response' }),
      );

      expect(result.status).toBe(204);
    });
  });
});

function expectTodoShape(value: Todo): void {
  expect(value).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      title: expect.any(String),
      done: expect.any(Boolean),
    }),
  );
}
