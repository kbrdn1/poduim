import { eq, and, or, type SQL } from "drizzle-orm";
import { db } from "../db";
import { matches } from "../db/schema";

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface MatchFilters {
  tournamentId?: string;
  status?: MatchStatus;
}

export const matchRepository = {
  async findById(id: string): Promise<Match | null> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
    return match || null;
  },

  async findByTournamentId(tournamentId: string): Promise<Match[]> {
    return db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(matches.round, matches.matchNumber);
  },

  async findAll(filters?: MatchFilters): Promise<Match[]> {
    const conditions: SQL[] = [];

    if (filters?.tournamentId) {
      conditions.push(eq(matches.tournamentId, filters.tournamentId));
    }

    if (filters?.status) {
      conditions.push(eq(matches.status, filters.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db.select().from(matches).where(whereClause).orderBy(matches.round, matches.matchNumber);
  },

  async findByTeamId(teamId: string): Promise<Match[]> {
    return db
      .select()
      .from(matches)
      .where(or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)));
  },

  async hasTeamMatches(teamId: string): Promise<boolean> {
    const [match] = await db
      .select()
      .from(matches)
      .where(or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)))
      .limit(1);
    return !!match;
  },

  async hasPendingMatches(tournamentId: string): Promise<boolean> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.tournamentId, tournamentId),
          or(eq(matches.status, "scheduled"), eq(matches.status, "in_progress"))
        )
      )
      .limit(1);
    return !!match;
  },

  async existsForTournament(tournamentId: string): Promise<boolean> {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .limit(1);
    return !!match;
  },

  async create(data: NewMatch): Promise<void> {
    await db.insert(matches).values(data);
  },

  async createMany(data: NewMatch[]): Promise<void> {
    await db.insert(matches).values(data);
  },

  async update(id: string, data: Partial<NewMatch>): Promise<void> {
    await db
      .update(matches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(matches.id, id));
  },

  async updateScore(id: string, homeScore: number, awayScore: number): Promise<void> {
    const now = new Date();
    await db
      .update(matches)
      .set({
        homeScore,
        awayScore,
        status: "completed",
        playedAt: now,
        updatedAt: now,
      })
      .where(eq(matches.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(matches).where(eq(matches.id, id));
  },

  async deleteByTournamentId(tournamentId: string): Promise<void> {
    await db.delete(matches).where(eq(matches.tournamentId, tournamentId));
  },
};
