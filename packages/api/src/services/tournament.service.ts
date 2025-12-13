import {
  tournamentRepository,
  teamRepository,
  matchRepository,
  type Tournament,
  type TournamentListParams,
  type TournamentStatus,
} from "../repositories";
import { generateId, calculateRanking } from "@poduim/shared/utils";

export interface CreateTournamentData {
  name: string;
  description?: string;
  date: string;
}

export interface UpdateTournamentData {
  name?: string;
  description?: string;
  date?: string;
  status?: TournamentStatus;
}

export interface TournamentDetails extends Tournament {
  teams: Awaited<ReturnType<typeof teamRepository.findByTournamentId>>;
  matches: Awaited<ReturnType<typeof matchRepository.findByTournamentId>>;
  ranking: ReturnType<typeof calculateRanking>;
}

export type TournamentError = { code: "NOT_FOUND"; message: string };

export const tournamentService = {
  async getAll(params: TournamentListParams) {
    return tournamentRepository.findAll(params);
  },

  async getById(id: string): Promise<Tournament | { error: TournamentError }> {
    const tournament = await tournamentRepository.findById(id);

    if (!tournament) {
      return { error: { code: "NOT_FOUND", message: "Tournament not found" } };
    }

    return tournament;
  },

  async getDetails(id: string): Promise<TournamentDetails | { error: TournamentError }> {
    const tournament = await tournamentRepository.findById(id);

    if (!tournament) {
      return { error: { code: "NOT_FOUND", message: "Tournament not found" } };
    }

    const [teams, matches] = await Promise.all([
      teamRepository.findByTournamentId(id),
      matchRepository.findByTournamentId(id),
    ]);

    const ranking = calculateRanking(teams, matches);

    return {
      ...tournament,
      teams,
      matches,
      ranking,
    };
  },

  async getRanking(id: string) {
    const tournament = await tournamentRepository.findById(id);

    if (!tournament) {
      return { error: { code: "NOT_FOUND", message: "Tournament not found" } };
    }

    const [teams, matches] = await Promise.all([
      teamRepository.findByTournamentId(id),
      matchRepository.findByTournamentId(id),
    ]);

    return {
      tournamentId: id,
      rankings: calculateRanking(teams, matches),
      updatedAt: new Date().toISOString(),
    };
  },

  async create(data: CreateTournamentData): Promise<Tournament> {
    const id = generateId();
    const now = new Date();

    await tournamentRepository.create({
      id,
      name: data.name,
      description: data.description || null,
      date: new Date(data.date),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    const createdTournament = await tournamentRepository.findById(id);
    if (!createdTournament) {
      throw new Error("Failed to create tournament");
    }
    return createdTournament;
  },

  async update(id: string, data: UpdateTournamentData): Promise<Tournament | { error: TournamentError }> {
    const existing = await tournamentRepository.findById(id);

    if (!existing) {
      return { error: { code: "NOT_FOUND", message: "Tournament not found" } };
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.status !== undefined) updateData.status = data.status;

    await tournamentRepository.update(id, updateData);

    const updatedTournament = await tournamentRepository.findById(id);
    if (!updatedTournament) {
      return { error: { code: "NOT_FOUND", message: "Failed to retrieve updated tournament" } };
    }
    return updatedTournament;
  },

  async delete(id: string): Promise<{ success: true } | { error: TournamentError }> {
    const existing = await tournamentRepository.findById(id);

    if (!existing) {
      return { error: { code: "NOT_FOUND", message: "Tournament not found" } };
    }

    await tournamentRepository.deleteWithRelations(id);

    return { success: true };
  },
};
