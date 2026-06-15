import { z } from "@hono/zod-openapi";

export const TodoSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: "Learn orval" }),
    done: z.boolean().openapi({ example: false }),
  })
  .openapi("Todo");

export const CreateTodoSchema = z
  .object({
    title: z.string().openapi({ example: "New todo" }),
  })
  .openapi("CreateTodo");

export const UpdateTodoSchema = z
  .object({
    done: z.boolean().openapi({ example: true }),
  })
  .openapi("UpdateTodo");

export const NotFoundSchema = z
  .object({
    message: z.string(),
  })
  .openapi("NotFound");

export type Todo = z.infer<typeof TodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
