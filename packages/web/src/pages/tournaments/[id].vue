<script setup lang="ts">
import type { Team, Match } from "@poduim/shared/types";
import type { TeamRanking } from "~/composables/useApi";

const route = useRoute();
const router = useRouter();
const api = useApi();
const authStore = useAuthStore();

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

const tournament = computed(() => tournamentData.value?.data);
const teams = computed(() => tournament.value?.teams || []);
const matches = computed(() => tournament.value?.matches || []);
const ranking = computed(() => tournament.value?.ranking || []);

// UI State
const activeTab = ref<"teams" | "matches" | "ranking">("teams");
const showAddTeamModal = ref(false);
const newTeamName = ref("");
const addingTeam = ref(false);
const generatingMatches = ref(false);
const deletingTournament = ref(false);

// Match score editing
const editingMatchId = ref<string | null>(null);
const editScores = reactive({ home: 0, away: 0 });

// Status helpers
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
  const labels: Record<string, string> = {
    draft: "Brouillon",
    registration: "Inscriptions",
    in_progress: "En cours",
    completed: "Terminé",
    cancelled: "Annulé",
  };
  return labels[status] || status;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Get team name by ID
function getTeamName(teamId: string): string {
  return teams.value.find((t) => t.id === teamId)?.name || "Équipe inconnue";
}

// Add team
async function addTeam() {
  if (!newTeamName.value.trim()) return;

  addingTeam.value = true;
  try {
    await api.teams.create({
      name: newTeamName.value.trim(),
      tournamentId,
    });
    newTeamName.value = "";
    showAddTeamModal.value = false;
    await refresh();
  } catch (e: unknown) {
    const error = e as { data?: { error?: { message?: string } } };
    alert(error?.data?.error?.message || "Erreur lors de l'ajout de l'équipe");
  } finally {
    addingTeam.value = false;
  }
}

// Delete team
async function deleteTeam(team: Team) {
  if (!confirm(`Supprimer l'équipe "${team.name}" ?`)) return;

  try {
    await api.teams.delete(team.id);
    await refresh();
  } catch (e: unknown) {
    const error = e as { data?: { error?: { message?: string } } };
    alert(error?.data?.error?.message || "Erreur lors de la suppression");
  }
}

// Generate matches
async function generateMatches() {
  if (teams.value.length < 2) {
    alert("Il faut au moins 2 équipes pour générer les matchs");
    return;
  }

  if (matches.value.length > 0) {
    if (!confirm("Des matchs existent déjà. Voulez-vous les supprimer et en générer de nouveaux ?")) {
      return;
    }
    await api.matches.deleteAll(tournamentId);
  }

  generatingMatches.value = true;
  try {
    await api.matches.generate(tournamentId);
    await refresh();
    activeTab.value = "matches";
  } catch (e: unknown) {
    const error = e as { data?: { error?: { message?: string } } };
    alert(error?.data?.error?.message || "Erreur lors de la génération");
  } finally {
    generatingMatches.value = false;
  }
}

// Edit match score
function startEditScore(match: Match) {
  editingMatchId.value = match.id;
  editScores.home = match.homeScore ?? 0;
  editScores.away = match.awayScore ?? 0;
}

function cancelEditScore() {
  editingMatchId.value = null;
}

async function saveScore(matchId: string) {
  try {
    await api.matches.updateScore(matchId, {
      homeScore: editScores.home,
      awayScore: editScores.away,
    });
    editingMatchId.value = null;
    await refresh();
  } catch (e: unknown) {
    const error = e as { data?: { error?: { message?: string } } };
    alert(error?.data?.error?.message || "Erreur lors de la mise à jour du score");
  }
}

// Delete tournament
async function deleteTournament() {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce tournoi et toutes ses données ?")) {
    return;
  }

  deletingTournament.value = true;
  try {
    await api.tournaments.delete(tournamentId);
    await router.push("/tournaments");
  } catch (e: unknown) {
    const error = e as { data?: { error?: { message?: string } } };
    alert(error?.data?.error?.message || "Erreur lors de la suppression");
  } finally {
    deletingTournament.value = false;
  }
}

// Update tournament status
async function updateStatus(status: string) {
  try {
    await api.tournaments.update(tournamentId, { status });
    await refresh();
  } catch (e: unknown) {
    const error = e as { data?: { error?: { message?: string } } };
    alert(error?.data?.error?.message || "Erreur lors de la mise à jour");
  }
}

</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <Spinner size="lg" />
    </div>

    <!-- Error -->
    <Card v-else-if="error || !tournament" class="border-danger-200 bg-danger-50">
      <p class="text-danger-700">
        Tournoi non trouvé ou erreur de chargement.
      </p>
      <Button variant="outline" size="sm" class="mt-4" to="/tournaments">
        Retour aux tournois
      </Button>
    </Card>

    <!-- Tournament Details -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <NuxtLink
            to="/tournaments"
            class="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            ← Retour aux tournois
          </NuxtLink>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-900">
              {{ tournament.name }}
            </h1>
            <Badge :variant="getStatusVariant(tournament.status || 'draft')" size="lg">
              {{ getStatusLabel(tournament.status || 'draft') }}
            </Badge>
          </div>
          <p v-if="tournament.description" class="mt-2 text-slate-500">
            {{ tournament.description }}
          </p>
          <p class="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <Icon name="lucide:calendar" class="h-4 w-4" />
            {{ formatDate(tournament.date) }}
          </p>
        </div>

        <div v-if="authStore.isAdmin" class="flex flex-wrap gap-2">
          <Button
            v-if="tournament.status === 'draft'"
            variant="outline"
            size="sm"
            @click="updateStatus('registration')"
          >
            Ouvrir inscriptions
          </Button>
          <Button
            v-if="tournament.status === 'registration'"
            variant="outline"
            size="sm"
            @click="updateStatus('in_progress')"
          >
            Démarrer
          </Button>
          <Button variant="danger" size="sm" :loading="deletingTournament" @click="deleteTournament">
            Supprimer
          </Button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <Card class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ teams.length }}
          </div>
          <div class="text-sm text-slate-500">Équipes</div>
        </Card>
        <Card class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ matches.length }}
          </div>
          <div class="text-sm text-slate-500">Matchs</div>
        </Card>
        <Card class="text-center">
          <div class="text-3xl font-bold text-success-600">
            {{ matches.filter((m) => m.status === "completed").length }}
          </div>
          <div class="text-sm text-slate-500">Terminés</div>
        </Card>
      </div>

      <!-- Tabs -->
      <div class="border-b border-slate-200">
        <nav class="-mb-px flex gap-6">
          <button
            v-for="tab in ['teams', 'matches', 'ranking'] as const"
            :key="tab"
            :class="[
              'flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
            ]"
            @click="activeTab = tab"
          >
            <Icon
              :name="tab === 'teams' ? 'lucide:users' : tab === 'matches' ? 'lucide:goal' : 'lucide:bar-chart-2'"
              class="h-4 w-4"
            />
            {{ tab === "teams" ? "Équipes" : tab === "matches" ? "Matchs" : "Classement" }}
          </button>
        </nav>
      </div>

      <!-- Teams Tab -->
      <div v-if="activeTab === 'teams'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Équipes ({{ teams.length }})</h2>
          <div v-if="authStore.isAdmin" class="flex gap-2">
            <Button
              v-if="teams.length >= 2"
              variant="success"
              size="sm"
              :loading="generatingMatches"
              @click="generateMatches"
            >
              <Icon name="lucide:target" class="mr-1 h-4 w-4" />
              Générer les matchs
            </Button>
            <Button size="sm" @click="showAddTeamModal = true">
              + Ajouter équipe
            </Button>
          </div>
        </div>

        <EmptyState
          v-if="teams.length === 0"
          icon="lucide:users"
          title="Aucune équipe"
          :description="authStore.isAdmin ? 'Ajoutez des équipes pour commencer' : 'Aucune équipe inscrite pour le moment'"
        >
          <template v-if="authStore.isAdmin" #action>
            <Button @click="showAddTeamModal = true">
              Ajouter une équipe
            </Button>
          </template>
        </EmptyState>

        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card v-for="team in teams" :key="team.id" class="flex items-center justify-between">
            <span class="font-medium">{{ team.name }}</span>
            <button
              v-if="authStore.isAdmin"
              class="text-slate-400 hover:text-danger-600"
              title="Supprimer"
              @click="deleteTeam(team)"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </button>
          </Card>
        </div>
      </div>

      <!-- Matches Tab -->
      <div v-if="activeTab === 'matches'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Matchs ({{ matches.length }})</h2>
        </div>

        <EmptyState
          v-if="matches.length === 0"
          icon="lucide:goal"
          title="Aucun match"
          description="Générez les matchs depuis l'onglet Équipes"
        />

        <div v-else class="space-y-3">
          <Card v-for="match in matches" :key="match.id" padding="sm">
            <div class="flex items-center gap-4">
              <!-- Home Team -->
              <div class="flex-1 text-right">
                <span class="font-medium">{{ getTeamName(match.homeTeamId) }}</span>
              </div>

              <!-- Score -->
              <div class="flex items-center gap-2">
                <template v-if="authStore.isAdmin && editingMatchId === match.id">
                  <input
                    v-model.number="editScores.home"
                    type="number"
                    min="0"
                    class="h-10 w-14 rounded border border-slate-300 text-center"
                  />
                  <span class="text-slate-400">-</span>
                  <input
                    v-model.number="editScores.away"
                    type="number"
                    min="0"
                    class="h-10 w-14 rounded border border-slate-300 text-center"
                  />
                  <Button size="sm" @click="saveScore(match.id)">✓</Button>
                  <Button variant="ghost" size="sm" @click="cancelEditScore">✕</Button>
                </template>
                <template v-else>
                  <div
                    :class="[
                      'flex min-w-[80px] items-center justify-center gap-2 rounded bg-slate-100 px-3 py-2 font-mono text-lg font-bold',
                      authStore.isAdmin ? 'cursor-pointer hover:bg-slate-200' : ''
                    ]"
                    @click="authStore.isAdmin && startEditScore(match)"
                  >
                    <span>{{ match.homeScore ?? "-" }}</span>
                    <span class="text-slate-400">:</span>
                    <span>{{ match.awayScore ?? "-" }}</span>
                  </div>
                </template>
              </div>

              <!-- Away Team -->
              <div class="flex-1">
                <span class="font-medium">{{ getTeamName(match.awayTeamId) }}</span>
              </div>

              <!-- Status -->
              <Badge
                :variant="match.status === 'completed' ? 'success' : 'secondary'"
                size="sm"
              >
                {{ match.status === "completed" ? "Terminé" : "En attente" }}
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      <!-- Ranking Tab -->
      <div v-if="activeTab === 'ranking'" class="space-y-4">
        <h2 class="text-lg font-semibold">Classement</h2>

        <EmptyState
          v-if="ranking.length === 0"
          icon="lucide:bar-chart-2"
          title="Pas encore de classement"
          description="Le classement apparaîtra après les premiers matchs"
        />

        <Card v-else padding="none">
          <div class="overflow-x-auto">
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
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="(row, index) in ranking"
                  :key="row.teamId"
                  :class="index < 3 ? 'bg-success-50/50' : ''"
                >
                  <td class="px-4 py-3 font-bold">
                    {{ index + 1 }}
                  </td>
                  <td class="px-4 py-3 font-medium">
                    {{ row.teamName }}
                  </td>
                  <td class="px-4 py-3 text-center">{{ row.played }}</td>
                  <td class="px-4 py-3 text-center text-success-600">{{ row.won }}</td>
                  <td class="px-4 py-3 text-center text-slate-500">{{ row.drawn }}</td>
                  <td class="px-4 py-3 text-center text-danger-600">{{ row.lost }}</td>
                  <td class="px-4 py-3 text-center">{{ row.goalsFor }}</td>
                  <td class="px-4 py-3 text-center">{{ row.goalsAgainst }}</td>
                  <td class="px-4 py-3 text-center font-medium" :class="row.goalDifference > 0 ? 'text-success-600' : row.goalDifference < 0 ? 'text-danger-600' : ''">
                    {{ row.goalDifference > 0 ? "+" : "" }}{{ row.goalDifference }}
                  </td>
                  <td class="px-4 py-3 text-center font-bold text-primary-600">
                    {{ row.points }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>

    <!-- Add Team Modal -->
    <Teleport to="body">
      <div
        v-if="showAddTeamModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showAddTeamModal = false"
      >
        <Card class="w-full max-w-md animate-slide-up">
          <h3 class="mb-4 text-lg font-semibold">Ajouter une équipe</h3>
          <form @submit.prevent="addTeam">
            <FormField label="Nom de l'équipe" html-for="teamName" required>
              <Input
                id="teamName"
                v-model="newTeamName"
                placeholder="Ex: Les Champions"
              />
            </FormField>
            <div class="mt-6 flex justify-end gap-3">
              <Button variant="outline" type="button" @click="showAddTeamModal = false">
                Annuler
              </Button>
              <Button type="submit" :loading="addingTeam" :disabled="!newTeamName.trim()">
                Ajouter
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Teleport>
  </div>
</template>
