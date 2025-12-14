<script setup lang="ts">
import type { TeamResponse, MatchResponse } from "@poduim/shared/types";

interface Props {
  teams: TeamResponse[];
  matches: MatchResponse[];
}

defineProps<Props>();

const completedMatches = computed(() => {
  return (matches: MatchResponse[]) => matches.filter((m) => m.status === "completed").length;
});
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <Card class="p-6 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
        <Icon name="lucide:users" class="h-6 w-6 text-primary-600" />
      </div>
      <div class="text-3xl font-bold text-slate-900">{{ teams.length }}</div>
      <div class="mt-1 text-sm text-slate-500">Équipes</div>
    </Card>
    <Card class="p-6 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100">
        <Icon name="lucide:target" class="h-6 w-6 text-warning-600" />
      </div>
      <div class="text-3xl font-bold text-slate-900">{{ matches.length }}</div>
      <div class="mt-1 text-sm text-slate-500">Matchs</div>
    </Card>
    <Card class="p-6 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-success-100">
        <Icon name="lucide:check-circle" class="h-6 w-6 text-success-600" />
      </div>
      <div class="text-3xl font-bold text-slate-900">
        {{ completedMatches(matches) }}
      </div>
      <div class="mt-1 text-sm text-slate-500">Terminés</div>
    </Card>
  </div>
</template>
