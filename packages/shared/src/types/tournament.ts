import type { Team, TeamResponse } from "./team";
import type { Match, MatchResponse } from "./match";

export type TournamentStatus = "draft" | "registration" | "in_progress" | "completed" | "cancelled";

/**
 * Tournament entity (internal API use with Date objects)
 */
export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  date: Date;
  status: TournamentStatus;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tournament as returned by API (JSON serialized - dates are strings)
 */
export interface TournamentResponse {
  id: string;
  name: string;
  description: string | null;
  date: string;
  status: TournamentStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tournament subscription entity (internal API use)
 */
export interface TournamentSubscription {
  id: string;
  userId: string;
  tournamentId: string;
  notifyOnMatch: boolean;
  notifyOnResult: boolean;
  createdAt: Date;
}

/**
 * Subscription as returned by API (JSON serialized)
 */
export interface SubscriptionResponse {
  id: string;
  tournamentId: string;
  tournamentName?: string;
  tournamentStatus?: string;
  tournamentDate?: string;
  notifyOnMatch: boolean;
  notifyOnResult: boolean;
  subscribedAt: string;
}

/**
 * Subscription status check response
 */
export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscription: {
    id: string;
    tournamentId: string;
    notifyOnMatch: boolean | null;
    notifyOnResult: boolean | null;
    subscribedAt: string | null;
  } | null;
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/**
 * Tournament with details (internal API use)
 */
export interface TournamentWithDetails extends Tournament {
  teams: Team[];
  matches: Match[];
  ranking: TeamRanking[];
}

/**
 * Tournament with details as returned by API (JSON serialized)
 */
export interface TournamentWithDetailsResponse extends TournamentResponse {
  teams: TeamResponse[];
  matches: MatchResponse[];
  ranking: TeamRanking[];
}
