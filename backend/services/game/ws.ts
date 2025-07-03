import { upgradeWebSocket } from "hono/deno";
import type { Hono } from "hono";
import { redis } from "@/utils/redis.ts";

const subscriber = await redis.duplicate();

subscriber.psubscribe("game:*");
subscriber.on("pmessage", (_, channel, message) => {
  console.log(channel, JSON.parse(message));
});

export function registerWsHandler(app: Hono) {
  app.get(
    "/api/game/:code/ws",
    upgradeWebSocket(() => {
      return {
        onOpen: () => {
          console.log("Connection opened");
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
