import { http, HttpResponse } from 'msw';

import type { CreateTodo, NotFound, Todo, UpdateTodo } from '../todoAPI.schemas';
import { db } from './db';

const BASE_URL = 'http://localhost:3000';

/**
 * `db.todo.toHandlers('rest', baseUrl)` returns, in order:
 *   [GET /todos, GET /todos/:id, POST /todos, PUT /todos/:id, DELETE /todos/:id]
 *
 * The two GET handlers already conform to the OpenAPI spec:
 *   - GET /todos     -> 200 Todo[]            (findMany)
 *   - GET /todos/:id -> 200 Todo / 404 {message} (findFirst strict + withErrors)
 *
 * The remaining three do NOT match the spec, so we drop them and replace them
 * with spec-conforming custom handlers (see below):
 *   - POST   -> the generated create() would require the full Todo body and
 *               throws DuplicatePrimaryKey because our auto-increment id getter
 *               is not invoked when an `id` is absent in older flows; we build
 *               the entity explicitly with `done: false`.
 *   - PUT    -> the spec uses PATCH, not PUT.
 *   - DELETE -> the spec returns 204 No Content, the generated one returns
 *               200 with the deleted entity.
 */
const [getTodos, getTodoById] = db.todo.toHandlers('rest', BASE_URL);

const handlers = [
  // GET /todos and GET /todos/:id (generated, spec-conforming)
  getTodos,
  getTodoById,

  // POST /todos -> 201 Todo. Body is CreateTodo { title }; id comes from the
  // model's auto-increment getter, done defaults to false.
  http.post<never, CreateTodo>(`${BASE_URL}/todos`, async ({ request }) => {
    const body = await request.json();
    const created = db.todo.create({ title: body.title, done: false }) as Todo;
    return HttpResponse.json(created, { status: 201 });
  }),

  // PATCH /todos/:id -> 200 Todo, or 404 NotFound { message } when absent.
  http.patch<{ id: string }, UpdateTodo>(`${BASE_URL}/todos/:id`, async ({ request, params }) => {
    const id = Number(params.id);
    const existing = db.todo.findFirst({ where: { id: { equals: id } } });
    if (!existing) {
      return HttpResponse.json<NotFound>({ message: 'Todo not found' }, { status: 404 });
    }
    const body = await request.json();
    const updated = db.todo.update({
      where: { id: { equals: id } },
      data: { done: body.done },
    }) as Todo;
    return HttpResponse.json(updated);
  }),

  // DELETE /todos/:id -> 204 No Content, or 404 NotFound { message } when absent.
  http.delete<{ id: string }>(`${BASE_URL}/todos/:id`, ({ params }) => {
    const id = Number(params.id);
    const existing = db.todo.findFirst({ where: { id: { equals: id } } });
    if (!existing) {
      return HttpResponse.json<NotFound>({ message: 'Todo not found' }, { status: 404 });
    }
    db.todo.delete({ where: { id: { equals: id } } });
    return new HttpResponse(null, { status: 204 });
  }),
];

export { handlers };
