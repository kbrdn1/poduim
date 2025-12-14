<script setup lang="ts">
definePageMeta({
  title: "Tournois",
});

const api = useApi();
const authStore = useAuthStore();
const { getStatusOptions } = useFormatters();

const page = ref(1);
const limit = ref(10);
const statusFilter = ref("");
const search = ref("");

const { data, pending, error, refresh } = await useAsyncData(
  "tournaments",
  () =>
    api.tournaments.list({
      page: page.value,
      limit: limit.value,
      status: statusFilter.value || undefined,
      search: search.value || undefined,
    }),
  {
    watch: [page, statusFilter],
  }
);

const tournaments = computed(() => data.value?.data || []);
const pagination = computed(() => data.value?.pagination);

const statusOptions = [
  { value: "", label: "Tous les statuts" },
  ...getStatusOptions(),
];

async function handleSearch() {
  page.value = 1;
  await refresh();
}

function goToPage(newPage: number) {
  page.value = newPage;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
    <div class="mx-auto max-w-6xl px-4">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/"
          class="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          Retour à l'accueil
        </NuxtLink>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Tournois</h1>
            <p class="mt-2 text-slate-600">
              {{ authStore.isAdmin ? 'Gérez et organisez vos tournois de baby-foot' : 'Découvrez et rejoignez les tournois de baby-foot' }}
            </p>
          </div>
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/tournaments/create"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Nouveau tournoi
          </NuxtLink>
        </div>
      </div>

      <!-- Filters -->
      <TournamentFilters
        v-model:search="search"
        v-model:status-filter="statusFilter"
        :status-options="statusOptions"
        class="mb-8"
        @search="handleSearch"
      />

      <!-- Loading -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" />
        <p class="mt-4 text-slate-500">Chargement des tournois...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-danger-200 bg-danger-50 p-8 text-center"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
          <Icon name="lucide:alert-circle" class="h-8 w-8 text-danger-600" />
        </div>
        <h3 class="text-lg font-semibold text-danger-700">Erreur de chargement</h3>
        <p class="mt-2 text-sm text-danger-600">
          Une erreur est survenue lors du chargement des tournois.
        </p>
        <button
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-danger-700"
          @click="() => refresh()"
        >
          <Icon name="lucide:refresh-cw" class="h-4 w-4" />
          Réessayer
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="tournaments.length === 0"
        class="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm"
      >
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Icon name="lucide:trophy" class="h-10 w-10 text-slate-400" />
        </div>
        <h3 class="text-xl font-semibold text-slate-900">Aucun tournoi</h3>
        <p class="mx-auto mt-3 max-w-sm text-slate-500">
          {{ authStore.isAdmin ? 'Commencez par créer votre premier tournoi de baby-foot !' : 'Aucun tournoi disponible pour le moment.' }}
        </p>
        <div v-if="authStore.isAdmin" class="mt-8">
          <NuxtLink
            to="/tournaments/create"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Créer un tournoi
          </NuxtLink>
        </div>
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <TournamentListItem
          v-for="tournament in tournaments"
          :key="tournament.id"
          :tournament="tournament"
        />

        <!-- Pagination -->
        <Pagination
          v-if="pagination"
          :pagination="pagination"
          :current-page="page"
          @go-to-page="goToPage"
        />
      </div>

      <!-- Bottom CTA for non-admin -->
      <div
        v-if="!authStore.isAdmin && tournaments.length > 0"
        class="mt-8 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center shadow-xl"
      >
        <h3 class="text-xl font-semibold text-white">Vous organisez des tournois ?</h3>
        <p class="mx-auto mt-2 max-w-md text-primary-100">
          Devenez organisateur et créez vos propres tournois de baby-foot en quelques clics.
        </p>
        <NuxtLink
          to="/register"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-primary-600 shadow-lg transition-all hover:bg-primary-50"
        >
          Devenir organisateur
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
