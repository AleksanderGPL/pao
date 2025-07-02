import { Hono } from "hono";
import auth from "./services/auth.ts";
import { FRONTEND_URL } from "./utils/global.ts";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors({
  origin: FRONTEND_URL,
}));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/auth", auth);

Deno.serve(app.fetch);
