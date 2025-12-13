import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware, type AuthUser } from "../middleware/auth";
import { authService } from "../services";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validators/auth-schemas";

export const authController = new Hono();

authController.post("/register", zValidator("json", registerSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await authService.register(data);

  if ("error" in result) {
    const statusCode = result.error.code === "EMAIL_EXISTS" || result.error.code === "USERNAME_EXISTS" ? 400 : 500;
    return c.json({ success: false, error: result.error }, statusCode);
  }

  return c.json({ success: true, data: result }, 201);
});

authController.post("/login", zValidator("json", loginSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await authService.login(data);

  if ("error" in result) {
    const statusCode =
      result.error.code === "INVALID_CREDENTIALS" ? 401 : result.error.code === "ACCOUNT_DISABLED" ? 403 : 500;
    return c.json({ success: false, error: result.error }, statusCode);
  }

  return c.json({ success: true, data: result });
});

authController.get("/me", authMiddleware, async (c) => {
  const user = c.get("user") as AuthUser;
  return c.json({ success: true, data: { user } });
});

authController.put("/me", authMiddleware, zValidator("json", updateProfileSchema), async (c) => {
  const user = c.get("user") as AuthUser;
  const data = c.req.valid("json");
  const result = await authService.updateProfile(user.id, data);

  if ("error" in result) {
    const statusCode = result.error.code === "USERNAME_EXISTS" ? 400 : 404;
    return c.json({ success: false, error: result.error }, statusCode);
  }

  return c.json({ success: true, data: { user: result } });
});

authController.post("/change-password", authMiddleware, zValidator("json", changePasswordSchema), async (c) => {
  const user = c.get("user") as AuthUser;
  const data = c.req.valid("json");
  const result = await authService.changePassword(user.id, data);

  if ("error" in result) {
    return c.json({ success: false, error: result.error }, 400);
  }

  return c.json({ success: true, data: { message: "Password changed successfully" } });
});

authController.post("/refresh", authMiddleware, async (c) => {
  const user = c.get("user") as AuthUser;
  const result = await authService.refreshToken(user.id, user.email, user.role);
  return c.json({ success: true, data: result });
});
