<script setup lang="ts">
import type { TournamentResponse } from "@poduim/shared/types";
import type { NuxtError } from "#app";

interface Props {
  tournaments: TournamentResponse[];
  pending: boolean;
  error: NuxtError<unknown> | null | undefined;
}

defineProps<Props>();

const authStore = useAuthStore();
const { formatDate, getStatusVariant, getStatusLabel } = useFormatters();

function getStatusClass(status: string): string {
  const variants: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    registration: "bg-primary-100 text-primary-700",
    in_progress: "bg-warning-100 text-warning-700",
    completed: "bg-success-100 text-success-700",
    cancelled: "bg-danger-100 text-danger-700",
  };
  return variants[status] || "bg-slate-100 text-slate-700";
}
</script>

<template>
  <!-- Loading -->
  <section v-if="pending" class="py-12">
    <div class="flex justify-center">
      <Spinner size="lg" />
    </div>
  </section>

  <!-- Error -->
  <section v-else-if="error">
    <div class="rounded-2xl border border-danger-200 bg-danger-50 p-6">
      <p class="text-danger-700">Une erreur est survenue lors du chargement des tournois.</p>
    </div>
  </section>

  <!-- Tournaments List -->
  <section v-else-if="tournaments.length > 0">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold text-slate-900">Tournois récents</h2>
        <p class="mt-2 text-slate-600">Découvrez les derniers tournois créés</p>
      </div>
      <NuxtLink
        to="/tournaments"
        class="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
      >
        Voir tout
        <Icon name="lucide:arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <div class="grid gap-6 sm:grid-cols-2">
      <NuxtLink
        v-for="tournament in tournaments"
        :key="tournament.id"
        :to="`/tournaments/${tournament.id}`"
        class="group"
      >
        <div
          class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10"
        >
          <div class="flex flex-1 items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <h3
                class="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-600"
              >
                {{ tournament.name }}
              </h3>
              <p class="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">
                {{ tournament.description || "Aucune description" }}
              </p>
            </div>
            <span
              :class="[
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
                getStatusClass(tournament.status || 'draft'),
              ]"
            >
              {{ getStatusLabel(tournament.status || "draft") }}
            </span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <Icon name="lucide:calendar" class="h-4 w-4" />
              {{ formatDate(tournament.date) }}
            </div>
            <div class="flex items-center gap-1 text-sm font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
              Voir le tournoi
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>

  <!-- Empty State -->
  <section v-else class="py-16 text-center">
    <div class="mx-auto max-w-md">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <Icon name="lucide:trophy" class="h-10 w-10 text-slate-400" />
      </div>
      <h3 class="text-xl font-semibold text-slate-900">Aucun tournoi</h3>
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
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700"
      >
        Créer un tournoi
        <Icon name="lucide:arrow-right" class="h-4 w-4" />
      </NuxtLink>
    </div>
  </section>
</template>
