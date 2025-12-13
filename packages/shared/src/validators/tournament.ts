import { z } from "zod";

export const tournamentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["draft", "registration", "in_progress", "completed", "cancelled"]).optional(),
  search: z.string().optional(),
});

export const createTournamentSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  date: z.string().datetime({ message: "Invalid date format" }),
});

export const updateTournamentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  date: z.string().datetime({ message: "Invalid date format" }).optional(),
  status: z.enum(["draft", "registration", "in_progress", "completed", "cancelled"]).optional(),
});

export type TournamentQuery = z.infer<typeof tournamentQuerySchema>;
export type CreateTournament = z.infer<typeof createTournamentSchema>;
export type UpdateTournament = z.infer<typeof updateTournamentSchema>;
