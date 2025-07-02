import { Hono } from "hono";
import auth from "./services/auth.ts";
import { FRONTEND_URL } from "./utils/global.ts";
import { cors } from "hono/cors";
import game from "./services/game/index.ts";
import { generateLobbyCode } from "./utils/generate.ts";

const app = new Hono();

app.use(cors({
  origin: FRONTEND_URL,
}));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/auth", auth);
app.route("/api/game", game);

generateLobbyCode();

Deno.serve(app.fetch);
