import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { tournamentService } from "../services";
import {
  createTournamentSchema,
  updateTournamentSchema,
  idSchema,
  tournamentQuerySchema,
} from "@poduim/shared/validators";
import { badRequest } from "../middleware/error-handler";

export const tournamentController = new Hono();

tournamentController.get("/", zValidator("query", tournamentQuerySchema), async (c) => {
  const { page, limit, status, search } = c.req.valid("query");

  const result = await tournamentService.getAll({ page, limit, status, search });

  c.header("X-Total-Count", result.total.toString());
  c.header("X-Page", page.toString());
  c.header("X-Limit", limit.toString());

  return c.json({
    success: true,
    data: result.tournaments,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
});

tournamentController.get("/:id", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid tournament ID format");
  }

  const result = await tournamentService.getById(id);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, data: result });
});

tournamentController.get("/:id/details", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid tournament ID format");
  }

  const result = await tournamentService.getDetails(id);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, data: result });
});

tournamentController.get("/:id/ranking", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid tournament ID format");
  }

  const result = await tournamentService.getRanking(id);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, data: result });
});

tournamentController.post("/", zValidator("json", createTournamentSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await tournamentService.create(data);

  return c.json({ success: true, data: result, message: "Tournament created successfully" }, 201);
});

tournamentController.patch("/:id", zValidator("json", updateTournamentSchema), async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid tournament ID format");
  }

  const data = c.req.valid("json");
  const result = await tournamentService.update(id, data);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, data: result, message: "Tournament updated successfully" });
});

tournamentController.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const validation = idSchema.safeParse(id);
  if (!validation.success) {
    return badRequest("Invalid tournament ID format");
  }

  const result = await tournamentService.delete(id);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, message: "Tournament and all related data deleted successfully" });
});
