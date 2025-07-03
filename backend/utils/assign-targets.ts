import { db } from "@/db/index.ts";
import { lobbyPlayersTable } from "@/db/schema.ts";
import { eq } from "drizzle-orm";

export async function assignRandomTargets(lobbyId: number) {
  const players = await db.query.lobbyPlayersTable.findMany({
    where: eq(lobbyPlayersTable.lobbyId, lobbyId),
    columns: {
      id: true,
    },
  });

  const playerIds = players.map((p) => p.id);
  const targetIds = [...playerIds];

  for (let i = targetIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targetIds[i], targetIds[j]] = [targetIds[j], targetIds[i]];
  }

  for (let i = 0; i < playerIds.length; i++) {
    if (playerIds[i] === targetIds[i]) {
      const swapIndex = (i + 1) % playerIds.length;
      [targetIds[i], targetIds[swapIndex]] = [
        targetIds[swapIndex],
        targetIds[i],
      ];
    }
  }

  const updates = playerIds.map((playerId, index) =>
    db.update(lobbyPlayersTable)
      .set({ targetId: targetIds[index] })
      .where(eq(lobbyPlayersTable.id, playerId))
  );

  await Promise.all(updates);

  return playerIds.map((playerId, index) => ({
    playerId,
    targetId: targetIds[index],
  }));
}
