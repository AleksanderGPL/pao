import { Hono } from "hono";
import { authRequired } from "@/middleware/auth.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db/index.ts";
import { lobbiesTable, lobbyPlayersTable } from "@/db/schema.ts";
import { generateLobbyCode } from "@/utils/generate.ts";
import { and, eq } from "drizzle-orm";

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

app.post(
  "/:code/join",
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
          columns: {
            id: true,
            isAlive: true,
            isHost: true,
          },
          with: {
            user: {
              columns: {
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    const session = c.get("session");

    const existingPlayer = await db.query.lobbyPlayersTable.findFirst({
      where: and(
        eq(lobbyPlayersTable.lobbyId, game.id),
        eq(lobbyPlayersTable.userId, session.user.id),
      ),
    });

    if (existingPlayer) {
      return c.json(game);
    }

    const [player] = await db.insert(lobbyPlayersTable).values({
      lobbyId: game.id,
      userId: session.user.id,
    }).returning();

    return c.json({
      ...game,
      players: [
        ...game.players,
        {
          id: player.id,
          isAlive: player.isAlive,
          isHost: player.isHost,
          user: {
            name: session.user.name,
            profilePicture: session.user.profilePicture,
          },
        },
      ],
    });
  },
);

export default app;
