import { eq, like, and, sql, desc, type SQL } from "drizzle-orm";
import { db } from "../db";
import { tournaments, teams, matches } from "../db/schema";

export type Tournament = typeof tournaments.$inferSelect;
export type NewTournament = typeof tournaments.$inferInsert;
export type TournamentStatus = "draft" | "registration" | "in_progress" | "completed" | "cancelled";

export interface TournamentListParams {
  page: number;
  limit: number;
  status?: TournamentStatus;
  search?: string;
}

export interface TournamentListResult {
  tournaments: Tournament[];
  total: number;
}

export const tournamentRepository = {
  async findById(id: string): Promise<Tournament | null> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
    return tournament || null;
  },

  async findAll(params: TournamentListParams): Promise<TournamentListResult> {
    const { page, limit, status, search } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (status) {
      conditions.push(eq(tournaments.status, status));
    }

    if (search) {
      conditions.push(like(tournaments.name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(tournaments)
        .where(whereClause)
        .orderBy(desc(tournaments.date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tournaments)
        .where(whereClause),
    ]);

    return {
      tournaments: data,
      total: Number(countResult[0]?.count || 0),
    };
  },

  async create(data: NewTournament): Promise<void> {
    await db.insert(tournaments).values(data);
  },

  async update(id: string, data: Partial<NewTournament>): Promise<void> {
    await db
      .update(tournaments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tournaments.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(tournaments).where(eq(tournaments.id, id));
  },

  async deleteWithRelations(id: string): Promise<void> {
    await db.delete(matches).where(eq(matches.tournamentId, id));
    await db.delete(teams).where(eq(teams.tournamentId, id));
    await db.delete(tournaments).where(eq(tournaments.id, id));
  },

  async updateStatus(id: string, status: TournamentStatus): Promise<void> {
    await db
      .update(tournaments)
      .set({ status, updatedAt: new Date() })
      .where(eq(tournaments.id, id));
  },
};
