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

  const targetIds = generateDerangement(playerIds);

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

function generateDerangement<T>(array: T[]): T[] {
  const n = array.length;
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  for (let i = 0; i < n; i++) {
    if (result[i] === array[i]) {
      let swapIndex = (i + 1) % n;

      while (swapIndex !== i) {
        if (
          result[swapIndex] !== array[swapIndex] &&
          result[swapIndex] !== array[i]
        ) {
          [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
          break;
        }
        swapIndex = (swapIndex + 1) % n;
      }

      if (swapIndex === i) {
        for (let j = 0; j < n; j++) {
          if (j !== i && result[j] !== array[j] && result[j] !== array[i]) {
            [result[i], result[j]] = [result[j], result[i]];
            break;
          }
        }
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (result[i] === array[i]) {
      return generateDerangement(array);
    }
  }

  return result;
}
