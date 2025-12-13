export type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

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
