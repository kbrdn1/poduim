<script setup lang="ts">
import type { TeamRanking } from "@poduim/shared/types";

interface Props {
  ranking: TeamRanking[];
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-slate-900">Classement</h2>

    <EmptyState
      v-if="ranking.length === 0"
      icon="lucide:bar-chart-2"
      title="Pas encore de classement"
      description="Le classement apparaîtra après les premiers matchs"
    />

    <div v-else class="overflow-hidden rounded-xl border border-slate-100">
      <table class="w-full text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-slate-600">#</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">Équipe</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">J</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">G</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">N</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">P</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">BP</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">BC</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">Diff</th>
            <th class="px-4 py-3 text-center font-medium text-slate-600">Pts</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="(row, index) in ranking"
            :key="row.teamId"
            :class="index < 3 ? 'bg-success-50/50' : ''"
          >
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-slate-200 text-slate-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-600'
                ]"
              >
                {{ index + 1 }}
              </span>
            </td>
            <td class="px-4 py-3 font-medium text-slate-900">
              {{ row.teamName }}
            </td>
            <td class="px-4 py-3 text-center text-slate-600">{{ row.played }}</td>
            <td class="px-4 py-3 text-center font-medium text-success-600">{{ row.won }}</td>
            <td class="px-4 py-3 text-center text-slate-500">{{ row.drawn }}</td>
            <td class="px-4 py-3 text-center font-medium text-danger-600">{{ row.lost }}</td>
            <td class="px-4 py-3 text-center text-slate-600">{{ row.goalsFor }}</td>
            <td class="px-4 py-3 text-center text-slate-600">{{ row.goalsAgainst }}</td>
            <td class="px-4 py-3 text-center font-medium" :class="row.goalDifference > 0 ? 'text-success-600' : row.goalDifference < 0 ? 'text-danger-600' : 'text-slate-500'">
              {{ row.goalDifference > 0 ? "+" : "" }}{{ row.goalDifference }}
            </td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 font-bold text-primary-600">
                {{ row.points }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
