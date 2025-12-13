import { subscriptionRepository, tournamentRepository, type SubscriptionWithTournament } from "../repositories";

export interface SubscribeData {
  notifyOnMatch: boolean;
  notifyOnResult: boolean;
}

export interface UpdateSubscriptionData {
  notifyOnMatch?: boolean;
  notifyOnResult?: boolean;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscription: {
    id: string;
    tournamentId: string;
    notifyOnMatch: boolean | null;
    notifyOnResult: boolean | null;
    subscribedAt: Date | null;
  } | null;
}

export type SubscriptionError =
  | { code: "NOT_FOUND"; message: string }
  | { code: "TOURNAMENT_NOT_FOUND"; message: string }
  | { code: "ALREADY_SUBSCRIBED"; message: string }
  | { code: "NOT_SUBSCRIBED"; message: string };

export const subscriptionService = {
  async getAll(userId: string, page: number, limit: number) {
    return subscriptionRepository.findAllByUser(userId, page, limit);
  },

  async getStatus(userId: string, tournamentId: string): Promise<SubscriptionStatus> {
    const subscription = await subscriptionRepository.findByUserAndTournament(userId, tournamentId);

    if (!subscription) {
      return { isSubscribed: false, subscription: null };
    }

    return {
      isSubscribed: true,
      subscription: {
        id: subscription.id,
        tournamentId: subscription.tournamentId,
        notifyOnMatch: subscription.notifyOnMatch,
        notifyOnResult: subscription.notifyOnResult,
        subscribedAt: subscription.createdAt,
      },
    };
  },

  async subscribe(
    userId: string,
    tournamentId: string,
    data: SubscribeData
  ): Promise<SubscriptionWithTournament | { error: SubscriptionError }> {
    const tournament = await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      return { error: { code: "TOURNAMENT_NOT_FOUND", message: "Tournament not found" } };
    }

    const existingSubscription = await subscriptionRepository.findByUserAndTournament(userId, tournamentId);

    if (existingSubscription) {
      return { error: { code: "ALREADY_SUBSCRIBED", message: "You are already following this tournament" } };
    }

    const subscriptionId = crypto.randomUUID();
    const now = new Date();

    await subscriptionRepository.create({
      id: subscriptionId,
      userId,
      tournamentId,
      notifyOnMatch: data.notifyOnMatch,
      notifyOnResult: data.notifyOnResult,
      createdAt: now,
    });

    return {
      id: subscriptionId,
      tournamentId,
      tournamentName: tournament.name,
      tournamentStatus: tournament.status!,
      tournamentDate: tournament.date,
      notifyOnMatch: data.notifyOnMatch,
      notifyOnResult: data.notifyOnResult,
      subscribedAt: now,
    };
  },

  async update(
    userId: string,
    tournamentId: string,
    data: UpdateSubscriptionData
  ): Promise<SubscriptionWithTournament | { error: SubscriptionError }> {
    const subscription = await subscriptionRepository.findByUserAndTournament(userId, tournamentId);

    if (!subscription) {
      return { error: { code: "NOT_SUBSCRIBED", message: "You are not following this tournament" } };
    }

    const updateData: Record<string, boolean> = {};
    if (data.notifyOnMatch !== undefined) updateData.notifyOnMatch = data.notifyOnMatch;
    if (data.notifyOnResult !== undefined) updateData.notifyOnResult = data.notifyOnResult;

    if (Object.keys(updateData).length > 0) {
      await subscriptionRepository.update(subscription.id, updateData);
    }

    const tournament = await tournamentRepository.findById(tournamentId);
    const updatedSubscription = await subscriptionRepository.findById(subscription.id);

    return {
      id: updatedSubscription!.id,
      tournamentId: updatedSubscription!.tournamentId,
      tournamentName: tournament!.name,
      tournamentStatus: tournament!.status!,
      tournamentDate: tournament!.date,
      notifyOnMatch: updatedSubscription!.notifyOnMatch,
      notifyOnResult: updatedSubscription!.notifyOnResult,
      subscribedAt: updatedSubscription!.createdAt,
    };
  },

  async unsubscribe(userId: string, tournamentId: string): Promise<{ success: true } | { error: SubscriptionError }> {
    const subscription = await subscriptionRepository.findByUserAndTournament(userId, tournamentId);

    if (!subscription) {
      return { error: { code: "NOT_SUBSCRIBED", message: "You are not following this tournament" } };
    }

    await subscriptionRepository.delete(subscription.id);

    return { success: true };
  },
};
