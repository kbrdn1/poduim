import { defineStore } from "pinia";
import type { AuthUser } from "@poduim/shared/types";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

const TOKEN_KEY = "poduim_token";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    isLoading: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === "admin",
    fullName: (state) => {
      if (!state.user) return "";
      const { firstName, lastName, username } = state.user;
      if (firstName || lastName) {
        return [firstName, lastName].filter(Boolean).join(" ");
      }
      return username;
    },
  },

  actions: {
    setAuth(user: AuthUser, token: string) {
      this.user = user;
      this.token = token;
      if (import.meta.client) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      if (import.meta.client) {
        localStorage.removeItem(TOKEN_KEY);
      }
    },

    async init() {
      if (!import.meta.client) {
        this.isLoading = false;
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        this.isLoading = false;
        return;
      }

      this.token = token;

      try {
        const { auth } = useAuthApi();
        const response = await auth.me();

        if (response.success && response.data) {
          this.user = response.data.user;
        } else {
          this.clearAuth();
        }
      } catch {
        this.clearAuth();
      } finally {
        this.isLoading = false;
      }
    },

    async login(email: string, password: string) {
      const { auth } = useAuthApi();
      const response = await auth.login({ email, password });

      if (response.success && response.data) {
        this.setAuth(response.data.user, response.data.token);
      }

      return response;
    },

    async register(data: {
      email: string;
      password: string;
      username: string;
      firstName?: string;
      lastName?: string;
      acceptTerms: boolean;
    }) {
      const { auth } = useAuthApi();
      const response = await auth.register(data);

      if (response.success && response.data) {
        this.setAuth(response.data.user, response.data.token);
      }

      return response;
    },

    logout() {
      this.clearAuth();
      navigateTo("/login");
    },
  },
});
