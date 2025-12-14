import { defineStore } from "pinia";
import type { TeamResponse, MatchResponse, FetchError, TournamentWithDetailsResponse, TournamentStatus } from "@poduim/shared/types";

interface TournamentState {
  tournament: TournamentWithDetailsResponse | null;
  loading: boolean;
  error: string | null;
  // UI State
  activeTab: "teams" | "matches" | "ranking";
  showAddTeamModal: boolean;
  newTeamName: string;
  // Loading states
  addingTeam: boolean;
  generatingMatches: boolean;
  deletingTournament: boolean;
  // Match editing
  editingMatchId: string | null;
  editScores: { home: number; away: number };
}

export const useTournamentStore = defineStore("tournament", {
  state: (): TournamentState => ({
    tournament: null,
    loading: false,
    error: null,
    // UI State
    activeTab: "teams",
    showAddTeamModal: false,
    newTeamName: "",
    // Loading states
    addingTeam: false,
    generatingMatches: false,
    deletingTournament: false,
    // Match editing
    editingMatchId: null,
    editScores: { home: 0, away: 0 },
  }),

  getters: {
    teams: (state) => state.tournament?.teams || [],
    matches: (state) => state.tournament?.matches || [],
    ranking: (state) => state.tournament?.ranking || [],
    completedMatches: (state) =>
      state.tournament?.matches.filter((m) => m.status === "completed") || [],
    hasEnoughTeams: (state) => (state.tournament?.teams.length || 0) >= 2,
    hasMatches: (state) => (state.tournament?.matches.length || 0) > 0,
  },

  actions: {
    setTournament(tournament: TournamentWithDetailsResponse | null) {
      this.tournament = tournament;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    setActiveTab(tab: "teams" | "matches" | "ranking") {
      this.activeTab = tab;
    },

    openAddTeamModal() {
      this.showAddTeamModal = true;
      this.newTeamName = "";
    },

    closeAddTeamModal() {
      this.showAddTeamModal = false;
      this.newTeamName = "";
    },

    getTeamName(teamId: string): string {
      return this.teams.find((t) => t.id === teamId)?.name || "Équipe inconnue";
    },

    startEditScore(match: MatchResponse) {
      this.editingMatchId = match.id;
      this.editScores.home = match.homeScore ?? 0;
      this.editScores.away = match.awayScore ?? 0;
    },

    cancelEditScore() {
      this.editingMatchId = null;
      this.editScores = { home: 0, away: 0 };
    },

    resetState() {
      this.tournament = null;
      this.loading = false;
      this.error = null;
      this.activeTab = "teams";
      this.showAddTeamModal = false;
      this.newTeamName = "";
      this.addingTeam = false;
      this.generatingMatches = false;
      this.deletingTournament = false;
      this.editingMatchId = null;
      this.editScores = { home: 0, away: 0 };
    },

    // API Actions
    async addTeam(tournamentId: string, refresh: () => Promise<void>) {
      if (!this.newTeamName.trim()) return;

      const api = useApi();
      this.addingTeam = true;

      try {
        await api.teams.create({
          name: this.newTeamName.trim(),
          tournamentId,
        });
        this.closeAddTeamModal();
        await refresh();
      } catch (e) {
        const err = e as FetchError;
        throw new Error(err?.data?.error?.message || "Erreur lors de l'ajout de l'équipe");
      } finally {
        this.addingTeam = false;
      }
    },

    async deleteTeam(team: TeamResponse, refresh: () => Promise<void>) {
      const api = useApi();

      try {
        await api.teams.delete(team.id);
        await refresh();
      } catch (e) {
        const err = e as FetchError;
        throw new Error(err?.data?.error?.message || "Erreur lors de la suppression");
      }
    },

    async generateMatches(tournamentId: string, refresh: () => Promise<void>, forceRegenerate = false) {
      if (!this.hasEnoughTeams) {
        throw new Error("Il faut au moins 2 équipes pour générer les matchs");
      }

      const api = useApi();

      if (this.hasMatches && !forceRegenerate) {
        throw new Error("MATCHES_EXIST");
      }

      if (this.hasMatches && forceRegenerate) {
        await api.matches.deleteAll(tournamentId);
      }

      this.generatingMatches = true;

      try {
        await api.matches.generate(tournamentId);
        await refresh();
        this.activeTab = "matches";
      } catch (e) {
        const err = e as FetchError;
        throw new Error(err?.data?.error?.message || "Erreur lors de la génération");
      } finally {
        this.generatingMatches = false;
      }
    },

    async saveScore(matchId: string, refresh: () => Promise<void>) {
      const api = useApi();

      try {
        await api.matches.updateScore(matchId, {
          homeScore: this.editScores.home,
          awayScore: this.editScores.away,
        });
        this.cancelEditScore();
        await refresh();
      } catch (e) {
        const err = e as FetchError;
        throw new Error(err?.data?.error?.message || "Erreur lors de la mise à jour du score");
      }
    },

    async deleteTournament(tournamentId: string, router: ReturnType<typeof useRouter>) {
      const api = useApi();
      this.deletingTournament = true;

      try {
        await api.tournaments.delete(tournamentId);
        await router.push("/tournaments");
      } catch (e) {
        const err = e as FetchError;
        throw new Error(err?.data?.error?.message || "Erreur lors de la suppression du tournoi");
      } finally {
        this.deletingTournament = false;
      }
    },

    async updateStatus(tournamentId: string, status: TournamentStatus, refresh: () => Promise<void>) {
      const api = useApi();

      try {
        await api.tournaments.update(tournamentId, { status });
        await refresh();
      } catch (e) {
        const err = e as FetchError;
        throw new Error(err?.data?.error?.message || "Erreur lors de la mise à jour");
      }
    },
  },
});
