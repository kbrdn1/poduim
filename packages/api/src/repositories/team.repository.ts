import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { teams } from "../db/schema";

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export const teamRepository = {
  async findById(id: string): Promise<Team | null> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
    return team || null;
  },

  async findByTournamentId(tournamentId: string): Promise<Team[]> {
    return db.select().from(teams).where(eq(teams.tournamentId, tournamentId));
  },

  async findAll(): Promise<Team[]> {
    return db.select().from(teams);
  },

  async findByNameInTournament(name: string, tournamentId: string): Promise<Team | null> {
    const [team] = await db
      .select()
      .from(teams)
      .where(and(eq(teams.tournamentId, tournamentId), eq(teams.name, name)))
      .limit(1);
    return team || null;
  },

  async create(data: NewTeam): Promise<void> {
    await db.insert(teams).values(data);
  },

  async update(id: string, data: Partial<NewTeam>): Promise<void> {
    await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  },

  async deleteByTournamentId(tournamentId: string): Promise<void> {
    await db.delete(teams).where(eq(teams.tournamentId, tournamentId));
  },
};
