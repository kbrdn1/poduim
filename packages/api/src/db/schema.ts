import { mysqlTable, varchar, text, datetime, int, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: mysqlEnum("role", ["admin", "viewer"]).default("viewer"),
  isActive: boolean("is_active").default(true),
  acceptedTermsAt: datetime("accepted_terms_at"),
  lastLoginAt: datetime("last_login_at"),
  createdAt: datetime("created_at").default(new Date()),
  updatedAt: datetime("updated_at").default(new Date()),
});

export const tournaments = mysqlTable("tournaments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  date: datetime("date").notNull(),
  status: mysqlEnum("status", ["draft", "registration", "in_progress", "completed", "cancelled"]).default("draft"),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: datetime("created_at").default(new Date()),
  updatedAt: datetime("updated_at").default(new Date()),
});

export const teams = mysqlTable("teams", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tournamentId: varchar("tournament_id", { length: 36 }).notNull(),
  createdAt: datetime("created_at").default(new Date()),
  updatedAt: datetime("updated_at").default(new Date()),
});

export const matches = mysqlTable("matches", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tournamentId: varchar("tournament_id", { length: 36 }).notNull(),
  homeTeamId: varchar("home_team_id", { length: 36 }).notNull(),
  awayTeamId: varchar("away_team_id", { length: 36 }).notNull(),
  homeScore: int("home_score"),
  awayScore: int("away_score"),
  round: int("round").default(1),
  matchNumber: int("match_number").default(1),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
  scheduledAt: datetime("scheduled_at"),
  playedAt: datetime("played_at"),
  createdAt: datetime("created_at").default(new Date()),
  updatedAt: datetime("updated_at").default(new Date()),
});

export const tournamentSubscriptions = mysqlTable("tournament_subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  tournamentId: varchar("tournament_id", { length: 36 }).notNull(),
  notifyOnMatch: boolean("notify_on_match").default(true),
  notifyOnResult: boolean("notify_on_result").default(true),
  createdAt: datetime("created_at").default(new Date()),
});
