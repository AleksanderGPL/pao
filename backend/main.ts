import { Hono } from "hono";
import auth from "./services/auth.ts";
import { FRONTEND_URLS } from "./utils/global.ts";
import { cors } from "hono/cors";
import game from "./services/game/index.ts";
import { generateLobbyCode } from "./utils/generate.ts";
import { registerWsHandler } from "./services/game/ws.ts";

const app = new Hono();

registerWsHandler(app);

app.use(cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/auth", auth);
app.route("/api/game", game);

generateLobbyCode();

Deno.serve(app.fetch);
