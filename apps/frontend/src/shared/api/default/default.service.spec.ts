import { HttpErrorResponse, provideHttpClient, withFetch } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetFactorySeed } from '../../testing';
import type { CreateTodo, NotFound, Todo, UpdateTodo } from '../todoAPI.schemas';
import { DefaultService } from './default.service';

/**
 * Integration test: real generated {@link DefaultService} -> Angular HttpClient
 * (with `withFetch()`, required by MSW) -> hand-written MSW handlers -> Fishery.
 *
 * The factory seed is reset before each test so the deterministic Fishery
 * values are reproducible and can be asserted exactly.
 */
describe('DefaultService + MSW (V4: orval types + hand-written MSW + Fishery)', () => {
  let service: DefaultService;

  beforeEach(() => {
    // Reset falso seed + factory sequences -> deterministic data per test.
    resetFactorySeed();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(withFetch()), DefaultService],
    });
    service = TestBed.inject(DefaultService);
  });

  it('GET /todos returns the exact deterministic Fishery list', async () => {
    const todos = await firstValueFrom(service.getTodos());

    expect(todos).toEqual<Todo[]>([
      { id: 1, title: 'Intelligent Wooden Bacon', done: true },
      { id: 2, title: 'Intelligent Concrete Chicken', done: false },
      { id: 3, title: 'Handmade Frozen Salad', done: true },
    ]);
  });

  it('GET /todos/:id returns a todo whose id matches the requested path param', async () => {
    const todo = await firstValueFrom(service.getTodosId('42'));

    expect(todo).toEqual<Todo>({
      id: 42,
      title: 'Intelligent Wooden Bacon',
      done: true,
    });
  });

  it('GET /todos/0 returns a typed 404 NotFound (error path)', async () => {
    const error = await firstValueFrom(service.getTodosId('0')).catch(
      (e: HttpErrorResponse) => e,
    );

    expect(error).toBeInstanceOf(HttpErrorResponse);
    const httpError = error as HttpErrorResponse;
    expect(httpError.status).toBe(404);
    expect(httpError.error as NotFound).toEqual<NotFound>({
      message: 'Todo 0 not found',
    });
  });

  it('POST /todos echoes the created todo from the CreateTodo body', async () => {
    const body: CreateTodo = { title: 'Write integration tests' };

    const created = await firstValueFrom(service.postTodos(body));

    expect(created.title).toBe('Write integration tests');
    expect(created.id).toBe(1);
    expect(typeof created.done).toBe('boolean');
  });

  it('PATCH /todos/:id returns the updated todo with the UpdateTodo body applied', async () => {
    const body: UpdateTodo = { done: true };

    const updated = await firstValueFrom(service.patchTodosId('7', body));

    expect(updated).toEqual<Todo>({
      id: 7,
      title: 'Intelligent Wooden Bacon',
      done: true,
    });
  });

  it('DELETE /todos/:id resolves with no content (204)', async () => {
    const result = await firstValueFrom(service.deleteTodosId('7'));

    expect(result).toBeNull();
  });
});
