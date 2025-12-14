export type UserRole = "admin" | "viewer";

/**
 * User entity (internal API use with Date objects)
 */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User as returned by API (JSON serialized - dates are strings)
 */
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** User data returned by auth endpoints (without sensitive fields) */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  expiresIn: number;
}

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
    memberSince: string | null;
    lastLogin: string | null;
  };
}
