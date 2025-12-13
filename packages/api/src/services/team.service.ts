import { teamRepository, tournamentRepository, matchRepository, type Team } from "../repositories";
import { generateId } from "@poduim/shared/utils";

export interface CreateTeamData {
  name: string;
  tournamentId: string;
}

export interface UpdateTeamData {
  name?: string;
}

export type TeamError =
  | { code: "NOT_FOUND"; message: string }
  | { code: "TOURNAMENT_NOT_FOUND"; message: string }
  | { code: "INVALID_STATUS"; message: string }
  | { code: "DUPLICATE_NAME"; message: string }
  | { code: "HAS_MATCHES"; message: string };

export const teamService = {
  async getAll(tournamentId?: string): Promise<Team[]> {
    if (tournamentId) {
      return teamRepository.findByTournamentId(tournamentId);
    }
    return teamRepository.findAll();
  },

  async getById(id: string): Promise<Team | { error: TeamError }> {
    const team = await teamRepository.findById(id);

    if (!team) {
      return { error: { code: "NOT_FOUND", message: "Team not found" } };
    }

    return team;
  },

  async create(data: CreateTeamData): Promise<Team | { error: TeamError }> {
    const tournament = await tournamentRepository.findById(data.tournamentId);

    if (!tournament) {
      return { error: { code: "TOURNAMENT_NOT_FOUND", message: "Tournament not found" } };
    }

    if (tournament.status !== "draft" && tournament.status !== "registration") {
      return {
        error: {
          code: "INVALID_STATUS",
          message: "Cannot add teams to a tournament that is not in draft or registration status",
        },
      };
    }

    const existingTeam = await teamRepository.findByNameInTournament(data.name, data.tournamentId);

    if (existingTeam) {
      return {
        error: { code: "DUPLICATE_NAME", message: `A team named '${data.name}' already exists in this tournament` },
      };
    }

    const id = generateId();
    const now = new Date();

    await teamRepository.create({
      id,
      name: data.name,
      tournamentId: data.tournamentId,
      createdAt: now,
      updatedAt: now,
    });

    return (await teamRepository.findById(id))!;
  },

  async update(id: string, data: UpdateTeamData): Promise<Team | { error: TeamError }> {
    const existing = await teamRepository.findById(id);

    if (!existing) {
      return { error: { code: "NOT_FOUND", message: "Team not found" } };
    }

    if (data.name && data.name !== existing.name) {
      const duplicateTeam = await teamRepository.findByNameInTournament(data.name, existing.tournamentId);

      if (duplicateTeam) {
        return {
          error: { code: "DUPLICATE_NAME", message: `A team named '${data.name}' already exists in this tournament` },
        };
      }
    }

    await teamRepository.update(id, { name: data.name });

    return (await teamRepository.findById(id))!;
  },

  async delete(id: string): Promise<{ success: true } | { error: TeamError }> {
    const existing = await teamRepository.findById(id);

    if (!existing) {
      return { error: { code: "NOT_FOUND", message: "Team not found" } };
    }

    const hasMatches = await matchRepository.hasTeamMatches(id);

    if (hasMatches) {
      return {
        error: { code: "HAS_MATCHES", message: "Cannot delete team that has scheduled or completed matches" },
      };
    }

    await teamRepository.delete(id);

    return { success: true };
  },
};
