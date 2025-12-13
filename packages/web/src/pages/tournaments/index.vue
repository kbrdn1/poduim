<script setup lang="ts">
definePageMeta({
  title: "Tournois",
});

const api = useApi();
const authStore = useAuthStore();

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
  { value: "draft", label: "Brouillon" },
  { value: "registration", label: "Inscriptions" },
  { value: "in_progress", label: "En cours" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

type StatusVariant = "secondary" | "primary" | "warning" | "success" | "danger";

function getStatusVariant(status: string): StatusVariant {
  const variants: Record<string, StatusVariant> = {
    draft: "secondary",
    registration: "primary",
    in_progress: "warning",
    completed: "success",
    cancelled: "danger",
  };
  return variants[status] || "secondary";
}

function getStatusLabel(status: string): string {
  return statusOptions.find((opt) => opt.value === status)?.label || status;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function handleSearch() {
  page.value = 1;
  await refresh();
}

function goToPage(newPage: number) {
  page.value = newPage;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Tournois</h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ authStore.isAdmin ? 'Gérez vos tournois de baby-foot' : 'Consultez les tournois de baby-foot' }}
        </p>
      </div>
      <Button v-if="authStore.isAdmin" to="/tournaments/create">
        <Icon name="lucide:plus" class="h-4 w-4" />
        Nouveau tournoi
      </Button>
    </div>

    <!-- Filters -->
    <Card padding="sm">
      <div class="flex flex-col gap-4 sm:flex-row">
        <div class="flex-1">
          <Input
            v-model="search"
            placeholder="Rechercher un tournoi..."
            @keyup.enter="handleSearch"
          />
        </div>
        <select
          v-model="statusFilter"
          class="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <Button variant="outline" @click="handleSearch">
          Rechercher
        </Button>
      </div>
    </Card>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <Spinner size="lg" />
    </div>

    <!-- Error -->
    <Card v-else-if="error" class="border-danger-200 bg-danger-50">
      <p class="text-danger-700">
        Une erreur est survenue lors du chargement des tournois.
      </p>
      <Button variant="outline" size="sm" class="mt-4" @click="refresh">
        Réessayer
      </Button>
    </Card>

    <!-- Empty -->
    <EmptyState
      v-else-if="tournaments.length === 0"
      icon="lucide:trophy"
      title="Aucun tournoi"
      :description="authStore.isAdmin ? 'Commencez par créer votre premier tournoi de baby-foot !' : 'Aucun tournoi disponible pour le moment.'"
    >
      <template v-if="authStore.isAdmin" #action>
        <Button to="/tournaments/create">
          Créer un tournoi
        </Button>
      </template>
    </EmptyState>

    <!-- List -->
    <div v-else class="space-y-4">
      <NuxtLink
        v-for="tournament in tournaments"
        :key="tournament.id"
        :to="`/tournaments/${tournament.id}`"
        class="group block"
      >
        <Card hoverable>
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3">
                <h3 class="truncate text-lg font-semibold text-slate-900 group-hover:text-primary-600">
                  {{ tournament.name }}
                </h3>
                <Badge :variant="getStatusVariant(tournament.status || 'draft')">
                  {{ getStatusLabel(tournament.status || "draft") }}
                </Badge>
              </div>
              <p v-if="tournament.description" class="mt-1 line-clamp-1 text-sm text-slate-500">
                {{ tournament.description }}
              </p>
            </div>
            <div class="hidden text-right text-sm text-slate-500 sm:block">
              <div class="flex items-center gap-1">
                <Icon name="lucide:calendar" class="h-4 w-4" />
                {{ formatDate(tournament.date) }}
              </div>
            </div>
          </div>
        </Card>
      </NuxtLink>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.totalPages > 1"
        class="flex items-center justify-between pt-4"
      >
        <p class="text-sm text-slate-500">
          Page {{ pagination.page }} sur {{ pagination.totalPages }}
          ({{ pagination.total }} tournois)
        </p>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="page === 1"
            @click="goToPage(page - 1)"
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="page >= pagination.totalPages"
            @click="goToPage(page + 1)"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
