<script setup lang="ts">
import type { TeamResponse, MatchResponse, TournamentStatus } from "@poduim/shared/types";

const route = useRoute();
const router = useRouter();
const api = useApi();
const authStore = useAuthStore();
const tournamentStore = useTournamentStore();

const tournamentId = route.params.id as string;

// Fetch tournament details
const {
  data: tournamentData,
  pending,
  error,
  refresh,
} = await useAsyncData(`tournament-${tournamentId}`, () =>
  api.tournaments.getDetails(tournamentId)
);

// Sync tournament data with store
watch(
  tournamentData,
  (data) => {
    if (data?.data) {
      tournamentStore.setTournament(data.data);
    }
  },
  { immediate: true }
);

// Clean up store on unmount
onUnmounted(() => {
  tournamentStore.resetState();
});

const tournament = computed(() => tournamentData.value?.data);

// Store getters
const { teams, matches, ranking, activeTab, showAddTeamModal, newTeamName, addingTeam, generatingMatches, deletingTournament, editingMatchId, editScores } = storeToRefs(tournamentStore);

// Alert modal state
const showAlertModal = ref(false);
const alertMessage = ref("");

function showError(message: string) {
  alertMessage.value = message;
  showAlertModal.value = true;
}

// Confirm modals state
type ConfirmAction = "deleteTeam" | "regenerateMatches" | "deleteTournament";
const showConfirmModal = ref(false);
const confirmAction = ref<ConfirmAction | null>(null);
const confirmTitle = ref("");
const confirmMessage = ref("");
const teamToDelete = ref<TeamResponse | null>(null);
const isConfirmLoading = ref(false);

function openConfirm(action: ConfirmAction, data?: { team?: TeamResponse }) {
  confirmAction.value = action;

  switch (action) {
    case "deleteTeam":
      teamToDelete.value = data?.team || null;
      confirmTitle.value = "Supprimer l'équipe";
      confirmMessage.value = `Êtes-vous sûr de vouloir supprimer l'équipe "${data?.team?.name}" ?`;
      break;
    case "regenerateMatches":
      confirmTitle.value = "Régénérer les matchs";
      confirmMessage.value = "Des matchs existent déjà. Voulez-vous les supprimer et en générer de nouveaux ?";
      break;
    case "deleteTournament":
      confirmTitle.value = "Supprimer le tournoi";
      confirmMessage.value = "Êtes-vous sûr de vouloir supprimer ce tournoi et toutes ses données ?";
      break;
  }

  showConfirmModal.value = true;
}

function closeConfirm() {
  showConfirmModal.value = false;
  confirmAction.value = null;
  teamToDelete.value = null;
}

async function handleConfirm() {
  isConfirmLoading.value = true;

  try {
    switch (confirmAction.value) {
      case "deleteTeam":
        if (teamToDelete.value) {
          await tournamentStore.deleteTeam(teamToDelete.value, refresh);
        }
        break;
      case "regenerateMatches":
        await tournamentStore.generateMatches(tournamentId, refresh, true);
        break;
      case "deleteTournament":
        await tournamentStore.deleteTournament(tournamentId, router);
        break;
    }
    closeConfirm();
  } catch (e) {
    closeConfirm();
    showError((e as Error).message);
  } finally {
    isConfirmLoading.value = false;
  }
}

// Actions with error handling
async function handleAddTeam() {
  try {
    await tournamentStore.addTeam(tournamentId, refresh);
  } catch (e) {
    showError((e as Error).message);
  }
}

function handleDeleteTeam(team: TeamResponse) {
  openConfirm("deleteTeam", { team });
}

async function handleGenerateMatches() {
  try {
    await tournamentStore.generateMatches(tournamentId, refresh);
  } catch (e) {
    const message = (e as Error).message;
    if (message === "MATCHES_EXIST") {
      openConfirm("regenerateMatches");
    } else {
      showError(message);
    }
  }
}

async function handleSaveScore(matchId: string) {
  try {
    await tournamentStore.saveScore(matchId, refresh);
  } catch (e) {
    showError((e as Error).message);
  }
}

function handleDeleteTournament() {
  openConfirm("deleteTournament");
}

async function handleUpdateStatus(status: TournamentStatus) {
  try {
    await tournamentStore.updateStatus(tournamentId, status, refresh);
  } catch (e) {
    showError((e as Error).message);
  }
}

function handleStartEditScore(match: MatchResponse) {
  tournamentStore.startEditScore(match);
}

function handleUpdateEditScores(scores: { home: number; away: number }) {
  editScores.value = scores;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
    <div class="mx-auto max-w-5xl px-4">
      <!-- Loading -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" />
        <p class="mt-4 text-slate-500">Chargement du tournoi...</p>
      </div>

      <!-- Error -->
      <Card v-else-if="error || !tournament" class="border-danger-200 bg-danger-50 p-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
          <Icon name="lucide:alert-circle" class="h-8 w-8 text-danger-600" />
        </div>
        <h3 class="text-lg font-semibold text-danger-700">Tournoi non trouvé</h3>
        <p class="mt-2 text-sm text-danger-600">
          Ce tournoi n'existe pas ou a été supprimé.
        </p>
        <NuxtLink
          to="/tournaments"
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-danger-700"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          Retour aux tournois
        </NuxtLink>
      </Card>

      <!-- Tournament Details -->
      <div v-else class="space-y-6">
        <TournamentHeader
          :tournament="tournament"
          :is-admin="authStore.isAdmin"
          :deleting-tournament="deletingTournament"
          @update-status="handleUpdateStatus"
          @delete="handleDeleteTournament"
        />

        <TournamentStats :teams="teams" :matches="matches" />

        <!-- Tabs -->
        <div class="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6">
            <nav class="-mb-px flex gap-8">
              <button
                v-for="tab in ['teams', 'matches', 'ranking'] as const"
                :key="tab"
                :class="[
                  'flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                ]"
                @click="tournamentStore.setActiveTab(tab)"
              >
                <Icon
                  :name="tab === 'teams' ? 'lucide:users' : tab === 'matches' ? 'lucide:target' : 'lucide:bar-chart-2'"
                  class="h-4 w-4"
                />
                {{ tab === "teams" ? "Équipes" : tab === "matches" ? "Matchs" : "Classement" }}
              </button>
            </nav>
          </div>

          <div class="p-6">
            <TournamentTeamsTab
              v-if="activeTab === 'teams'"
              :teams="teams"
              :generating-matches="generatingMatches"
              :is-admin="authStore.isAdmin"
              @add-team="tournamentStore.openAddTeamModal()"
              @delete-team="handleDeleteTeam"
              @generate-matches="handleGenerateMatches"
            />

            <TournamentMatchesTab
              v-if="activeTab === 'matches'"
              :matches="matches"
              :is-admin="authStore.isAdmin"
              :editing-match-id="editingMatchId"
              :edit-scores="editScores"
              :get-team-name="tournamentStore.getTeamName"
              @start-edit="handleStartEditScore"
              @save-score="handleSaveScore"
              @cancel-edit="tournamentStore.cancelEditScore()"
              @update:edit-scores="handleUpdateEditScores"
            />

            <TournamentRankingTab
              v-if="activeTab === 'ranking'"
              :ranking="ranking"
            />
          </div>
        </div>
      </div>

      <AddTeamModal
        :show="showAddTeamModal"
        :team-name="newTeamName"
        :loading="addingTeam"
        @close="tournamentStore.closeAddTeamModal()"
        @submit="handleAddTeam"
        @update:team-name="(v) => newTeamName = v"
      />

      <AlertModal
        :show="showAlertModal"
        :message="alertMessage"
        type="error"
        @close="showAlertModal = false"
      />

      <ConfirmModal
        :show="showConfirmModal"
        :title="confirmTitle"
        :message="confirmMessage"
        type="danger"
        confirm-text="Confirmer"
        :loading="isConfirmLoading"
        @confirm="handleConfirm"
        @cancel="closeConfirm"
      />
    </div>
  </div>
</template>
