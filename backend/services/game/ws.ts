import { upgradeWebSocket } from "hono/deno";
import type { Hono } from "hono";

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
