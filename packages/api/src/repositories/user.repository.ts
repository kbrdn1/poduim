import { eq, or, like, sql, desc, asc, type SQL } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserWithoutPassword = Omit<User, "password">;

export interface UserListParams {
  search?: string;
  role?: "admin" | "viewer";
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: "email" | "username" | "createdAt";
  order: "asc" | "desc";
}

export interface UserListResult {
  users: UserWithoutPassword[];
  total: number;
}

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  },

  async findByIdWithoutPassword(id: string): Promise<UserWithoutPassword | null> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        acceptedTermsAt: users.acceptedTermsAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user || null;
  },

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);
    return user || null;
  },

  async findAll(params: UserListParams): Promise<UserListResult> {
    const { search, role, isActive, page, limit, sortBy, order } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.username, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )!
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (isActive !== undefined) {
      conditions.push(eq(users.isActive, isActive));
    }

    const sortColumn = sortBy === "email" ? users.email : sortBy === "username" ? users.username : users.createdAt;
    const orderDirection = order === "asc" ? asc : desc;

    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

    const [usersList, countResult] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          acceptedTermsAt: users.acceptedTermsAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(orderDirection(sortColumn))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause),
    ]);

    return {
      users: usersList,
      total: countResult[0]?.count || 0,
    };
  },

  async create(data: NewUser): Promise<void> {
    await db.insert(users).values(data);
  },

  async update(id: string, data: Partial<NewUser>): Promise<void> {
    await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id));
  },

  async updateLastLogin(id: string): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  },

  async softDelete(id: string): Promise<void> {
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
  },
};
