import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { describe, beforeEach, expect, it } from 'vitest';

import { DefaultService } from '../default/default.service';
import type { Todo } from '../todoAPI.schemas';

/**
 * End-to-end style test that drives the generated `DefaultService` against the
 * MSW + @mswjs/data stateful mock. It proves the in-memory database persists
 * mutations across requests within a single test:
 *
 *   POST -> GET list shows it -> PATCH toggles done -> GET shows updated
 *        -> DELETE -> GET 404.
 *
 * CRITICAL: uses `provideHttpClient(withFetch())` so Angular's HttpClient issues
 * real `fetch` requests that MSW can intercept.
 */
describe('MSW stateful CRUD (Orval types + @mswjs/data)', () => {
  let service: DefaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withFetch())],
    });
    service = TestBed.inject(DefaultService);
  });

  it('persists a full create -> read -> update -> delete lifecycle', async () => {
    // The db is seeded with 3 todos in test-setup's afterEach/beforeAll.
    const initial = await firstValueFrom(service.getTodos());
    expect(initial).toHaveLength(3);

    // CREATE: POST /todos with CreateTodo { title }
    const created = await firstValueFrom(service.postTodos({ title: 'Write MSW test' }));
    expect(created).toMatchObject({ title: 'Write MSW test', done: false });
    expect(typeof created.id).toBe('number');

    // READ list: the new todo is persisted in the db and shows up.
    const afterCreate = await firstValueFrom(service.getTodos());
    expect(afterCreate).toHaveLength(4);
    expect(afterCreate.some((t: Todo) => t.id === created.id && t.title === 'Write MSW test')).toBe(
      true,
    );

    // READ one by id
    const fetchedOne = await firstValueFrom(service.getTodosId(String(created.id)));
    expect(fetchedOne).toMatchObject({ id: created.id, title: 'Write MSW test', done: false });

    // UPDATE: PATCH /todos/:id toggles done to true
    const updated = await firstValueFrom(
      service.patchTodosId(String(created.id), { done: true }),
    );
    expect(updated).toMatchObject({ id: created.id, done: true });

    // READ shows the persisted update
    const afterUpdate = await firstValueFrom(service.getTodosId(String(created.id)));
    expect(afterUpdate.done).toBe(true);

    // DELETE: 204 No Content
    const deleteResponse = await firstValueFrom(
      service.deleteTodosId(String(created.id), { observe: 'response' }),
    );
    expect(deleteResponse.status).toBe(204);

    // READ list no longer contains it (persistent removal)
    const afterDelete = await firstValueFrom(service.getTodos());
    expect(afterDelete).toHaveLength(3);
    expect(afterDelete.some((t: Todo) => t.id === created.id)).toBe(false);

    // READ one by id -> 404 NotFound { message }
    const error = await firstValueFrom(service.getTodosId(String(created.id))).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(404);
    expect((error as HttpErrorResponse).error).toMatchObject({ message: expect.any(String) });
  });

  it('isolates state between tests (db reset + reseed)', async () => {
    // If the previous test leaked, this would be 4, not 3. Proves resetDb + reseed.
    const todos = await firstValueFrom(service.getTodos());
    expect(todos).toHaveLength(3);
  });

  it('returns 404 NotFound for PATCH on a missing todo', async () => {
    const error = await firstValueFrom(
      service.patchTodosId('9999', { done: true }),
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(404);
    expect((error as HttpErrorResponse).error).toMatchObject({ message: expect.any(String) });
  });

  it('assigns auto-incrementing ids on create (no DuplicatePrimaryKey)', async () => {
    const first = await firstValueFrom(service.postTodos({ title: 'first' }));
    const second = await firstValueFrom(service.postTodos({ title: 'second' }));
    expect(second.id).toBeGreaterThan(first.id);
  });
});
