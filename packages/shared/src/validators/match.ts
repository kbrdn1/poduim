import { z } from "zod";

export const createMatchSchema = z.object({
  tournamentId: z.string().uuid("Invalid tournament ID"),
  homeTeamId: z.string().uuid("Invalid home team ID"),
  awayTeamId: z.string().uuid("Invalid away team ID"),
  round: z.number().int().positive().optional(),
  matchNumber: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateMatchSchema = z.object({
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

export const updateMatchScoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export type CreateMatch = z.infer<typeof createMatchSchema>;
export type UpdateMatch = z.infer<typeof updateMatchSchema>;
export type UpdateMatchScore = z.infer<typeof updateMatchScoreSchema>;
