import { http, HttpResponse } from 'msw';

import type { CreateTodo, NotFound, Todo, UpdateTodo } from '../todoAPI.schemas';
import { todoFactory } from '../../testing/factories';

/**
 * Base URL of the Todo API (matches orval's generated `baseUrl`).
 * All handlers use absolute URLs so MSW intercepts the exact requests the
 * generated `DefaultService` makes.
 */
const BASE_URL = 'http://localhost:3000';

/**
 * Hand-written MSW request handlers, one per generated endpoint, each strictly
 * typed against the orval-generated DTOs for maximum control.
 *
 *  - GET    /todos      -> Todo[]   (deterministic Fishery list)
 *  - GET    /todos/:id  -> Todo     (404 NotFound when id === "0")
 *  - POST   /todos      -> Todo     (echoes the CreateTodo body)
 *  - PATCH  /todos/:id  -> Todo     (applies the UpdateTodo body)
 *  - DELETE /todos/:id  -> 204 No Content
 */
export const handlers = [
  // GET /todos -> list of todos
  http.get(`${BASE_URL}/todos`, () => {
    const todos: Todo[] = todoFactory.buildList(3);
    return HttpResponse.json(todos);
  }),

  // GET /todos/:id -> single todo, or 404 NotFound for the "0" id (error path demo)
  http.get<{ id: string }>(`${BASE_URL}/todos/:id`, ({ params }) => {
    const id = Number(params.id);

    if (id === 0) {
      const notFound: NotFound = { message: `Todo ${params.id} not found` };
      return HttpResponse.json(notFound, { status: 404 });
    }

    const todo: Todo = todoFactory.build({ id });
    return HttpResponse.json(todo);
  }),

  // POST /todos -> created todo echoed from the CreateTodo body
  http.post<never, CreateTodo>(`${BASE_URL}/todos`, async ({ request }) => {
    const body = (await request.json()) as CreateTodo;
    const created: Todo = todoFactory.build({ title: body.title });
    return HttpResponse.json(created, { status: 201 });
  }),

  // PATCH /todos/:id -> updated todo with the UpdateTodo body applied
  http.patch<{ id: string }, UpdateTodo>(
    `${BASE_URL}/todos/:id`,
    async ({ params, request }) => {
      const body = (await request.json()) as UpdateTodo;
      const updated: Todo = todoFactory.build({
        id: Number(params.id),
        done: body.done,
      });
      return HttpResponse.json(updated);
    },
  ),

  // DELETE /todos/:id -> 204 No Content (no body)
  http.delete<{ id: string }>(`${BASE_URL}/todos/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
