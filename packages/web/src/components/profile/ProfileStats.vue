<script setup lang="ts">
import type { UserStats } from "@poduim/shared/types";

interface Props {
  stats: UserStats | null | undefined;
  pending: boolean;
}

defineProps<Props>();
</script>

<template>
  <!-- Loading -->
  <div v-if="pending" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
    <div v-for="i in 4" :key="i" class="animate-pulse rounded-2xl border border-slate-100 bg-white p-6">
      <div class="mb-3 h-12 w-12 rounded-xl bg-slate-200"></div>
      <div class="h-8 w-16 rounded bg-slate-200"></div>
      <div class="mt-2 h-4 w-24 rounded bg-slate-200"></div>
    </div>
  </div>

  <!-- Stats -->
  <div v-else-if="stats" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
    <div class="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 transition-colors group-hover:bg-primary-200">
        <Icon name="lucide:trophy" class="h-6 w-6 text-primary-600" />
      </div>
      <div class="text-3xl font-bold text-slate-900">{{ stats.subscriptions.total }}</div>
      <div class="mt-1 text-sm text-slate-500">Tournois suivis</div>
    </div>
    <div class="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-success-200 hover:shadow-md">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-success-100 transition-colors group-hover:bg-success-200">
        <Icon name="lucide:play" class="h-6 w-6 text-success-600" />
      </div>
      <div class="text-3xl font-bold text-slate-900">{{ stats.subscriptions.byStatus.in_progress }}</div>
      <div class="mt-1 text-sm text-slate-500">En cours</div>
    </div>
    <div class="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-warning-200 hover:shadow-md">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100 transition-colors group-hover:bg-warning-200">
        <Icon name="lucide:clock" class="h-6 w-6 text-warning-600" />
      </div>
      <div class="text-3xl font-bold text-slate-900">{{ stats.matches.upcoming }}</div>
      <div class="mt-1 text-sm text-slate-500">Matchs à venir</div>
    </div>
    <div class="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-slate-200">
        <Icon name="lucide:check" class="h-6 w-6 text-slate-600" />
      </div>
      <div class="text-3xl font-bold text-slate-900">{{ stats.matches.completed }}</div>
      <div class="mt-1 text-sm text-slate-500">Matchs terminés</div>
    </div>
  </div>
</template>
