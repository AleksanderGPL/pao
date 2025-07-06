import { Hono } from "hono";
import { authRequired } from "@/middleware/auth.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@/db/index.ts";
import { lobbiesTable, lobbyPlayersTable } from "@/db/schema.ts";
import { generateLobbyCode } from "@/utils/generate.ts";
import { and, eq } from "drizzle-orm";
import { redis } from "@/utils/redis.ts";
import { assignRandomTargets } from "@/utils/assign-targets.ts";
import { uploadFileBuffer } from "@/utils/s3.ts";
import sharp from "sharp";

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
      return c.json({
        ...game,
        playerId: existingPlayer.id,
        targetId: existingPlayer.targetId,
      });
    }

    if (game.players.length >= game.maxPlayers) {
      return c.json({ error: "Game is full" }, 400);
    }

    const [player] = await db.insert(lobbyPlayersTable).values({
      lobbyId: game.id,
      userId: session.user.id,
    }).returning();

    const newPlayer = {
      id: player.id,
      isAlive: player.isAlive,
      isHost: player.isHost,
      user: {
        name: session.user.name,
        profilePicture: session.user.profilePicture,
      },
    };

    redis.publish(
      `game:${game.code}`,
      JSON.stringify({
        type: "player_join",
        data: {
          player: newPlayer,
        },
      }),
    );

    return c.json({
      ...game,
      playerId: player.id,
      players: [
        ...game.players,
        newPlayer,
      ],
    });
  },
);

app.post(
  "/:code/start",
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
            userId: true,
            isHost: true,
          },
        },
      },
    });

    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    if (game.status !== "inactive") {
      return c.json({ error: "Game is not inactive" }, 400);
    }

    const session = c.get("session");

    if (
      game.players.find((player) => player.isHost)?.userId !== session.user.id
    ) {
      return c.json({ error: "You are not the host" }, 403);
    }

    if (game.players.length < 2) {
      return c.json(
        { error: "At least 2 players are required to start the game" },
        400,
      );
    }

    const targetAssignments = await assignRandomTargets(game.id);

    await Promise.all(
      targetAssignments.map((assignment) => {
        redis.publish(
          `game:${game.code}`,
          JSON.stringify({
            type: "player_target_assigned",
            data: assignment,
          }),
        );
      }),
    );

    await db.update(lobbiesTable).set({
      status: "active",
    }).where(eq(lobbiesTable.id, game.id));

    redis.publish(
      `game:${game.code}`,
      JSON.stringify({
        type: "start_game",
      }),
    );

    return c.json({ message: "Game started" });
  },
);

app.post(
  "/:code/player/:playerId/shoot",
  authRequired,
  zValidator(
    "param",
    z.object({
      code: z.string().min(1).max(8),
      playerId: z.coerce.number(),
    }),
  ),
  zValidator(
    "form",
    z.object({
      image: z.instanceof(File)
        .refine(
          (file) => file.size > 0,
          "Uploaded image cannot be empty.",
        )
        .refine((file) => file.size <= 1024 * 1024 * 5, {
          message: "Image must be less than 5MB",
        }).refine((file) => file.type.startsWith("image/"), {
          message: "Image must be an image",
        }),
    }),
  ),
  async (c) => {
    const { code, playerId } = c.req.valid("param");
    const { image } = c.req.valid("form");

    const game = await db.query.lobbiesTable.findFirst({
      where: eq(lobbiesTable.code, code),
    });

    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    const initiatingPlayer = await db.query.lobbyPlayersTable.findFirst({
      where: and(
        eq(lobbyPlayersTable.lobbyId, game.id),
        eq(lobbyPlayersTable.userId, c.get("session").user.id),
      ),
    });

    if (!initiatingPlayer) {
      return c.json({ error: "You are not in this game" }, 403);
    }

    if (initiatingPlayer.targetId !== playerId) {
      return c.json({ error: "This is not your target" }, 403);
    }

    if (initiatingPlayer.isAlive === false) {
      return c.json({ error: "You are already dead" }, 400);
    }

    const targetPlayer = await db.query.lobbyPlayersTable.findFirst({
      where: and(
        eq(lobbyPlayersTable.lobbyId, game.id),
        eq(lobbyPlayersTable.id, playerId),
      ),
    });

    if (!targetPlayer) {
      return c.json({ error: "Player not found" }, 404);
    }

    if (targetPlayer.isAlive === false) {
      return c.json({ error: "Target is already dead" }, 400);
    }

    const eliminatedPlayerTargetId = targetPlayer.targetId;

    await db.update(lobbyPlayersTable).set({
      isAlive: false,
    }).where(eq(lobbyPlayersTable.id, playerId));

    if (eliminatedPlayerTargetId) {
      await db.update(lobbyPlayersTable).set({
        targetId: eliminatedPlayerTargetId,
      }).where(eq(lobbyPlayersTable.id, initiatingPlayer.id));

      redis.publish(
        `game:${game.code}`,
        JSON.stringify({
          type: "player_target_assigned",
          data: {
            playerId: initiatingPlayer.id,
            targetId: eliminatedPlayerTargetId,
          },
        }),
      );
    }

    const sharpImage = sharp(await image.arrayBuffer());
    sharpImage.avif({ quality: 50 });
    await uploadFileBuffer({
      buffer: await sharpImage.toBuffer(),
      key: `game/${game.code}/player/${playerId}/shot.avif`,
    });

    redis.publish(
      `game:${game.code}`,
      JSON.stringify({
        type: "player_kill",
        data: {
          playerId,
        },
      }),
    );

    return c.json({ message: "Player killed" });
  },
);

export default app;
