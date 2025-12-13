import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  tournamentId: z.string().uuid("Invalid tournament ID"),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export type CreateTeam = z.infer<typeof createTeamSchema>;
export type UpdateTeam = z.infer<typeof updateTeamSchema>;
