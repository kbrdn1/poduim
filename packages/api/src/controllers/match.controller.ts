import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { matchService } from "../services";
import {
  createMatchSchema,
  updateMatchSchema,
  updateMatchScoreSchema,
  idSchema,
} from "@poduim/shared/validators";
import { badRequest } from "../middleware/error-handler";
import type { MatchStatus } from "../repositories";

export const matchController = new Hono();

matchController.get("/", async (c) => {
  const tournamentId = c.req.query("tournamentId");
  const status = c.req.query("status") as MatchStatus | undefined;

  if (tournamentId) {
    const validation = idSchema.safeParse(tournamentId);
    if (!validation.success) {
      return badRequest("Invalid tournament ID format");
    }
  }

  const result = await matchService.getAll({ tournamentId, status });

  return c.json({ success: true, data: result });
});

matchController.get("/:id", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid match ID format");
  }

  const result = await matchService.getById(id);

  if ("error" in result) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: result.error.message } }, 404);
  }

  return c.json({ success: true, data: result });
});

matchController.post("/", zValidator("json", createMatchSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await matchService.create(data);

  if ("error" in result) {
    const statusCode = result.error.code === "TOURNAMENT_NOT_FOUND" || result.error.code === "TEAM_NOT_FOUND" ? 404 : 400;
    return c.json({ success: false, error: { code: result.error.code, message: result.error.message } }, statusCode);
  }

  return c.json({ success: true, data: result, message: "Match created successfully" }, 201);
});

matchController.post("/generate/:tournamentId", async (c) => {
  const tournamentId = c.req.param("tournamentId");
  const validation = idSchema.safeParse(tournamentId);
  if (!validation.success) {
    return badRequest("Invalid tournament ID format");
  }

  const result = await matchService.generateRoundRobin(tournamentId);

  if ("error" in result) {
    const statusCode =
      result.error.code === "TOURNAMENT_NOT_FOUND"
        ? 404
        : result.error.code === "MATCHES_EXIST"
          ? 409
          : 400;
    return c.json({ success: false, error: { code: result.error.code, message: result.error.message } }, statusCode);
  }

  return c.json(
    {
      success: true,
      data: result.matches,
      message: `Generated ${result.summary.totalMatches} matches for ${result.summary.totalTeams} teams`,
      summary: result.summary,
    },
    201
  );
});

matchController.patch("/:id", zValidator("json", updateMatchSchema), async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid match ID format");
  }

  const data = c.req.valid("json");
  const result = await matchService.update(id, data);

  if ("error" in result) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: result.error.message } }, 404);
  }

  return c.json({ success: true, data: result, message: "Match updated successfully" });
});

matchController.put("/:id/score", zValidator("json", updateMatchScoreSchema), async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid match ID format");
  }

  const { homeScore, awayScore } = c.req.valid("json");
  const result = await matchService.updateScore(id, homeScore, awayScore);

  if ("error" in result) {
    const statusCode = result.error.code === "NOT_FOUND" ? 404 : 400;
    return c.json({ success: false, error: { code: result.error.code, message: result.error.message } }, statusCode);
  }

  return c.json({ success: true, data: result, message: "Match score updated successfully" });
});

matchController.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid match ID format");
  }

  const result = await matchService.delete(id);

  if ("error" in result) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: result.error.message } }, 404);
  }

  return c.json({ success: true, message: "Match deleted successfully" });
});

matchController.delete("/tournament/:tournamentId", async (c) => {
  const tournamentId = c.req.param("tournamentId");
  const validation = idSchema.safeParse(tournamentId);
  if (!validation.success) {
    return badRequest("Invalid tournament ID format");
  }

  const result = await matchService.deleteAllForTournament(tournamentId);

  if ("error" in result) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: result.error.message } }, 404);
  }

  return c.json({ success: true, message: "All matches deleted for this tournament" });
});
