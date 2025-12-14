<script setup lang="ts">
import type { TournamentResponse, TournamentStatus } from "@poduim/shared/types";

interface Props {
  tournament: TournamentResponse;
  isAdmin: boolean;
  deletingTournament: boolean;
}

defineProps<Props>();

const { formatDate, getStatusVariant, getStatusLabel } = useFormatters();

const emit = defineEmits<{
  updateStatus: [status: TournamentStatus];
  delete: [];
}>();

function getStatusBadgeClass(variant: string) {
  const classes: Record<string, string> = {
    success: "bg-success-100 text-success-700",
    warning: "bg-warning-100 text-warning-700",
    primary: "bg-primary-100 text-primary-700",
    danger: "bg-danger-100 text-danger-700",
    secondary: "bg-slate-100 text-slate-700",
  };
  return classes[variant] || classes.secondary;
}
</script>

<template>
  <div>
    <NuxtLink
      to="/tournaments"
      class="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
    >
      <Icon name="lucide:arrow-left" class="h-4 w-4" />
      Retour aux tournois
    </NuxtLink>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-bold text-slate-900">
            {{ tournament.name }}
          </h1>
          <span
            :class="[
              'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium',
              getStatusBadgeClass(getStatusVariant(tournament.status || 'draft')),
            ]"
          >
            {{ getStatusLabel(tournament.status || "draft") }}
          </span>
        </div>
        <p v-if="tournament.description" class="mt-3 text-slate-600">
          {{ tournament.description }}
        </p>
        <p class="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Icon name="lucide:calendar" class="h-4 w-4" />
          {{ formatDate(tournament.date) }}
        </p>
      </div>

      <div v-if="isAdmin" class="flex flex-wrap gap-2">
        <Button
          v-if="tournament.status === 'draft'"
          variant="outline"
          size="sm"
          @click="emit('updateStatus', 'registration')"
        >
          <Icon name="lucide:user-plus" class="mr-1 h-4 w-4" />
          Ouvrir inscriptions
        </Button>
        <Button
          v-if="tournament.status === 'registration'"
          variant="success"
          size="sm"
          @click="emit('updateStatus', 'in_progress')"
        >
          <Icon name="lucide:play" class="mr-1 h-4 w-4" />
          Démarrer
        </Button>
        <Button
          variant="danger"
          size="sm"
          :loading="deletingTournament"
          @click="emit('delete')"
        >
          <Icon name="lucide:trash-2" class="mr-1 h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  </div>
</template>
