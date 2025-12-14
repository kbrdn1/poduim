<script setup lang="ts">
import type { FetchError } from "@poduim/shared/types";

definePageMeta({
  title: "Créer un tournoi",
  middleware: ["admin"],
});

const api = useApi();
const router = useRouter();

const form = reactive({
  name: "",
  description: "",
  date: "",
});

const errors = reactive<Record<string, string>>({});
const loading = ref(false);
const apiError = ref("");

function validateForm(): boolean {
  // Reset errors
  Object.keys(errors).forEach((key) => delete errors[key]);
  apiError.value = "";

  let isValid = true;

  if (!form.name.trim()) {
    errors.name = "Le nom est requis";
    isValid = false;
  } else if (form.name.length < 3) {
    errors.name = "Le nom doit faire au moins 3 caractères";
    isValid = false;
  }

  if (!form.date) {
    errors.date = "La date est requise";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validateForm()) return;

  loading.value = true;

  try {
    const response = await api.tournaments.create({
      name: form.name,
      description: form.description || undefined,
      date: new Date(form.date).toISOString(),
    });

    if (response.success && response.data) {
      await router.push(`/tournaments/${response.data.id}`);
    }
  } catch (error) {
    const err = error as FetchError;
    apiError.value = err?.data?.error?.message || "Une erreur est survenue";
  } finally {
    loading.value = false;
  }
}

// Set default date to today
onMounted(() => {
  const today = new Date();
  form.date = today.toISOString().split("T")[0] ?? "";
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
    <div class="mx-auto max-w-2xl px-4">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/tournaments"
          class="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          Retour aux tournois
        </NuxtLink>
        <h1 class="text-3xl font-bold text-slate-900">Créer un tournoi</h1>
        <p class="mt-2 text-slate-600">
          Remplissez les informations pour créer votre nouveau tournoi de baby-foot.
        </p>
      </div>

      <!-- Form Card -->
      <Card class="p-8">
        <div class="mb-6 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
            <Icon name="lucide:trophy" class="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 class="text-xl font-semibold text-slate-900">Informations du tournoi</h2>
            <p class="text-sm text-slate-500">Définissez les détails de votre compétition</p>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- API Error -->
          <div
            v-if="apiError"
            class="flex items-center gap-3 rounded-xl bg-danger-50 p-4 text-sm text-danger-700"
          >
            <Icon name="lucide:alert-circle" class="h-5 w-5 shrink-0" />
            {{ apiError }}
          </div>

          <!-- Name -->
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-slate-700">
              Nom du tournoi <span class="text-danger-500">*</span>
            </label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:trophy" class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Ex: Tournoi de Noël 2024"
                :class="[
                  'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.name
                    ? 'border-danger-300 bg-danger-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
                ]"
              />
            </div>
            <p v-if="errors.name" class="text-sm text-danger-600">
              {{ errors.name }}
            </p>
          </div>

          <!-- Date -->
          <div class="space-y-2">
            <label for="date" class="block text-sm font-medium text-slate-700">
              Date du tournoi <span class="text-danger-500">*</span>
            </label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:calendar" class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="date"
                v-model="form.date"
                type="date"
                :class="[
                  'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.date
                    ? 'border-danger-300 bg-danger-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
                ]"
              />
            </div>
            <p v-if="errors.date" class="text-sm text-danger-600">
              {{ errors.date }}
            </p>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label for="description" class="block text-sm font-medium text-slate-700">
              Description
            </label>
            <div class="relative">
              <textarea
                id="description"
                v-model="form.description"
                rows="4"
                placeholder="Décrivez votre tournoi, les règles, le lieu..."
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p class="text-xs text-slate-500">
              Optionnel - Ajoutez des informations complémentaires pour les participants
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <NuxtLink
              to="/tournaments"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Annuler
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Spinner v-if="loading" size="sm" class="text-white" />
              <Icon v-else name="lucide:plus" class="h-4 w-4" />
              <span>{{ loading ? "Création..." : "Créer le tournoi" }}</span>
            </button>
          </div>
        </form>
      </Card>

      <!-- Tips -->
      <div class="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
            <Icon name="lucide:lightbulb" class="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 class="font-semibold text-slate-900">Conseils pour un bon tournoi</h3>
            <ul class="mt-3 space-y-2 text-sm text-slate-600">
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                <span>Choisissez un nom évocateur et mémorable</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                <span>Précisez le lieu et l'heure dans la description</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                <span>Prévoyez une date qui laisse le temps aux inscriptions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
