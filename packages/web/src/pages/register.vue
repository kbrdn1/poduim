<script setup lang="ts">
import type { FetchError } from "@poduim/shared/types";
import { AUTH_FEATURES_REGISTER } from "~/constants/auth";

definePageMeta({
  title: "Inscription",
  layout: "auth",
});

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  acceptTerms: false,
});

const errors = reactive<{
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
}>({});

const isLoading = ref(false);

function validateForm(): boolean {
  let isValid = true;

  errors.email = undefined;
  errors.username = undefined;
  errors.password = undefined;
  errors.confirmPassword = undefined;
  errors.acceptTerms = undefined;
  errors.general = undefined;

  if (!form.email) {
    errors.email = "L'email est requis";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Format d'email invalide";
    isValid = false;
  }

  if (!form.username) {
    errors.username = "Le nom d'utilisateur est requis";
    isValid = false;
  } else if (form.username.length < 3) {
    errors.username = "Le nom d'utilisateur doit faire au moins 3 caractères";
    isValid = false;
  } else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
    errors.username = "Caractères autorisés : lettres, chiffres, tirets et underscores";
    isValid = false;
  }

  if (!form.password) {
    errors.password = "Le mot de passe est requis";
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = "Le mot de passe doit faire au moins 8 caractères";
    isValid = false;
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = "Le mot de passe doit contenir une majuscule";
    isValid = false;
  } else if (!/[a-z]/.test(form.password)) {
    errors.password = "Le mot de passe doit contenir une minuscule";
    isValid = false;
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = "Le mot de passe doit contenir un chiffre";
    isValid = false;
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
    isValid = false;
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions générales d'utilisation";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validateForm()) return;

  isLoading.value = true;

  try {
    const response = await authStore.register({
      email: form.email,
      username: form.username,
      password: form.password,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      acceptTerms: form.acceptTerms,
    });

    if (response.success) {
      router.push("/");
    } else {
      if (response.error?.code === "EMAIL_EXISTS") {
        errors.email = response.error.message;
      } else if (response.error?.code === "USERNAME_EXISTS") {
        errors.username = response.error.message;
      } else {
        errors.general = response.error?.message || "Erreur lors de l'inscription";
      }
    }
  } catch (error) {
    const err = error as FetchError;
    const errorData = err?.data?.error;
    if (errorData?.code === "EMAIL_EXISTS") {
      errors.email = errorData.message;
    } else if (errorData?.code === "USERNAME_EXISTS") {
      errors.username = errorData.message;
    } else {
      errors.general = errorData?.message || "Erreur lors de l'inscription";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <AuthBranding
      title="Rejoignez<br />la communauté"
      subtitle="Créez votre compte et commencez à organiser vos tournois dès maintenant."
      :features="AUTH_FEATURES_REGISTER"
    />

    <!-- Right Side - Form -->
    <div class="flex w-full items-center justify-center overflow-y-auto px-4 py-8 lg:w-1/2">
      <div class="w-full max-w-md">
        <AuthMobileLogo class="mb-6" />

        <!-- Back Link (Desktop) -->
        <NuxtLink
          to="/"
          class="mb-6 hidden items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900 lg:inline-flex"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          Retour à l'accueil
        </NuxtLink>

        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-slate-900">Créer un compte</h1>
          <p class="text-slate-600">Rejoignez la communauté Poduim gratuitement.</p>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <div
            v-if="errors.general"
            class="flex items-center gap-3 rounded-xl bg-danger-50 p-4 text-sm text-danger-700"
          >
            <Icon name="lucide:alert-circle" class="h-5 w-5 shrink-0" />
            {{ errors.general }}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="firstName" class="block text-sm font-medium text-slate-700">
                Prénom
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Icon name="lucide:user" class="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  placeholder="Jean"
                  :disabled="isLoading"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="lastName" class="block text-sm font-medium text-slate-700">
                Nom
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Icon name="lucide:user" class="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  placeholder="Dupont"
                  :disabled="isLoading"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label for="username" class="block text-sm font-medium text-slate-700">
              Nom d'utilisateur
            </label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:at-sign" class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="jean_dupont"
                :disabled="isLoading"
                :class="[
                  'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.username
                    ? 'border-danger-300 bg-danger-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
                ]"
              />
            </div>
            <p v-if="errors.username" class="text-sm text-danger-600">
              {{ errors.username }}
            </p>
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
            <p class="text-xs text-slate-500">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
            <p v-if="errors.password" class="text-sm text-danger-600">
              {{ errors.password }}
            </p>
          </div>

          <div class="space-y-2">
            <label for="confirmPassword" class="block text-sm font-medium text-slate-700">
              Confirmer le mot de passe
            </label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:lock" class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                placeholder="••••••••"
                :disabled="isLoading"
                :class="[
                  'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.confirmPassword
                    ? 'border-danger-300 bg-danger-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
                ]"
              />
            </div>
            <p v-if="errors.confirmPassword" class="text-sm text-danger-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <div class="pt-2">
            <label class="flex items-start gap-3">
              <input
                id="acceptTerms"
                v-model="form.acceptTerms"
                type="checkbox"
                :disabled="isLoading"
                class="mt-0.5 h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm text-slate-600">
                J'accepte les
                <NuxtLink to="/terms" class="font-medium text-primary-600 hover:underline">
                  conditions générales d'utilisation
                </NuxtLink>
                et la
                <NuxtLink to="/privacy" class="font-medium text-primary-600 hover:underline">
                  politique de confidentialité
                </NuxtLink>
              </span>
            </label>
            <p v-if="errors.acceptTerms" class="mt-1 text-sm text-danger-600">
              {{ errors.acceptTerms }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Spinner v-if="isLoading" size="sm" class="text-white" />
            <span>{{ isLoading ? "Création en cours..." : "Créer mon compte" }}</span>
            <Icon v-if="!isLoading" name="lucide:arrow-right" class="h-4 w-4" />
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-slate-600">
            Déjà un compte ?
            <NuxtLink to="/login" class="font-semibold text-primary-600 hover:text-primary-700">
              Se connecter
            </NuxtLink>
          </p>
        </div>

        <!-- Mobile Back Link -->
        <div class="mt-6 text-center lg:hidden">
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
