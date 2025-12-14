import type { UserResponse, ApiResponse, UserRole } from "@poduim/shared/types";

/** @deprecated Use UserResponse from @poduim/shared/types instead */
export type AdminUser = UserResponse;

interface CreateUserDTO {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

interface UpdateUserDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface UserListParams {
  search?: string;
  role?: UserRole;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "email" | "username" | "createdAt";
  order?: "asc" | "desc";
}

export function useAdminApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const authStore = useAuthStore();

  function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authStore.token) {
      headers["Authorization"] = `Bearer ${authStore.token}`;
    }
    return headers;
  }

  async function $adminApi<T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> {
    return $fetch<T>(endpoint, {
      baseURL,
      headers: getHeaders(),
      ...options,
    });
  }

  const users = {
    list: (params?: UserListParams) =>
      $adminApi<
        ApiResponse<AdminUser[]> & {
          pagination: { page: number; limit: number; total: number; totalPages: number };
        }
      >("/users", { query: params }),

    get: (id: string) => $adminApi<ApiResponse<AdminUser>>(`/users/${id}`),

    create: (data: CreateUserDTO) =>
      $adminApi<ApiResponse<AdminUser>>("/users", {
        method: "POST",
        body: data,
      }),

    update: (id: string, data: UpdateUserDTO) =>
      $adminApi<ApiResponse<AdminUser>>(`/users/${id}`, {
        method: "PUT",
        body: data,
      }),

    delete: (id: string) =>
      $adminApi<ApiResponse<{ message: string }>>(`/users/${id}`, {
        method: "DELETE",
      }),
  };

  return {
    users,
  };
}
