import type {
  AuthUser,
  AuthResult,
  ApiResponse,
  UserStats,
  SubscriptionResponse,
  SubscriptionStatus,
} from "@poduim/shared/types";

interface RegisterDTO {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface UpdateProfileDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export function useAuthApi() {
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

  async function $authApi<T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> {
    return $fetch<T>(endpoint, {
      baseURL,
      headers: getHeaders(),
      ...options,
    });
  }

  const auth = {
    login: (data: LoginDTO) =>
      $authApi<ApiResponse<AuthResult>>("/auth/login", {
        method: "POST",
        body: data,
      }),

    register: (data: RegisterDTO) =>
      $authApi<ApiResponse<AuthResult>>("/auth/register", {
        method: "POST",
        body: data,
      }),

    me: () => $authApi<ApiResponse<{ user: AuthUser }>>("/auth/me"),

    updateProfile: (data: UpdateProfileDTO) =>
      $authApi<ApiResponse<{ user: AuthUser }>>("/auth/me", {
        method: "PUT",
        body: data,
      }),

    changePassword: (data: ChangePasswordDTO) =>
      $authApi<ApiResponse<{ message: string }>>("/auth/change-password", {
        method: "POST",
        body: data,
      }),

    refresh: () =>
      $authApi<ApiResponse<{ token: string; expiresIn: number }>>("/auth/refresh", {
        method: "POST",
      }),

    stats: () => $authApi<ApiResponse<UserStats>>("/auth/stats"),
  };

  const subscriptions = {
    list: (params?: { page?: number; limit?: number }) =>
      $authApi<
        ApiResponse<SubscriptionResponse[]> & {
          pagination: { page: number; limit: number; total: number; totalPages: number };
        }
      >("/subscriptions", { query: params }),

    get: (tournamentId: string) =>
      $authApi<ApiResponse<SubscriptionStatus>>(`/subscriptions/${tournamentId}`),

    subscribe: (
      tournamentId: string,
      options?: { notifyOnMatch?: boolean; notifyOnResult?: boolean }
    ) =>
      $authApi<ApiResponse<SubscriptionResponse>>(`/subscriptions/${tournamentId}`, {
        method: "POST",
        body: options || {},
      }),

    update: (
      tournamentId: string,
      options: { notifyOnMatch?: boolean; notifyOnResult?: boolean }
    ) =>
      $authApi<ApiResponse<SubscriptionResponse>>(`/subscriptions/${tournamentId}`, {
        method: "PUT",
        body: options,
      }),

    unsubscribe: (tournamentId: string) =>
      $authApi<ApiResponse<{ message: string }>>(`/subscriptions/${tournamentId}`, {
        method: "DELETE",
      }),
  };

  return {
    auth,
    subscriptions,
  };
}
