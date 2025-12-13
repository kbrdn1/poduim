import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../db";
import { tournamentSubscriptions, tournaments } from "../db/schema";

export type Subscription = typeof tournamentSubscriptions.$inferSelect;
export type NewSubscription = typeof tournamentSubscriptions.$inferInsert;

export interface SubscriptionWithTournament {
  id: string;
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: string | null;
  tournamentDate: Date;
  notifyOnMatch: boolean | null;
  notifyOnResult: boolean | null;
  subscribedAt: Date | null;
}

export interface SubscriptionListResult {
  subscriptions: SubscriptionWithTournament[];
  total: number;
}

export const subscriptionRepository = {
  async findById(id: string): Promise<Subscription | null> {
    const [subscription] = await db
      .select()
      .from(tournamentSubscriptions)
      .where(eq(tournamentSubscriptions.id, id))
      .limit(1);
    return subscription || null;
  },

  async findByUserAndTournament(userId: string, tournamentId: string): Promise<Subscription | null> {
    const [subscription] = await db
      .select()
      .from(tournamentSubscriptions)
      .where(
        and(
          eq(tournamentSubscriptions.userId, userId),
          eq(tournamentSubscriptions.tournamentId, tournamentId)
        )
      )
      .limit(1);
    return subscription || null;
  },

  async findAllByUser(userId: string, page: number, limit: number): Promise<SubscriptionListResult> {
    const offset = (page - 1) * limit;

    const [subscriptions, countResult] = await Promise.all([
      db
        .select({
          id: tournamentSubscriptions.id,
          tournamentId: tournamentSubscriptions.tournamentId,
          tournamentName: tournaments.name,
          tournamentStatus: tournaments.status,
          tournamentDate: tournaments.date,
          notifyOnMatch: tournamentSubscriptions.notifyOnMatch,
          notifyOnResult: tournamentSubscriptions.notifyOnResult,
          subscribedAt: tournamentSubscriptions.createdAt,
        })
        .from(tournamentSubscriptions)
        .innerJoin(tournaments, eq(tournamentSubscriptions.tournamentId, tournaments.id))
        .where(eq(tournamentSubscriptions.userId, userId))
        .orderBy(desc(tournamentSubscriptions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tournamentSubscriptions)
        .where(eq(tournamentSubscriptions.userId, userId)),
    ]);

    return {
      subscriptions,
      total: countResult[0]?.count || 0,
    };
  },

  async create(data: NewSubscription): Promise<void> {
    await db.insert(tournamentSubscriptions).values(data);
  },

  async update(id: string, data: Partial<Pick<Subscription, "notifyOnMatch" | "notifyOnResult">>): Promise<void> {
    await db.update(tournamentSubscriptions).set(data).where(eq(tournamentSubscriptions.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(tournamentSubscriptions).where(eq(tournamentSubscriptions.id, id));
  },

  async deleteByUserAndTournament(userId: string, tournamentId: string): Promise<void> {
    await db
      .delete(tournamentSubscriptions)
      .where(
        and(
          eq(tournamentSubscriptions.userId, userId),
          eq(tournamentSubscriptions.tournamentId, tournamentId)
        )
      );
  },
};
