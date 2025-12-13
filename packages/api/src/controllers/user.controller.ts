import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, adminMiddleware, type AuthUser } from "../middleware/auth";
import { userService } from "../services";

const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.enum(["admin", "viewer"]).default("viewer"),
});

const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens")
    .optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.enum(["admin", "viewer"]).optional(),
  isActive: z.boolean().optional(),
});

export const userController = new Hono();

userController.use("*", authMiddleware);
userController.use("*", adminMiddleware);

userController.get("/", async (c) => {
  const { search, role, active, page = "1", limit = "10", sortBy = "createdAt", order = "desc" } = c.req.query();

  const result = await userService.getAll({
    search,
    role: role as "admin" | "viewer" | undefined,
    isActive: active === "true" ? true : active === "false" ? false : undefined,
    page: Math.max(1, parseInt(page)),
    limit: Math.min(100, Math.max(1, parseInt(limit))),
    sortBy: sortBy as "email" | "username" | "createdAt",
    order: order as "asc" | "desc",
  });

  return c.json({
    success: true,
    data: result.users,
    pagination: {
      page: Math.max(1, parseInt(page)),
      limit: Math.min(100, Math.max(1, parseInt(limit))),
      total: result.total,
      totalPages: Math.ceil(result.total / Math.min(100, Math.max(1, parseInt(limit)))),
    },
  });
});

userController.get("/:id", async (c) => {
  const { id } = c.req.param();
  const result = await userService.getById(id);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 404);
  }

  return c.json({ success: true, data: result });
});

userController.post("/", zValidator("json", createUserSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await userService.create(data);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 400);
  }

  return c.json({ success: true, data: result }, 201);
});

userController.put("/:id", zValidator("json", updateUserSchema), async (c) => {
  const { id } = c.req.param();
  const data = c.req.valid("json");
  const currentUser = c.get("user") as AuthUser;

  const result = await userService.update(id, data, currentUser.id);

  if ("error" in result) {
    const statusCode =
      result.error.code === "NOT_FOUND" ? 404 : result.error.code === "FORBIDDEN" ? 403 : 400;
    return c.json({ success: false, error: result.error }, statusCode);
  }

  return c.json({ success: true, data: result });
});

userController.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const currentUser = c.get("user") as AuthUser;

  const result = await userService.delete(id, currentUser.id);

  if ("error" in result) {
    const statusCode = result.error.code === "NOT_FOUND" ? 404 : 403;
    return c.json({ success: false, error: result.error }, statusCode);
  }

  return c.json({ success: true, data: { message: "User has been deactivated" } });
});
