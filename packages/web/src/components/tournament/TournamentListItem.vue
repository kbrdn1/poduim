<script setup lang="ts">
import type { TournamentResponse } from "@poduim/shared/types";

interface Props {
  tournament: TournamentResponse;
}

defineProps<Props>();

const { formatDate, getStatusVariant, getStatusLabel } = useFormatters();

function getStatusBadgeClass(variant: string): string {
  const classes: Record<string, string> = {
    success: "bg-success-100 text-success-700",
    warning: "bg-warning-100 text-warning-700",
    primary: "bg-primary-100 text-primary-700",
    danger: "bg-danger-100 text-danger-700",
    secondary: "bg-slate-100 text-slate-700",
  };
  return classes[variant] ?? "bg-slate-100 text-slate-700";
}
</script>

<template>
  <NuxtLink
    :to="`/tournaments/${tournament.id}`"
    class="group block"
  >
    <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
      <div class="flex items-center gap-5">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-100 transition-colors group-hover:bg-primary-200">
          <Icon name="lucide:trophy" class="h-7 w-7 text-primary-600" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-3">
            <h3 class="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
              {{ tournament.name }}
            </h3>
            <span
              :class="[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                getStatusBadgeClass(getStatusVariant(tournament.status || 'draft')),
              ]"
            >
              {{ getStatusLabel(tournament.status || "draft") }}
            </span>
          </div>
          <p v-if="tournament.description" class="mt-1 line-clamp-1 text-sm text-slate-500">
            {{ tournament.description }}
          </p>
          <div class="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <Icon name="lucide:calendar" class="h-4 w-4" />
            {{ formatDate(tournament.date) }}
          </div>
        </div>
        <div class="hidden shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
          <span class="text-sm text-primary-600">Voir le tournoi</span>
          <Icon name="lucide:arrow-right" class="h-4 w-4 text-primary-600" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
