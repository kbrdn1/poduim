import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { teamService } from "../services";
import { createTeamSchema, updateTeamSchema, idSchema } from "@poduim/shared/validators";
import { badRequest } from "../middleware/error-handler";

export const teamController = new Hono();

teamController.get("/", async (c) => {
  const tournamentId = c.req.query("tournamentId");

  if (tournamentId) {
    const validation = idSchema.safeParse(tournamentId);
    if (!validation.success) {
      return badRequest("Invalid tournament ID format");
    }
  }

  const result = await teamService.getAll(tournamentId);

  return c.json({ success: true, data: result });
});

teamController.get("/:id", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid team ID format");
  }

  const result = await teamService.getById(id);

  if ("error" in result) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: result.error.message } }, 404);
  }

  return c.json({ success: true, data: result });
});

teamController.post("/", zValidator("json", createTeamSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await teamService.create(data);

  if ("error" in result) {
    const statusCode =
      result.error.code === "TOURNAMENT_NOT_FOUND"
        ? 404
        : result.error.code === "INVALID_STATUS" || result.error.code === "DUPLICATE_NAME"
          ? 400
          : 409;
    return c.json({ success: false, error: { code: result.error.code, message: result.error.message } }, statusCode);
  }

  return c.json({ success: true, data: result, message: "Team created successfully" }, 201);
});

teamController.patch("/:id", zValidator("json", updateTeamSchema), async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid team ID format");
  }

  const data = c.req.valid("json");
  const result = await teamService.update(id, data);

  if ("error" in result) {
    const statusCode = result.error.code === "NOT_FOUND" ? 404 : 409;
    return c.json({ success: false, error: { code: result.error.code, message: result.error.message } }, statusCode);
  }

  return c.json({ success: true, data: result, message: "Team updated successfully" });
});

teamController.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid team ID format");
  }

  const result = await teamService.delete(id);

  if ("error" in result) {
    const statusCode = result.error.code === "NOT_FOUND" ? 404 : 400;
    return c.json({ success: false, error: { code: result.error.code, message: result.error.message } }, statusCode);
  }

  return c.json({ success: true, message: "Team deleted successfully" });
});
