import { upgradeWebSocket } from "hono/deno";
import type { Hono } from "hono";
import { redis } from "@/utils/redis.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { WSContext } from "hono/ws";
import { db } from "@/db/index.ts";
import { eq } from "drizzle-orm";
import { userSessionsTable } from "@/db/schema.ts";

const subscriber = redis.duplicate();
subscriber.psubscribe("game:*");
subscriber.on("pmessage", (_, channel, message) => {
  const data = JSON.parse(message);
  if (data.type === "player_joined") {
    const gameCode = channel.split(":")[1];

    for (const [key, ws] of wsClients.entries()) {
      if (key.startsWith(gameCode)) {
        ws.send(JSON.stringify(data));
      }
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

          wsClients.set(`${c.req.param("code")}:${user?.userId}`, ws);
        },
        onMessage(event) {
          console.log(`Message from client: ${event.data}`);
        },
        onClose: () => {
          console.log("Connection closed");
        },
      };
    }),
  );
}
