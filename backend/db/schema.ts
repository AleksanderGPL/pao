import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
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
  isHost: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
});

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
  }),
);
