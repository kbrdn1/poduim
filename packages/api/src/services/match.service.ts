import {
  matchRepository,
  tournamentRepository,
  teamRepository,
  type Match,
  type MatchFilters,
  type MatchStatus,
} from "../repositories";
import { generateId, generateRoundRobinMatches } from "@poduim/shared/utils";

export interface CreateMatchData {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  round?: number;
  matchNumber?: number;
  scheduledAt?: string;
}

export interface UpdateMatchData {
  homeScore?: number;
  awayScore?: number;
  status?: MatchStatus;
  scheduledAt?: string | null;
}

export interface MatchWithTeams extends Match {
  homeTeam: Awaited<ReturnType<typeof teamRepository.findById>>;
  awayTeam: Awaited<ReturnType<typeof teamRepository.findById>>;
}

export interface GenerateMatchesResult {
  matches: Match[];
  summary: {
    totalMatches: number;
    totalTeams: number;
    totalRounds: number;
  };
}

export type MatchError =
  | { code: "NOT_FOUND"; message: string }
  | { code: "TOURNAMENT_NOT_FOUND"; message: string }
  | { code: "TEAM_NOT_FOUND"; message: string }
  | { code: "INVALID_STATUS"; message: string }
  | { code: "MATCHES_EXIST"; message: string }
  | { code: "NOT_ENOUGH_TEAMS"; message: string }
  | { code: "CANCELLED"; message: string };

export const matchService = {
  async getAll(filters?: MatchFilters): Promise<Match[]> {
    return matchRepository.findAll(filters);
  },

  async getById(id: string): Promise<MatchWithTeams | { error: MatchError }> {
    const match = await matchRepository.findById(id);

    if (!match) {
      return { error: { code: "NOT_FOUND", message: "Match not found" } };
    }

    const [homeTeam, awayTeam] = await Promise.all([
      teamRepository.findById(match.homeTeamId),
      teamRepository.findById(match.awayTeamId),
    ]);

    return {
      ...match,
      homeTeam,
      awayTeam,
    };
  },

  async create(data: CreateMatchData): Promise<Match | { error: MatchError }> {
    const tournament = await tournamentRepository.findById(data.tournamentId);

    if (!tournament) {
      return { error: { code: "TOURNAMENT_NOT_FOUND", message: "Tournament not found" } };
    }

    const homeTeam = await teamRepository.findById(data.homeTeamId);
    if (!homeTeam || homeTeam.tournamentId !== data.tournamentId) {
      return { error: { code: "TEAM_NOT_FOUND", message: "Home team not found or does not belong to this tournament" } };
    }

    const awayTeam = await teamRepository.findById(data.awayTeamId);
    if (!awayTeam || awayTeam.tournamentId !== data.tournamentId) {
      return { error: { code: "TEAM_NOT_FOUND", message: "Away team not found or does not belong to this tournament" } };
    }

    const id = generateId();
    const now = new Date();

    await matchRepository.create({
      id,
      tournamentId: data.tournamentId,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      round: data.round || 1,
      matchNumber: data.matchNumber || 1,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });

    const createdMatch = await matchRepository.findById(id);
    if (!createdMatch) {
      return { error: { code: "NOT_FOUND", message: "Failed to create match" } };
    }
    return createdMatch;
  },

  async generateRoundRobin(tournamentId: string): Promise<GenerateMatchesResult | { error: MatchError }> {
    const tournament = await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      return { error: { code: "TOURNAMENT_NOT_FOUND", message: "Tournament not found" } };
    }

    if (tournament.status !== "draft" && tournament.status !== "registration") {
      return {
        error: {
          code: "INVALID_STATUS",
          message: "Can only generate matches for tournaments in draft or registration status",
        },
      };
    }

    const matchesExist = await matchRepository.existsForTournament(tournamentId);

    if (matchesExist) {
      return {
        error: { code: "MATCHES_EXIST", message: "Matches already exist for this tournament. Delete them first to regenerate." },
      };
    }

    const teams = await teamRepository.findByTournamentId(tournamentId);

    if (teams.length < 2) {
      return { error: { code: "NOT_ENOUGH_TEAMS", message: "Need at least 2 teams to generate matches" } };
    }

    const generatedMatches = generateRoundRobinMatches(teams);
    const now = new Date();

    const matchesToInsert = generatedMatches.map((match) => ({
      id: generateId(),
      tournamentId,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      round: match.round,
      matchNumber: match.matchNumber,
      status: "scheduled" as const,
      createdAt: now,
      updatedAt: now,
    }));

    await matchRepository.createMany(matchesToInsert);
    await tournamentRepository.updateStatus(tournamentId, "in_progress");

    const createdMatches = await matchRepository.findByTournamentId(tournamentId);

    return {
      matches: createdMatches,
      summary: {
        totalMatches: createdMatches.length,
        totalTeams: teams.length,
        totalRounds: Math.max(...generatedMatches.map((m) => m.round)),
      },
    };
  },

  async update(id: string, data: UpdateMatchData): Promise<Match | { error: MatchError }> {
    const existing = await matchRepository.findById(id);

    if (!existing) {
      return { error: { code: "NOT_FOUND", message: "Match not found" } };
    }

    const updateData: Record<string, unknown> = {};

    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.scheduledAt !== undefined) {
      updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }

    if (data.homeScore !== undefined && data.awayScore !== undefined) {
      updateData.status = "completed";
      updateData.playedAt = new Date();
    }

    await matchRepository.update(id, updateData);

    const updatedMatch = await matchRepository.findById(id);
    if (!updatedMatch) {
      return { error: { code: "NOT_FOUND", message: "Failed to update match" } };
    }
    return updatedMatch;
  },

  async updateScore(id: string, homeScore: number, awayScore: number): Promise<Match | { error: MatchError }> {
    const existing = await matchRepository.findById(id);

    if (!existing) {
      return { error: { code: "NOT_FOUND", message: "Match not found" } };
    }

    if (existing.status === "cancelled") {
      return { error: { code: "CANCELLED", message: "Cannot update score for a cancelled match" } };
    }

    await matchRepository.updateScore(id, homeScore, awayScore);

    const hasPendingMatches = await matchRepository.hasPendingMatches(existing.tournamentId);

    if (!hasPendingMatches) {
      await tournamentRepository.updateStatus(existing.tournamentId, "completed");
    }

    const updatedMatch = await matchRepository.findById(id);
    if (!updatedMatch) {
      return { error: { code: "NOT_FOUND", message: "Failed to update match score" } };
    }
    return updatedMatch;
  },

  async delete(id: string): Promise<{ success: true } | { error: MatchError }> {
    const existing = await matchRepository.findById(id);

    if (!existing) {
      return { error: { code: "NOT_FOUND", message: "Match not found" } };
    }

    await matchRepository.delete(id);

    return { success: true };
  },

  async deleteAllForTournament(tournamentId: string): Promise<{ success: true } | { error: MatchError }> {
    const tournament = await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      return { error: { code: "TOURNAMENT_NOT_FOUND", message: "Tournament not found" } };
    }

    await matchRepository.deleteByTournamentId(tournamentId);
    await tournamentRepository.updateStatus(tournamentId, "registration");

    return { success: true };
  },
};
