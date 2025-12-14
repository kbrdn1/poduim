import { sign } from "hono/jwt";
import { eq, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { tournamentSubscriptions, tournaments, matches } from "../db/schema";
import { userRepository } from "../repositories";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../middleware/auth";

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  token: string;
  expiresIn: number;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export type AuthError =
  | { code: "EMAIL_EXISTS"; message: string }
  | { code: "USERNAME_EXISTS"; message: string }
  | { code: "INVALID_CREDENTIALS"; message: string }
  | { code: "ACCOUNT_DISABLED"; message: string }
  | { code: "INVALID_PASSWORD"; message: string }
  | { code: "USER_NOT_FOUND"; message: string };

export interface UserStats {
  subscriptions: {
    total: number;
    byStatus: {
      draft: number;
      registration: number;
      in_progress: number;
      completed: number;
      cancelled: number;
    };
  };
  matches: {
    upcoming: number;
    completed: number;
    total: number;
  };
  account: {
    memberSince: Date | null;
    lastLogin: Date | null;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResult | { error: AuthError }> {
    const existingUser = await userRepository.findByEmailOrUsername(data.email, data.username);

    if (existingUser) {
      if (existingUser.email === data.email) {
        return { error: { code: "EMAIL_EXISTS", message: "An account with this email already exists" } };
      }
      if (existingUser.username === data.username) {
        return { error: { code: "USERNAME_EXISTS", message: "This username is already taken" } };
      }
    }

    const hashedPassword = await hashPassword(data.password);
    const userId = crypto.randomUUID();
    const now = new Date();

    await userRepository.create({
      id: userId,
      email: data.email,
      password: hashedPassword,
      username: data.username,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: "viewer",
      isActive: true,
      acceptedTermsAt: data.acceptTerms ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    const token = await this.generateToken(userId, data.email, "viewer");

    return {
      user: {
        id: userId,
        email: data.email,
        username: data.username,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        role: "viewer",
      },
      token,
      expiresIn: JWT_EXPIRES_IN,
    };
  },

  async login(data: LoginData): Promise<AuthResult | { error: AuthError }> {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      return { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } };
    }

    const isValidPassword = await verifyPassword(data.password, user.password);

    if (!isValidPassword) {
      return { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } };
    }

    if (!user.isActive) {
      return { error: { code: "ACCOUNT_DISABLED", message: "Your account has been deactivated" } };
    }

    await userRepository.updateLastLogin(user.id);

    const token = await this.generateToken(user.id, user.email, user.role ?? "viewer");

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username ?? "",
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role ?? "viewer",
      },
      token,
      expiresIn: JWT_EXPIRES_IN,
    };
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<AuthResult["user"] | { error: AuthError }> {
    const user = await userRepository.findById(userId);

    if (!user) {
      return { error: { code: "USER_NOT_FOUND", message: "User not found" } };
    }

    if (data.username && data.username !== user.username) {
      const existingUser = await userRepository.findByUsername(data.username);
      if (existingUser) {
        return { error: { code: "USERNAME_EXISTS", message: "This username is already taken" } };
      }
    }

    await userRepository.update(userId, {
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const updatedUser = await userRepository.findByIdWithoutPassword(userId);

    if (!updatedUser) {
      return { error: { code: "USER_NOT_FOUND", message: "Failed to retrieve updated user" } };
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username ?? "",
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role ?? "viewer",
    };
  },

  async changePassword(userId: string, data: ChangePasswordData): Promise<{ success: true } | { error: AuthError }> {
    const user = await userRepository.findById(userId);

    if (!user) {
      return { error: { code: "USER_NOT_FOUND", message: "User not found" } };
    }

    const isValidPassword = await verifyPassword(data.currentPassword, user.password);

    if (!isValidPassword) {
      return { error: { code: "INVALID_PASSWORD", message: "Current password is incorrect" } };
    }

    const hashedPassword = await hashPassword(data.newPassword);
    await userRepository.update(userId, { password: hashedPassword });

    return { success: true };
  },

  async refreshToken(userId: string, email: string, role: string): Promise<{ token: string; expiresIn: number }> {
    const token = await this.generateToken(userId, email, role);
    return { token, expiresIn: JWT_EXPIRES_IN };
  },

  async generateToken(userId: string, email: string, role: string): Promise<string> {
    return sign(
      {
        sub: userId,
        email,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + JWT_EXPIRES_IN,
      },
      JWT_SECRET
    );
  },

  async getUserStats(userId: string): Promise<UserStats | { error: AuthError }> {
    const user = await userRepository.findById(userId);

    if (!user) {
      return { error: { code: "USER_NOT_FOUND", message: "User not found" } };
    }

    // Get user's subscribed tournament IDs
    const userSubscriptions = await db
      .select({
        tournamentId: tournamentSubscriptions.tournamentId,
      })
      .from(tournamentSubscriptions)
      .where(eq(tournamentSubscriptions.userId, userId));

    const subscribedTournamentIds = userSubscriptions.map((s) => s.tournamentId);

    // Get tournament status counts
    const statusCounts = {
      draft: 0,
      registration: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    if (subscribedTournamentIds.length > 0) {
      const tournamentStats = await db
        .select({
          status: tournaments.status,
          count: sql<number>`count(*)`,
        })
        .from(tournaments)
        .where(inArray(tournaments.id, subscribedTournamentIds))
        .groupBy(tournaments.status);

      for (const stat of tournamentStats) {
        const status = (stat.status ?? "draft") as keyof typeof statusCounts;
        statusCounts[status] = Number(stat.count);
      }
    }

    // Get match stats for subscribed tournaments
    let matchStats = { upcoming: 0, completed: 0, total: 0 };

    if (subscribedTournamentIds.length > 0) {
      const matchCounts = await db
        .select({
          status: matches.status,
          count: sql<number>`count(*)`,
        })
        .from(matches)
        .where(inArray(matches.tournamentId, subscribedTournamentIds))
        .groupBy(matches.status);

      for (const stat of matchCounts) {
        const count = Number(stat.count);
        matchStats.total += count;
        if (stat.status === "completed") {
          matchStats.completed += count;
        } else if (stat.status === "scheduled" || stat.status === "in_progress") {
          matchStats.upcoming += count;
        }
      }
    }

    return {
      subscriptions: {
        total: subscribedTournamentIds.length,
        byStatus: statusCounts,
      },
      matches: matchStats,
      account: {
        memberSince: user.createdAt,
        lastLogin: user.lastLoginAt,
      },
    };
  },
};
