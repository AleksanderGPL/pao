import { Hono } from "hono";
import { authRequired } from "@/middleware/auth.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db/index.ts";
import { lobbiesTable, lobbyPlayersTable } from "@/db/schema.ts";
import { generateLobbyCode } from "@/utils/generate.ts";
import { eq } from "drizzle-orm";

const app = new Hono();

app.post(
  "/",
  authRequired,
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(256),
      maxPlayers: z.number().min(2).max(100),
    }),
  ),
  async (c) => {
    const { name, maxPlayers } = c.req.valid("json");

    const code = await generateLobbyCode();

    const [game] = await db.insert(lobbiesTable).values({
      name,
      maxPlayers,
      code,
    }).returning();

    await db.insert(lobbyPlayersTable).values({
      lobbyId: game.id,
      userId: c.get("session").user.id,
      isHost: true,
    });

    return c.json({ code });
  },
);

app.get(
  "/:code",
  authRequired,
  zValidator(
    "param",
    z.object({
      code: z.string().min(1).max(8),
    }),
  ),
  async (c) => {
    const { code } = c.req.valid("param");

    const game = await db.query.lobbiesTable.findFirst({
      where: eq(lobbiesTable.code, code),
      with: {
        players: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    return c.json({ game });
  },
);

export default app;
