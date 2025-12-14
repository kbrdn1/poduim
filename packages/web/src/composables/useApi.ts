import type {
  TournamentResponse,
  TeamResponse,
  MatchResponse,
  ApiResponse,
  PaginatedResponse,
  TournamentWithDetailsResponse,
  TeamRanking,
  MatchWithTeamsResponse,
} from "@poduim/shared/types";
import type {
  CreateTournament,
  UpdateTournament,
  CreateTeam,
  UpdateMatchScore,
} from "@poduim/shared/validators";

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
      $api<PaginatedResponse<TournamentResponse>>("/tournaments", { query: params }),

    get: (id: string) => $api<ApiResponse<TournamentResponse>>(`/tournaments/${id}`),

    getDetails: (id: string) =>
      $api<ApiResponse<TournamentWithDetailsResponse>>(`/tournaments/${id}/details`),

    getRanking: (id: string) =>
      $api<ApiResponse<{ tournamentId: string; rankings: TeamRanking[]; updatedAt: string }>>(
        `/tournaments/${id}/ranking`
      ),

    create: (data: CreateTournament) =>
      $api<ApiResponse<TournamentResponse>>("/tournaments", {
        method: "POST",
        body: data,
      }),

    update: (id: string, data: Partial<UpdateTournament>) =>
      $api<ApiResponse<TournamentResponse>>(`/tournaments/${id}`, {
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
      $api<ApiResponse<TeamResponse[]>>("/teams", {
        query: tournamentId ? { tournamentId } : undefined,
      }),

    get: (id: string) => $api<ApiResponse<TeamResponse>>(`/teams/${id}`),

    create: (data: CreateTeam) =>
      $api<ApiResponse<TeamResponse>>("/teams", {
        method: "POST",
        body: data,
      }),

    update: (id: string, data: { name: string }) =>
      $api<ApiResponse<TeamResponse>>(`/teams/${id}`, {
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
      $api<ApiResponse<MatchResponse[]>>("/matches", { query: params }),

    get: (id: string) => $api<ApiResponse<MatchWithTeamsResponse>>(`/matches/${id}`),

    generate: (tournamentId: string) =>
      $api<
        ApiResponse<MatchResponse[]> & {
          summary: { totalMatches: number; totalTeams: number; totalRounds: number };
        }
      >(`/matches/generate/${tournamentId}`, {
        method: "POST",
      }),

    updateScore: (id: string, data: UpdateMatchScore) =>
      $api<ApiResponse<MatchResponse>>(`/matches/${id}/score`, {
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
