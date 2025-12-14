import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

import { errorHandler } from "./middleware/error-handler";
import {
  authController,
  userController,
  subscriptionController,
  tournamentController,
  teamController,
  matchController,
} from "./controllers";
import { checkDatabaseConnection, closeDatabaseConnection } from "./db";

const app = new Hono();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3001";
const NODE_ENV = process.env.NODE_ENV || "development";

app.use("*", secureHeaders());

app.use(
  "*",
  cors({
    origin: CORS_ORIGIN.split(","),
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Total-Count", "X-Page", "X-Limit"],
    maxAge: 86400,
    credentials: true,
  })
);

if (NODE_ENV === "development") {
  app.use("*", logger());
}

app.use("*", timing());

if (NODE_ENV === "development") {
  app.use("*", prettyJSON());
}

app.onError(errorHandler);

app.get("/", (c) => {
  return c.json({
    name: "Poduim",
    version: "1.0.0",
    status: "running",
    environment: NODE_ENV,
  });
});

app.get("/health", async (c) => {
  const dbHealthy = await checkDatabaseConnection();

  const health = {
    status: dbHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    services: {
      api: "up",
      database: dbHealthy ? "up" : "down",
    },
  };

  return c.json(health, dbHealthy ? 200 : 503);
});

const api = new Hono();

api.route("/auth", authController);
api.route("/users", userController);
api.route("/subscriptions", subscriptionController);
api.route("/tournaments", tournamentController);
api.route("/teams", teamController);
api.route("/matches", matchController);

app.route("/api/v1", api);

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404
  );
});

const shutdown = async () => {
  console.log("\nShutting down gracefully...");
  await closeDatabaseConnection();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`
╔═══════════════════════════════════════════╗
║   Poduim API                              ║
║   Environment: ${NODE_ENV.padEnd(25)}║
║   Port: ${PORT.toString().padEnd(32)}║
╚═══════════════════════════════════════════╝
`);

export default {
  port: PORT,
  hostname: HOST,
  fetch: app.fetch,
};
