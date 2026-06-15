import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { todosRouter } from "./routes/todos";

const app = new OpenAPIHono();

app.use("*", cors());
app.route("/", todosRouter);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Todo API", version: "1.0.0" },
});

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Backend running at http://localhost:3000");
  console.log("OpenAPI spec: http://localhost:3000/openapi.json");
});
