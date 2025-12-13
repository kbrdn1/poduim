<script setup lang="ts">
definePageMeta({
  title: "Connexion",
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
  } catch (error: unknown) {
    const fetchError = error as { data?: { error?: { message?: string } } };
    errors.general = fetchError?.data?.error?.message || "Erreur de connexion";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="mb-6 text-center">
          <div class="mb-2 flex justify-center">
            <Icon name="lucide:trophy" class="h-12 w-12 text-primary-600" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Connexion</h1>
          <p class="mt-1 text-sm text-slate-500">Connectez-vous à votre compte</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div
            v-if="errors.general"
            class="rounded-lg bg-danger-50 p-3 text-sm text-danger-600"
          >
            {{ errors.general }}
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
              :class="[
                'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.email
                  ? 'border-danger-300 bg-danger-50'
                  : 'border-slate-300 bg-white hover:border-slate-400',
              ]"
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
              :class="[
                'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.password
                  ? 'border-danger-300 bg-danger-50'
                  : 'border-slate-300 bg-white hover:border-slate-400',
              ]"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-danger-600">
              {{ errors.password }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <span class="spinner spinner-sm" />
              Connexion...
            </span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?
          <NuxtLink
            to="/register"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Créer un compte
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
