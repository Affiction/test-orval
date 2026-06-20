import { provideHttpClient, withFetch } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { DefaultService } from '@shared/api';
import type { Todo } from '@shared/api';

/**
 * V2 — Orval MSW mocks driven by OpenAPI spec `example` values (deterministic).
 *
 * The MSW server is started in `src/test-setup.ts`. Requests issued through the
 * generated `DefaultService` are intercepted by the orval-generated handlers,
 * which return the exact `example` values from the spec.
 *
 * IMPORTANT: tests must use `provideHttpClient(withFetch())` so Angular's
 * HttpClient goes through fetch, which MSW can intercept.
 */
describe('orval msw mocks (spec examples)', () => {
  let service: DefaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withFetch())],
    });
    service = TestBed.inject(DefaultService);
  });

  it('GET /todos returns the spec example Todo', async () => {
    const todos = await firstValueFrom(service.getTodos());

    expect(todos).toEqual<Todo[]>([{ id: 1, title: 'Learn orval', done: false }]);
  });

  it('GET /todos/:id returns the spec example Todo', async () => {
    const todo = await firstValueFrom(service.getTodosId('1'));

    expect(todo).toEqual<Todo>({ id: 1, title: 'Learn orval', done: false });
  });

  it('POST /todos returns the spec example Todo', async () => {
    const created = await firstValueFrom(service.postTodos({ title: 'New todo' }));

    expect(created).toEqual<Todo>({ id: 1, title: 'Learn orval', done: false });
  });

  it('PATCH /todos/:id returns the spec example Todo', async () => {
    const updated = await firstValueFrom(service.patchTodosId('1', { done: true }));

    expect(updated).toEqual<Todo>({ id: 1, title: 'Learn orval', done: false });
  });

  it('DELETE /todos/:id returns a 204 with no body', async () => {
    const result = await firstValueFrom(service.deleteTodosId('1', { observe: 'response' }));

    expect(result.status).toBe(204);
    expect(result.body).toBeNull();
  });
});
