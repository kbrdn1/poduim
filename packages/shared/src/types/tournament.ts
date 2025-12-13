export type TournamentStatus = "draft" | "registration" | "in_progress" | "completed" | "cancelled";

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

export interface TournamentSubscription {
  id: string;
  userId: string;
  tournamentId: string;
  notifyOnMatch: boolean;
  notifyOnResult: boolean;
  createdAt: Date;
}
