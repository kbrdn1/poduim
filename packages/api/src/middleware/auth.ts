import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface JWTPayload {
  sub: string;
  email: string;
  role: "admin" | "viewer";
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "admin" | "viewer";
  firstName: string | null;
  lastName: string | null;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
export const JWT_EXPIRES_IN = 60 * 60 * 24 * 7;

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header",
        },
      },
      401
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = (await verify(token, JWT_SECRET)) as unknown as JWTPayload;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User not found",
          },
        },
        401
      );
    }

    if (!user.isActive) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Account has been deactivated",
          },
        },
        403
      );
    }

    c.set("user", {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    } as AuthUser);

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      },
      401
    );
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user") as AuthUser | undefined;

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      401
    );
  }

  if (user.role !== "admin") {
    return c.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
      },
      403
    );
  }

  await next();
};

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    await next();
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = (await verify(token, JWT_SECRET)) as unknown as JWTPayload;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (user && user.isActive) {
      c.set("user", {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      } as AuthUser);
    }
  } catch {
    // Ignore token errors for optional auth
  }

  await next();
};
