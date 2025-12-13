import type {
  Tournament,
  Team,
  Match,
  ApiResponse,
  PaginatedResponse,
} from "@poduim/shared/types";

export interface MatchWithTeams extends Match {
  homeTeam: Team | null;
  awayTeam: Team | null;
}

export interface TournamentWithDetails extends Tournament {
  teams: Team[];
  matches: Match[];
  ranking: TeamRanking[];
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

export interface CreateTournamentDTO {
  name: string;
  description?: string;
  date: string;
}

export interface UpdateTournamentDTO {
  name?: string;
  description?: string;
  date?: string;
  status?: string;
}

export interface CreateTeamDTO {
  name: string;
  tournamentId: string;
}

export interface UpdateMatchScoreDTO {
  homeScore: number;
  awayScore: number;
}

export function useApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;

  async function $api<T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> {
    return $fetch<T>(endpoint, {
      baseURL,
      ...options,
    });
  }

  const tournaments = {
    list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
      $api<PaginatedResponse<Tournament>>("/tournaments", { query: params }),

    get: (id: string) => $api<ApiResponse<Tournament>>(`/tournaments/${id}`),

    getDetails: (id: string) =>
      $api<ApiResponse<TournamentWithDetails>>(`/tournaments/${id}/details`),

    getRanking: (id: string) =>
      $api<ApiResponse<{ tournamentId: string; rankings: TeamRanking[]; updatedAt: string }>>(
        `/tournaments/${id}/ranking`
      ),

    create: (data: CreateTournamentDTO) =>
      $api<ApiResponse<Tournament>>("/tournaments", {
        method: "POST",
        body: data,
      }),

    update: (id: string, data: UpdateTournamentDTO) =>
      $api<ApiResponse<Tournament>>(`/tournaments/${id}`, {
        method: "PATCH",
        body: data,
      }),

    delete: (id: string) =>
      $api<ApiResponse<null>>(`/tournaments/${id}`, {
        method: "DELETE",
      }),
  };

  const teams = {
    list: (tournamentId?: string) =>
      $api<ApiResponse<Team[]>>("/teams", {
        query: tournamentId ? { tournamentId } : undefined,
      }),

    get: (id: string) => $api<ApiResponse<Team>>(`/teams/${id}`),

    create: (data: CreateTeamDTO) =>
      $api<ApiResponse<Team>>("/teams", {
        method: "POST",
        body: data,
      }),

    update: (id: string, data: { name: string }) =>
      $api<ApiResponse<Team>>(`/teams/${id}`, {
        method: "PATCH",
        body: data,
      }),

    delete: (id: string) =>
      $api<ApiResponse<null>>(`/teams/${id}`, {
        method: "DELETE",
      }),
  };

  const matches = {
    list: (params?: { tournamentId?: string; status?: string }) =>
      $api<ApiResponse<Match[]>>("/matches", { query: params }),

    get: (id: string) => $api<ApiResponse<MatchWithTeams>>(`/matches/${id}`),

    generate: (tournamentId: string) =>
      $api<
        ApiResponse<Match[]> & {
          summary: { totalMatches: number; totalTeams: number; totalRounds: number };
        }
      >(`/matches/generate/${tournamentId}`, {
        method: "POST",
      }),

    updateScore: (id: string, data: UpdateMatchScoreDTO) =>
      $api<ApiResponse<Match>>(`/matches/${id}/score`, {
        method: "PUT",
        body: data,
      }),

    delete: (id: string) =>
      $api<ApiResponse<null>>(`/matches/${id}`, {
        method: "DELETE",
      }),

    deleteAll: (tournamentId: string) =>
      $api<ApiResponse<null>>(`/matches/tournament/${tournamentId}`, {
        method: "DELETE",
      }),
  };

  return {
    tournaments,
    teams,
    matches,
  };
}
