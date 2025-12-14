import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, type AuthUser } from "../middleware/auth";
import { subscriptionService } from "../services";

const subscribeSchema = z.object({
  notifyOnMatch: z.boolean().default(true),
  notifyOnResult: z.boolean().default(true),
});

const updateSubscriptionSchema = z.object({
  notifyOnMatch: z.boolean().optional(),
  notifyOnResult: z.boolean().optional(),
});

export const subscriptionController = new Hono();

subscriptionController.use("*", authMiddleware);

subscriptionController.get("/", async (c) => {
  const user = c.get("user") as AuthUser;
  const { page = "1", limit = "10" } = c.req.query();

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const result = await subscriptionService.getAll(user.id, pageNum, limitNum);

  return c.json({
    success: true,
    data: result.subscriptions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: result.total,
      totalPages: Math.ceil(result.total / limitNum),
    },
  });
});

subscriptionController.get("/:tournamentId", async (c) => {
  const user = c.get("user") as AuthUser;
  const { tournamentId } = c.req.param();

  const result = await subscriptionService.getStatus(user.id, tournamentId);

  return c.json({ success: true, data: result });
});

subscriptionController.post("/:tournamentId", zValidator("json", subscribeSchema), async (c) => {
  const user = c.get("user") as AuthUser;
  const { tournamentId } = c.req.param();
  const data = c.req.valid("json");

  const result = await subscriptionService.subscribe(user.id, tournamentId, data);

  if ("error" in result) {
    const statusCode = result.error.code === "TOURNAMENT_NOT_FOUND" ? 404 : 400;
    return c.json({ success: false, error: result.error }, statusCode);
  }

  return c.json({ success: true, data: result }, 201);
});

subscriptionController.put("/:tournamentId", zValidator("json", updateSubscriptionSchema), async (c) => {
  const user = c.get("user") as AuthUser;
  const { tournamentId } = c.req.param();
  const data = c.req.valid("json");

  const result = await subscriptionService.update(user.id, tournamentId, data);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, data: result });
});

subscriptionController.delete("/:tournamentId", async (c) => {
  const user = c.get("user") as AuthUser;
  const { tournamentId } = c.req.param();

  const result = await subscriptionService.unsubscribe(user.id, tournamentId);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, data: { message: "Successfully unsubscribed from tournament" } });
});
