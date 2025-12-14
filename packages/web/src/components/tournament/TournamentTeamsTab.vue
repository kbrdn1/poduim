<script setup lang="ts">
import type { TeamResponse } from "@poduim/shared/types";

interface Props {
  teams: TeamResponse[];
  generatingMatches: boolean;
  isAdmin: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addTeam: [];
  deleteTeam: [team: TeamResponse];
  generateMatches: [];
}>();
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Équipes ({{ teams.length }})</h2>
      <div v-if="isAdmin" class="flex gap-2">
        <Button
          v-if="teams.length >= 2"
          variant="success"
          size="sm"
          :loading="generatingMatches"
          @click="emit('generateMatches')"
        >
          <Icon name="lucide:target" class="mr-1 h-4 w-4" />
          Générer les matchs
        </Button>
        <Button size="sm" @click="emit('addTeam')">
          <Icon name="lucide:plus" class="mr-1 h-4 w-4" />
          Ajouter équipe
        </Button>
      </div>
    </div>

    <EmptyState
      v-if="teams.length === 0"
      icon="lucide:users"
      title="Aucune équipe"
      :description="isAdmin ? 'Ajoutez des équipes pour commencer' : 'Aucune équipe inscrite pour le moment'"
    >
      <template v-if="isAdmin" #action>
        <Button @click="emit('addTeam')">
          <Icon name="lucide:plus" class="mr-1 h-4 w-4" />
          Ajouter une équipe
        </Button>
      </template>
    </EmptyState>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="team in teams"
        :key="team.id"
        class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary-200 hover:bg-white"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
            <Icon name="lucide:users" class="h-5 w-5 text-primary-600" />
          </div>
          <span class="font-medium text-slate-900">{{ team.name }}</span>
        </div>
        <button
          v-if="isAdmin"
          class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
          title="Supprimer"
          @click="emit('deleteTeam', team)"
        >
          <Icon name="lucide:trash-2" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
