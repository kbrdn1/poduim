<script setup lang="ts">
definePageMeta({
  title: "Inscription",
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
});

const errors = reactive<{
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}>({});

const isLoading = ref(false);

function validateForm(): boolean {
  let isValid = true;

  errors.email = undefined;
  errors.username = undefined;
  errors.password = undefined;
  errors.confirmPassword = undefined;
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
  } catch (error: unknown) {
    const fetchError = error as { data?: { error?: { code?: string; message?: string } } };
    const errorData = fetchError?.data?.error;
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

const inputClass = (hasError?: string) => [
  "w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
  hasError
    ? "border-danger-300 bg-danger-50"
    : "border-slate-300 bg-white hover:border-slate-400",
];
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="mb-6 text-center">
          <div class="mb-2 flex justify-center">
            <Icon name="lucide:trophy" class="h-12 w-12 text-primary-600" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p class="mt-1 text-sm text-slate-500">Rejoignez la communauté Poduim</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div
            v-if="errors.general"
            class="rounded-lg bg-danger-50 p-3 text-sm text-danger-600"
          >
            {{ errors.general }}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="mb-1 block text-sm font-medium text-slate-700">
                Prénom
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                placeholder="Jean"
                :disabled="isLoading"
                :class="inputClass()"
              />
            </div>

            <div>
              <label for="lastName" class="mb-1 block text-sm font-medium text-slate-700">
                Nom
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                placeholder="Dupont"
                :disabled="isLoading"
                :class="inputClass()"
              />
            </div>
          </div>

          <div>
            <label for="username" class="mb-1 block text-sm font-medium text-slate-700">
              Nom d'utilisateur <span class="text-danger-500">*</span>
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="jean_dupont"
              :disabled="isLoading"
              :class="inputClass(errors.username)"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-danger-600">
              {{ errors.username }}
            </p>
          </div>

          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-slate-700">
              Email <span class="text-danger-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="votre@email.com"
              :disabled="isLoading"
              :class="inputClass(errors.email)"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-danger-600">
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe <span class="text-danger-500">*</span>
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              :disabled="isLoading"
              :class="inputClass(errors.password)"
            />
            <p class="mt-1 text-xs text-slate-500">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
            <p v-if="errors.password" class="mt-1 text-sm text-danger-600">
              {{ errors.password }}
            </p>
          </div>

          <div>
            <label
              for="confirmPassword"
              class="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirmer le mot de passe <span class="text-danger-500">*</span>
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="••••••••"
              :disabled="isLoading"
              :class="inputClass(errors.confirmPassword)"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-danger-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <span class="spinner spinner-sm" />
              Création...
            </span>
            <span v-else>Créer mon compte</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?
          <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            Se connecter
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
