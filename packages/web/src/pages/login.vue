<script setup lang="ts">
import type { FetchError } from "@poduim/shared/types";
import { AUTH_FEATURES_LOGIN } from "~/constants/auth";

definePageMeta({
  title: "Connexion",
  layout: "auth",
});

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive<{ email?: string; password?: string; general?: string }>({});
const isLoading = ref(false);

async function handleSubmit() {
  errors.email = undefined;
  errors.password = undefined;
  errors.general = undefined;

  if (!form.email) {
    errors.email = "L'email est requis";
    return;
  }
  if (!form.password) {
    errors.password = "Le mot de passe est requis";
    return;
  }

  isLoading.value = true;

  try {
    const response = await authStore.login(form.email, form.password);

    if (response.success) {
      router.push("/");
    } else {
      errors.general = response.error?.message || "Erreur de connexion";
    }
  } catch (error) {
    const err = error as FetchError;
    errors.general = err?.data?.error?.message || "Erreur de connexion";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <AuthBranding
      title="Gérez vos tournois<br />en toute simplicité"
      subtitle="Créez, organisez et suivez vos compétitions de baby-foot avec une interface intuitive."
      :features="AUTH_FEATURES_LOGIN"
    />

    <!-- Right Side - Form -->
    <div class="flex w-full items-center justify-center px-4 lg:w-1/2">
      <div class="w-full max-w-md">
        <AuthMobileLogo class="mb-8" />

        <!-- Back Link (Desktop) -->
        <NuxtLink
          to="/"
          class="mb-8 hidden items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900 lg:inline-flex"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          Retour à l'accueil
        </NuxtLink>

        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-slate-900">Connexion</h1>
          <p class="text-slate-600">Bienvenue ! Connectez-vous à votre compte.</p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
          <div
            v-if="errors.general"
            class="flex items-center gap-3 rounded-xl bg-danger-50 p-4 text-sm text-danger-700"
          >
            <Icon name="lucide:alert-circle" class="h-5 w-5 shrink-0" />
            {{ errors.general }}
          </div>

          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-slate-700">
              Adresse email
            </label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:mail" class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="votre@email.com"
                :disabled="isLoading"
                :class="[
                  'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.email
                    ? 'border-danger-300 bg-danger-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
                ]"
              />
            </div>
            <p v-if="errors.email" class="text-sm text-danger-600">
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:lock" class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                :disabled="isLoading"
                :class="[
                  'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.password
                    ? 'border-danger-300 bg-danger-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
                ]"
              />
            </div>
            <p v-if="errors.password" class="text-sm text-danger-600">
              {{ errors.password }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Spinner v-if="isLoading" size="sm" class="text-white" />
            <span>{{ isLoading ? "Connexion en cours..." : "Se connecter" }}</span>
            <Icon v-if="!isLoading" name="lucide:arrow-right" class="h-4 w-4" />
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-sm text-slate-600">
            Pas encore de compte ?
            <NuxtLink
              to="/register"
              class="font-semibold text-primary-600 hover:text-primary-700"
            >
              Créer un compte gratuitement
            </NuxtLink>
          </p>
        </div>

        <!-- Mobile Back Link -->
        <div class="mt-8 text-center lg:hidden">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <Icon name="lucide:arrow-left" class="h-4 w-4" />
            Retour à l'accueil
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
