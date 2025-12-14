import type { Team, TeamResponse } from "./team";

export type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

/**
 * Match entity (internal API use with Date objects)
 */
export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  round: number;
  matchNumber: number;
  status: MatchStatus;
  scheduledAt: Date | null;
  playedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Match as returned by API (JSON serialized - dates are strings)
 */
export interface MatchResponse {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  round: number;
  matchNumber: number;
  status: MatchStatus;
  scheduledAt: string | null;
  playedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Match with teams (internal API use)
 */
export interface MatchWithTeams extends Match {
  homeTeam: Team | null;
  awayTeam: Team | null;
}

/**
 * Match with teams as returned by API (JSON serialized)
 */
export interface MatchWithTeamsResponse extends MatchResponse {
  homeTeam: TeamResponse | null;
  awayTeam: TeamResponse | null;
}
