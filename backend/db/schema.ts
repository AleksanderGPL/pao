import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const gameStatus = pgEnum("game_status", [
  "inactive",
  "active",
  "finished",
]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  profilePicture: text().notNull().default(
    "https://picsum.photos/id/11/500/500.jpg",
  ),
  email: text().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userSessionsTable = pgTable("user_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  sessionToken: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userSessionsRelations = relations(
  userSessionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userSessionsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const lobbiesTable = pgTable("lobbies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: text().notNull(),
  name: text().notNull(),
  maxPlayers: integer().notNull(),
  status: gameStatus().notNull().default("inactive"),
  createdAt: timestamp().notNull().defaultNow(),
});

export const lobbiesRelations = relations(lobbiesTable, ({ many }) => ({
  players: many(lobbyPlayersTable),
}));

export const lobbyPlayersTable = pgTable("lobby_players", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  lobbyId: integer().references(() => lobbiesTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  isAlive: boolean().notNull().default(true),
  isHost: boolean().notNull().default(false),
  killCount: integer().notNull().default(0),
  targetId: integer(),
  createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
  unique().on(t.lobbyId, t.userId),
]);

export const lobbyPlayersRelations = relations(
  lobbyPlayersTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [lobbyPlayersTable.userId],
      references: [usersTable.id],
    }),
    lobby: one(lobbiesTable, {
      fields: [lobbyPlayersTable.lobbyId],
      references: [lobbiesTable.id],
    }),
    target: one(lobbyPlayersTable, {
      fields: [lobbyPlayersTable.targetId],
      references: [lobbyPlayersTable.id],
    }),
  }),
);
