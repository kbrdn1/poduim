<script setup lang="ts">
import type { MatchResponse } from "@poduim/shared/types";

interface Props {
  matches: MatchResponse[];
  isAdmin: boolean;
  editingMatchId: string | null;
  editScores: { home: number; away: number };
  getTeamName: (id: string) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  startEdit: [match: MatchResponse];
  saveScore: [matchId: string];
  cancelEdit: [];
  "update:editScores": [scores: { home: number; away: number }];
}>();

const localEditScores = computed({
  get: () => props.editScores,
  set: (value) => emit("update:editScores", value),
});
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-slate-900">Matchs ({{ matches.length }})</h2>

    <EmptyState
      v-if="matches.length === 0"
      icon="lucide:target"
      title="Aucun match"
      description="Générez les matchs depuis l'onglet Équipes"
    />

    <div v-else class="space-y-3">
      <div
        v-for="match in matches"
        :key="match.id"
        class="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary-200"
      >
        <div class="flex items-center gap-4">
          <!-- Home Team -->
          <div class="flex-1 text-right">
            <span class="font-medium text-slate-900">{{ getTeamName(match.homeTeamId) }}</span>
          </div>

          <!-- Score -->
          <div class="flex items-center gap-2">
            <template v-if="isAdmin && editingMatchId === match.id">
              <input
                v-model.number="localEditScores.home"
                type="number"
                min="0"
                class="h-10 w-14 rounded-lg border border-slate-300 text-center text-lg font-bold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span class="text-slate-400">-</span>
              <input
                v-model.number="localEditScores.away"
                type="number"
                min="0"
                class="h-10 w-14 rounded-lg border border-slate-300 text-center text-lg font-bold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                class="rounded-lg bg-success-100 p-2 text-success-600 transition-colors hover:bg-success-200"
                @click="emit('saveScore', match.id)"
              >
                <Icon name="lucide:check" class="h-4 w-4" />
              </button>
              <button
                class="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
                @click="emit('cancelEdit')"
              >
                <Icon name="lucide:x" class="h-4 w-4" />
              </button>
            </template>
            <template v-else>
              <div
                :class="[
                  'flex min-w-[100px] items-center justify-center gap-3 rounded-xl bg-white px-4 py-2 font-mono text-xl font-bold shadow-sm',
                  isAdmin ? 'cursor-pointer transition-all hover:shadow-md' : ''
                ]"
                @click="isAdmin && emit('startEdit', match)"
              >
                <span :class="match.homeScore !== null && match.homeScore > (match.awayScore ?? 0) ? 'text-success-600' : 'text-slate-700'">
                  {{ match.homeScore ?? "-" }}
                </span>
                <span class="text-slate-300">:</span>
                <span :class="match.awayScore !== null && match.awayScore > (match.homeScore ?? 0) ? 'text-success-600' : 'text-slate-700'">
                  {{ match.awayScore ?? "-" }}
                </span>
              </div>
            </template>
          </div>

          <!-- Away Team -->
          <div class="flex-1">
            <span class="font-medium text-slate-900">{{ getTeamName(match.awayTeamId) }}</span>
          </div>

          <!-- Status -->
          <Badge
            :variant="match.status === 'completed' ? 'success' : 'secondary'"
            size="sm"
          >
            {{ match.status === "completed" ? "Terminé" : "En attente" }}
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>
