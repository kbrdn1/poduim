import { userRepository, type UserListParams, type UserWithoutPassword } from "../repositories";
import { hashPassword } from "../utils/crypto";

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "viewer";
}

export interface UpdateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "viewer";
  isActive?: boolean;
}

export type UserError =
  | { code: "NOT_FOUND"; message: string }
  | { code: "EMAIL_EXISTS"; message: string }
  | { code: "USERNAME_EXISTS"; message: string }
  | { code: "FORBIDDEN"; message: string };

export const userService = {
  async getAll(params: UserListParams) {
    return userRepository.findAll(params);
  },

  async getById(id: string): Promise<UserWithoutPassword | { error: UserError }> {
    const user = await userRepository.findByIdWithoutPassword(id);

    if (!user) {
      return { error: { code: "NOT_FOUND", message: "User not found" } };
    }

    return user;
  },

  async create(data: CreateUserData): Promise<UserWithoutPassword | { error: UserError }> {
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
      role: data.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: userId,
      email: data.email,
      username: data.username,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: data.role,
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(
    id: string,
    data: UpdateUserData,
    currentUserId: string
  ): Promise<UserWithoutPassword | { error: UserError }> {
    if (currentUserId === id && data.isActive === false) {
      return { error: { code: "FORBIDDEN", message: "You cannot deactivate your own account" } };
    }

    if (currentUserId === id && data.role === "viewer") {
      return { error: { code: "FORBIDDEN", message: "You cannot remove your own admin privileges" } };
    }

    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      return { error: { code: "NOT_FOUND", message: "User not found" } };
    }

    if (data.username) {
      const usernameExists = await userRepository.findByUsername(data.username);
      if (usernameExists && usernameExists.id !== id) {
        return { error: { code: "USERNAME_EXISTS", message: "This username is already taken" } };
      }
    }

    await userRepository.update(id, data);

    const updatedUser = await userRepository.findByIdWithoutPassword(id);
    return updatedUser!;
  },

  async delete(id: string, currentUserId: string): Promise<{ success: true } | { error: UserError }> {
    if (currentUserId === id) {
      return { error: { code: "FORBIDDEN", message: "You cannot delete your own account" } };
    }

    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      return { error: { code: "NOT_FOUND", message: "User not found" } };
    }

    await userRepository.softDelete(id);

    return { success: true };
  },
};
