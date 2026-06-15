import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { todosRouter } from "./routes/todos";

export const app = new OpenAPIHono();

app.use("*", cors());
app.route("/", todosRouter);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Todo API", version: "1.0.0" },
});
