import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const errorHandler = (err: Error, c: Context) => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: { errors: formattedErrors },
        },
      },
      400
    );
  }

  if (err instanceof ApiError) {
    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      },
      err.statusCode as ContentfulStatusCode
    );
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          code: "HTTP_ERROR",
          message: err.message,
        },
      },
      err.status
    );
  }

  if (err.message?.includes("ECONNREFUSED") || err.message?.includes("ER_")) {
    return c.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Database operation failed",
        },
      },
      503
    );
  }

  const isDev = process.env.NODE_ENV === "development";

  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: isDev ? err.message : "An unexpected error occurred",
        ...(isDev && { stack: err.stack }),
      },
    },
    500
  );
};

export const notFound = (resource: string, id?: string): never => {
  throw new ApiError(404, "NOT_FOUND", id ? `${resource} with ID '${id}' not found` : `${resource} not found`);
};

export const badRequest = (message: string, details?: Record<string, unknown>): never => {
  throw new ApiError(400, "BAD_REQUEST", message, details);
};

export const conflict = (message: string): never => {
  throw new ApiError(409, "CONFLICT", message);
};

export const forbidden = (message: string = "Access denied"): never => {
  throw new ApiError(403, "FORBIDDEN", message);
};

export const unauthorized = (message: string = "Authentication required"): never => {
  throw new ApiError(401, "UNAUTHORIZED", message);
};
