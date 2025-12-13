<script setup lang="ts">
definePageMeta({
  title: "Accueil",
});

const api = useApi();
const authStore = useAuthStore();

const { data: tournamentsResponse, pending, error } = await useAsyncData(
  "home-tournaments",
  () => api.tournaments.list({ limit: 5 }),
  { server: false }
);

const tournaments = computed(() => tournamentsResponse.value?.data || []);

const features = [
  {
    icon: "lucide:trophy",
    title: "Création de Tournois",
    description: "Créez des tournois avec un nom, une date et une description.",
  },
  {
    icon: "lucide:users",
    title: "Gestion des Équipes",
    description: "Ajoutez et gérez les équipes participantes facilement.",
  },
  {
    icon: "lucide:calendar",
    title: "Planification Automatique",
    description: "Générez automatiquement tous les matchs en un clic.",
  },
  {
    icon: "lucide:goal",
    title: "Suivi des Matchs",
    description: "Enregistrez les scores et suivez l'avancement en temps réel.",
  },
  {
    icon: "lucide:bar-chart-2",
    title: "Classement",
    description: "Consultez le classement mis à jour automatiquement.",
  },
  {
    icon: "lucide:palette",
    title: "Interface Intuitive",
    description: "Une interface moderne et réactive pour une expérience optimale.",
  },
];

function getStatusVariant(status: string): string {
  const variants: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    registration: "bg-primary-100 text-primary-700",
    in_progress: "bg-warning-100 text-warning-700",
    completed: "bg-success-100 text-success-700",
    cancelled: "bg-danger-100 text-danger-700",
  };
  return variants[status] || "bg-slate-100 text-slate-700";
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    registration: "Inscriptions",
    in_progress: "En cours",
    completed: "Terminé",
    cancelled: "Annulé",
  };
  return labels[status] || status;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div class="space-y-16">
    <section class="py-12 text-center">
      <h1
        class="mb-4 flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
      >
        <Icon name="lucide:trophy" class="h-10 w-10 text-primary-600 sm:h-12 sm:w-12" />
        Gestion de Tournois de Baby-Foot
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
        Créez et gérez vos tournois de baby-foot facilement. Ajoutez des équipes,
        générez automatiquement les matchs et suivez les résultats en temps réel.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <NuxtLink
          v-if="authStore.isAdmin"
          to="/tournaments/create"
          class="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Créer un tournoi
        </NuxtLink>
        <NuxtLink
          to="/tournaments"
          class="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Voir les tournois
        </NuxtLink>
      </div>
    </section>

    <section>
      <h2 class="mb-8 text-center text-2xl font-bold text-slate-900">Fonctionnalités</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="mb-3">
            <Icon :name="feature.icon" class="h-10 w-10 text-primary-600" />
          </div>
          <h3 class="mb-2 text-lg font-semibold text-slate-900">{{ feature.title }}</h3>
          <p class="text-sm text-slate-600">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section v-if="pending" class="py-12">
      <div class="flex justify-center">
        <div class="spinner spinner-lg" />
      </div>
    </section>

    <section v-else-if="error">
      <div class="rounded-xl border border-danger-200 bg-danger-50 p-6">
        <p class="text-danger-700">Une erreur est survenue lors du chargement des tournois.</p>
      </div>
    </section>

    <section v-else-if="tournaments.length > 0">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Tournois récents</h2>
        <NuxtLink
          to="/tournaments"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Voir tout
        </NuxtLink>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="tournament in tournaments"
          :key="tournament.id"
          :to="`/tournaments/${tournament.id}`"
          class="group"
        >
          <div
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <h3
                  class="truncate text-lg font-semibold text-slate-900 group-hover:text-primary-600"
                >
                  {{ tournament.name }}
                </h3>
                <p
                  v-if="tournament.description"
                  class="mt-1 line-clamp-2 text-sm text-slate-500"
                >
                  {{ tournament.description }}
                </p>
              </div>
              <span
                :class="[
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  getStatusVariant(tournament.status || 'draft'),
                ]"
              >
                {{ getStatusLabel(tournament.status || "draft") }}
              </span>
            </div>
            <div class="mt-4 flex items-center gap-1 text-sm text-slate-500">
              <Icon name="lucide:calendar" class="h-4 w-4" />
              {{ formatDate(tournament.date) }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section v-else class="py-12 text-center">
      <Icon name="lucide:trophy" class="mx-auto h-16 w-16 text-slate-300" />
      <h3 class="mt-4 text-lg font-semibold text-slate-900">Aucun tournoi</h3>
      <p class="mt-2 text-slate-600">
        {{
          authStore.isAdmin
            ? "Commencez par créer votre premier tournoi de baby-foot !"
            : "Aucun tournoi disponible pour le moment."
        }}
      </p>
      <NuxtLink
        v-if="authStore.isAdmin"
        to="/tournaments/create"
        class="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        Créer un tournoi
      </NuxtLink>
    </section>
  </div>
</template>
