import { upgradeWebSocket } from "hono/deno";
import type { Hono } from "hono";
import { redis } from "@/utils/redis.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { WSContext } from "hono/ws";
import { db } from "@/db/index.ts";
import { and, eq } from "drizzle-orm";
import {
  lobbiesTable,
  lobbyPlayersTable,
  userSessionsTable,
} from "@/db/schema.ts";

const subscriber = redis.duplicate();
subscriber.psubscribe("game:*");

const retransmittableEvents = ["player_join", "start_game", "player_kill"];

subscriber.on("pmessage", (_, channel, message) => {
  const data = JSON.parse(message);

  const gameCode = channel.split(":")[1];

  if (retransmittableEvents.includes(data.type)) {
    for (const [key, ws] of wsClients.entries()) {
      if (key.startsWith(gameCode)) {
        ws.send(JSON.stringify(data));
      }
    }
  } else if (data.type === "player_target_assigned") {
    const ws = wsClients.get(`${gameCode}:${data.data.playerId}`);
    if (ws) {
      ws.send(JSON.stringify({
        type: "player_target_assigned",
        data: {
          targetId: data.data.targetId,
        },
      }));
    }
  }
});

const wsClients = new Map<string, WSContext>();

export function registerWsHandler(app: Hono) {
  app.get(
    "/api/game/:code/ws",
    zValidator(
      "param",
      z.object({
        code: z.string().min(1).max(8),
      }),
    ),
    zValidator(
      "query",
      z.object({
        token: z.string().min(1),
      }),
    ),
    upgradeWebSocket((c) => {
      return {
        onOpen: async (_, ws) => {
          const token = c.req.query("token");
          const user = await db.query.userSessionsTable.findFirst({
            where: eq(userSessionsTable.sessionToken, token as string),
            with: {
              user: true,
            },
          });

          if (!user) {
            ws.close();
            return;
          }

          const gameCode = c.req.param("code");
          const game = await db.query.lobbiesTable.findFirst({
            where: eq(lobbiesTable.code, gameCode),
          });

          if (!game) {
            ws.close();
            return;
          }

          const player = await db.query.lobbyPlayersTable.findFirst({
            where: and(
              eq(lobbyPlayersTable.lobbyId, game?.id),
              eq(lobbyPlayersTable.userId, user.user.id),
            ),
            with: {
              user: true,
            },
          });

          wsClients.set(`${gameCode}:${player?.id}`, ws);
        },
        onClose: (_, ws) => {
          console.log("Connection closed");
          for (const [key, wsClient] of wsClients.entries()) {
            if (wsClient === ws) {
              wsClients.delete(key);
              break;
            }
          }
        },
      };
    }),
  );
}
