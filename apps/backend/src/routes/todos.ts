import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  TodoSchema,
  CreateTodoSchema,
  UpdateTodoSchema,
  NotFoundSchema,
  type Todo,
} from "../schemas/todo";

export const todosRouter = new OpenAPIHono();

// in-memory store
let nextId = 3;
const todos: Todo[] = [
  { id: 1, title: "Learn orval", done: false },
  { id: 2, title: "Build Angular app", done: false },
];

const listRoute = createRoute({
  method: "get",
  path: "/todos",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(TodoSchema) } },
      description: "List all todos",
    },
  },
});

const getTodoRoute = createRoute({
  method: "get",
  path: "/todos/{id}",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: TodoSchema } },
      description: "Get todo by id",
    },
    404: {
      content: { "application/json": { schema: NotFoundSchema } },
      description: "Not found",
    },
  },
});

const createTodoRoute = createRoute({
  method: "post",
  path: "/todos",
  request: {
    body: { content: { "application/json": { schema: CreateTodoSchema } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: TodoSchema } },
      description: "Created todo",
    },
  },
});

const patchTodoRoute = createRoute({
  method: "patch",
  path: "/todos/{id}",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: UpdateTodoSchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TodoSchema } },
      description: "Updated todo",
    },
    404: {
      content: { "application/json": { schema: NotFoundSchema } },
      description: "Not found",
    },
  },
});

const deleteTodoRoute = createRoute({
  method: "delete",
  path: "/todos/{id}",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: "Deleted" },
    404: {
      content: { "application/json": { schema: NotFoundSchema } },
      description: "Not found",
    },
  },
});

todosRouter.openapi(listRoute, (c) => c.json(todos));

todosRouter.openapi(getTodoRoute, (c) => {
  const todo = todos.find((t) => t.id === Number(c.req.param("id")));

  if (!todo) return c.json({ message: "Not found" }, 404);

  return c.json(todo, 200);
});

todosRouter.openapi(createTodoRoute, (c) => {
  const body = c.req.valid("json");
  const todo: Todo = { id: nextId++, title: body.title, done: false };

  todos.push(todo);

  return c.json(todo, 201);
});

todosRouter.openapi(patchTodoRoute, (c) => {
  const todo = todos.find((t) => t.id === Number(c.req.param("id")));

  if (!todo) return c.json({ message: "Not found" }, 404);

  const body = c.req.valid("json");

  todo.done = body.done;

  return c.json(todo, 200);
});

todosRouter.openapi(deleteTodoRoute, (c) => {
  const idx = todos.findIndex((t) => t.id === Number(c.req.param("id")));

  if (idx === -1) return c.json({ message: "Not found" }, 404);

  todos.splice(idx, 1);

  return c.body(null, 204);
});
