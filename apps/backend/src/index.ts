import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

const app = new OpenAPIHono();

// дозволяємо запити з Angular dev server (localhost:4200)
app.use("*", cors());

// Zod схема = TypeScript тип + OpenAPI schema одночасно
// .openapi({ example }) — додає приклад у згенерований spec
const TodoSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: "Learn orval" }),
    done: z.boolean().openapi({ example: false }),
  })
  .openapi("Todo");

const CreateTodoSchema = z
  .object({
    title: z.string().openapi({ example: "New todo" }),
  })
  .openapi("CreateTodo");

const NotFoundSchema = z
  .object({
    message: z.string(),
  })
  .openapi("NotFound");

// in-memory "база даних" для демо
const todos: z.infer<typeof TodoSchema>[] = [
  { id: 1, title: "Learn orval", done: false },
  { id: 2, title: "Build Angular app", done: false },
];

// createRoute описує контракт ендпоінту — звідси генерується OpenAPI spec
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

const getRoute = createRoute({
  method: "get",
  path: "/todos/{id}",
  // параметри шляху теж описуються через Zod
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: TodoSchema } },
      description: "Get todo by id",
    },
    404: {
      content: {
        "application/json": { schema: z.object({ message: z.string() }) },
      },
      description: "Not found",
    },
  },
});

const createRoute_ = createRoute({
  method: "post",
  path: "/todos",
  // тіло запиту теж описується через Zod — автоматична валідація вхідних даних
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

const deleteRoute = createRoute({
  method: "delete",
  path: "/todos/{id}",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: "Deleted" },
    404: {
      content: {
        "application/json": { schema: z.object({ message: z.string() }) },
      },
      description: "Not found",
    },
  },
});

// app.openapi(route, handler) — реєструє ендпоінт і прив'язує до нього опис
// c — context: доступ до запиту (c.req) і хелпери відповіді (c.json, c.body)
app.openapi(listRoute, (c) => c.json(todos));

app.openapi(getRoute, (c) => {
  const todo = todos.find((t) => t.id === Number(c.req.param("id")));
  if (!todo) return c.json({ message: "Not found" }, 404);
  return c.json(todo, 200);
});

app.openapi(createRoute_, async (c) => {
  const body = await c.req.json();
  const todo = { id: todos.length + 1, title: body.title, done: false };
  todos.push(todo);
  return c.json(todo, 201);
});

app.openapi(deleteRoute, (c) => {
  const idx = todos.findIndex((t) => t.id === Number(c.req.param("id")));
  if (idx === -1) return c.json({ message: "Not found" }, 404);
  todos.splice(idx, 1);
  return c.body(null, 204);
});

// генерує та віддає OpenAPI spec на GET /openapi.json — звідси orval читає API
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Todo API", version: "1.0.0" },
});

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Backend running at http://localhost:3000");
  console.log("OpenAPI spec: http://localhost:3000/openapi.json");
});
