<script setup lang="ts">
import type { FetchError, UserRole } from "@poduim/shared/types";
import type { AdminUser } from "~/composables/useAdminApi";

definePageMeta({
  title: "Administration",
  middleware: ["admin"],
});

const api = useApi();
const adminApi = useAdminApi();
const authStore = useAuthStore();
const { formatDate } = useFormatters();

// Tab state
const activeTab = ref<"users" | "tournaments">("users");

// ============ USERS ============
const searchQuery = ref("");
const roleFilter = ref<UserRole | "">("");
const activeFilter = ref<"" | "true" | "false">("");
const currentPage = ref(1);
const limit = 10;

// User modals
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedUser = ref<AdminUser | null>(null);

// User forms
const createForm = reactive({
  email: "",
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "viewer" as UserRole,
});

const editForm = reactive({
  username: "",
  firstName: "",
  lastName: "",
  role: "viewer" as UserRole,
  isActive: true,
});

const isSubmitting = ref(false);
const formError = ref<string | null>(null);

// Alert/Confirm modals
const showAlertModal = ref(false);
const alertMessage = ref("");
const alertType = ref<"error" | "warning">("error");

const showConfirmModal = ref(false);
const confirmMessage = ref("");
const userToDelete = ref<AdminUser | null>(null);
const isDeleting = ref(false);

function showAlert(message: string, type: "error" | "warning" = "error") {
  alertMessage.value = message;
  alertType.value = type;
  showAlertModal.value = true;
}

function openDeleteConfirm(user: AdminUser) {
  userToDelete.value = user;
  confirmMessage.value = `Êtes-vous sûr de vouloir désactiver l'utilisateur "${user.username}" ?`;
  showConfirmModal.value = true;
}

// Fetch users
const { data: usersData, pending: usersPending, refresh: refreshUsers } = await useAsyncData(
  "admin-users",
  () =>
    adminApi.users.list({
      search: searchQuery.value || undefined,
      role: roleFilter.value || undefined,
      active: activeFilter.value ? activeFilter.value === "true" : undefined,
      page: currentPage.value,
      limit,
    }),
  {
    watch: [searchQuery, roleFilter, activeFilter, currentPage],
  }
);

const usersList = computed(() => usersData.value?.data || []);
const usersPagination = computed(() => usersData.value?.pagination);

const usersStats = computed(() => ({
  total: usersPagination.value?.total || 0,
  admins: usersList.value.filter((u) => u.role === "admin").length,
  active: usersList.value.filter((u) => u.isActive).length,
}));

// User actions
function openCreateModal() {
  createForm.email = "";
  createForm.username = "";
  createForm.password = "";
  createForm.firstName = "";
  createForm.lastName = "";
  createForm.role = "viewer";
  formError.value = null;
  showCreateModal.value = true;
}

function openEditModal(user: AdminUser) {
  selectedUser.value = user;
  editForm.username = user.username;
  editForm.firstName = user.firstName || "";
  editForm.lastName = user.lastName || "";
  editForm.role = user.role;
  editForm.isActive = user.isActive;
  formError.value = null;
  showEditModal.value = true;
}

function closeModals() {
  showCreateModal.value = false;
  showEditModal.value = false;
  selectedUser.value = null;
  formError.value = null;
}

async function handleCreate() {
  if (!createForm.email || !createForm.username || !createForm.password) {
    formError.value = "Email, nom d'utilisateur et mot de passe sont requis";
    return;
  }

  isSubmitting.value = true;
  formError.value = null;

  try {
    await adminApi.users.create({
      email: createForm.email,
      username: createForm.username,
      password: createForm.password,
      firstName: createForm.firstName || undefined,
      lastName: createForm.lastName || undefined,
      role: createForm.role,
    });
    closeModals();
    await refreshUsers();
  } catch (e) {
    const err = e as FetchError;
    formError.value = err?.data?.error?.message || "Erreur lors de la création";
  } finally {
    isSubmitting.value = false;
  }
}

async function handleUpdate() {
  if (!selectedUser.value) return;

  isSubmitting.value = true;
  formError.value = null;

  try {
    await adminApi.users.update(selectedUser.value.id, {
      username: editForm.username,
      firstName: editForm.firstName || undefined,
      lastName: editForm.lastName || undefined,
      role: editForm.role,
      isActive: editForm.isActive,
    });
    closeModals();
    await refreshUsers();
  } catch (e) {
    const err = e as FetchError;
    formError.value = err?.data?.error?.message || "Erreur lors de la mise à jour";
  } finally {
    isSubmitting.value = false;
  }
}

function handleDeleteUser(user: AdminUser) {
  if (user.id === authStore.user?.id) {
    showAlert("Vous ne pouvez pas supprimer votre propre compte", "warning");
    return;
  }
  openDeleteConfirm(user);
}

async function confirmDeleteUser() {
  if (!userToDelete.value) return;

  isDeleting.value = true;
  try {
    await adminApi.users.delete(userToDelete.value.id);
    showConfirmModal.value = false;
    userToDelete.value = null;
    await refreshUsers();
  } catch (e) {
    const err = e as FetchError;
    showConfirmModal.value = false;
    showAlert(err?.data?.error?.message || "Erreur lors de la suppression");
  } finally {
    isDeleting.value = false;
  }
}

function cancelDeleteUser() {
  showConfirmModal.value = false;
  userToDelete.value = null;
}

function formatLastLogin(date: string | null) {
  if (!date) return "Jamais";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============ TOURNAMENTS ============
const { data: tournamentsData, pending: tournamentsPending, refresh: refreshTournaments } = await useAsyncData(
  "admin-tournaments",
  () => api.tournaments.list({ limit: 50 })
);

const tournamentsList = computed(() => tournamentsData.value?.data || []);

const tournamentsStats = computed(() => ({
  total: tournamentsData.value?.pagination?.total || 0,
  draft: tournamentsList.value.filter((t) => t.status === "draft").length,
  inProgress: tournamentsList.value.filter((t) => t.status === "in_progress").length,
  completed: tournamentsList.value.filter((t) => t.status === "completed").length,
}));

function getStatusBadge(status: string) {
  const badges: Record<string, { variant: "secondary" | "primary" | "warning" | "success" | "danger"; label: string }> = {
    draft: { variant: "secondary", label: "Brouillon" },
    registration: { variant: "primary", label: "Inscriptions" },
    in_progress: { variant: "warning", label: "En cours" },
    completed: { variant: "success", label: "Terminé" },
    cancelled: { variant: "danger", label: "Annulé" },
  };
  return badges[status] || { variant: "secondary" as const, label: status };
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-slate-400";
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
    <div class="mx-auto max-w-6xl px-4">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/"
          class="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          Retour à l'accueil
        </NuxtLink>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Administration</h1>
            <p class="mt-2 text-slate-600">
              Gérez les utilisateurs et les tournois de la plateforme.
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-8 inline-flex rounded-xl bg-slate-100 p-1">
        <button
          :class="[
            'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
            activeTab === 'users'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          ]"
          @click="activeTab = 'users'"
        >
          <Icon name="lucide:users" class="h-4 w-4" />
          Utilisateurs
        </button>
        <button
          :class="[
            'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
            activeTab === 'tournaments'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          ]"
          @click="activeTab = 'tournaments'"
        >
          <Icon name="lucide:trophy" class="h-4 w-4" />
          Tournois
        </button>
      </div>

      <!-- ============ USERS TAB ============ -->
      <div v-if="activeTab === 'users'">
        <!-- Users Stats Cards -->
        <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Icon name="lucide:users" class="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-900">{{ usersStats.total }}</p>
                <p class="text-sm text-slate-500">Utilisateurs</p>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100">
                <Icon name="lucide:shield" class="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-900">{{ usersStats.admins }}</p>
                <p class="text-sm text-slate-500">Admins</p>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100">
                <Icon name="lucide:user-check" class="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-900">{{ usersStats.active }}</p>
                <p class="text-sm text-slate-500">Actifs</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Filters & Actions -->
        <div class="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div class="relative flex-1">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:search" class="h-5 w-5 text-slate-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher par email ou nom..."
                class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:shield" class="h-5 w-5 text-slate-400" />
              </div>
              <select
                v-model="roleFilter"
                class="h-12 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-10 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="lucide:filter" class="h-5 w-5 text-slate-400" />
              </div>
              <select
                v-model="activeFilter"
                class="h-12 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-10 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </select>
            </div>
            <button
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30"
              @click="openCreateModal"
            >
              <Icon name="lucide:user-plus" class="h-4 w-4" />
              Nouvel utilisateur
            </button>
          </div>
        </div>

        <!-- Users Loading -->
        <div v-if="usersPending" class="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p class="mt-4 text-slate-500">Chargement des utilisateurs...</p>
        </div>

        <!-- Users Table -->
        <div v-else class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Utilisateur
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rôle
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Dernière connexion
                  </th>
                  <th class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="user in usersList" :key="user.id" class="transition-colors hover:bg-slate-50">
                  <td class="whitespace-nowrap px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                        <Icon name="lucide:user" class="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p class="font-medium text-slate-900">
                          {{ user.firstName || user.lastName ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : user.username }}
                        </p>
                        <p class="text-sm text-slate-500">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                        user.role === 'admin' ? 'bg-warning-100 text-warning-700' : 'bg-slate-100 text-slate-700',
                      ]"
                    >
                      {{ user.role === "admin" ? "Admin" : "Viewer" }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                        user.isActive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700',
                      ]"
                    >
                      {{ user.isActive ? "Actif" : "Inactif" }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <div class="flex items-center gap-1.5 text-sm text-slate-500">
                      <Icon name="lucide:clock" class="h-4 w-4" />
                      {{ formatLastLogin(user.lastLoginAt) }}
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                        @click="openEditModal(user)"
                      >
                        <Icon name="lucide:pencil" class="h-4 w-4" />
                      </button>
                      <button
                        v-if="user.id !== authStore.user?.id"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-danger-300 hover:bg-danger-50 hover:text-danger-600"
                        @click="handleDeleteUser(user)"
                      >
                        <Icon name="lucide:trash-2" class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="!usersList.length" class="py-16 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Icon name="lucide:users" class="h-8 w-8 text-slate-400" />
            </div>
            <p class="text-lg font-medium text-slate-900">Aucun utilisateur trouvé</p>
            <p class="mt-1 text-sm text-slate-500">Ajustez vos filtres ou créez un nouvel utilisateur</p>
          </div>

          <!-- Pagination -->
          <div
            v-if="usersPagination && usersPagination.totalPages > 1"
            class="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row"
          >
            <p class="text-sm text-slate-500">
              Page {{ usersPagination.page }} sur {{ usersPagination.totalPages }}
              <span class="text-slate-400">({{ usersPagination.total }} utilisateurs)</span>
            </p>
            <div class="flex gap-2">
              <button
                :disabled="currentPage <= 1"
                :class="[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                  currentPage <= 1
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600',
                ]"
                @click="currentPage--"
              >
                <Icon name="lucide:chevron-left" class="h-4 w-4" />
                Précédent
              </button>
              <button
                :disabled="currentPage >= usersPagination.totalPages"
                :class="[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                  currentPage >= usersPagination.totalPages
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600',
                ]"
                @click="currentPage++"
              >
                Suivant
                <Icon name="lucide:chevron-right" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ TOURNAMENTS TAB ============ -->
      <div v-if="activeTab === 'tournaments'">
        <!-- Tournaments Stats Cards -->
        <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card padding="md" class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <Icon name="lucide:trophy" class="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900">{{ tournamentsStats.total }}</p>
              <p class="text-sm text-slate-500">Tournois</p>
            </div>
          </Card>
          <Card padding="md" class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Icon name="lucide:file-edit" class="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900">{{ tournamentsStats.draft }}</p>
              <p class="text-sm text-slate-500">Brouillons</p>
            </div>
          </Card>
          <Card padding="md" class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100">
              <Icon name="lucide:play-circle" class="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900">{{ tournamentsStats.inProgress }}</p>
              <p class="text-sm text-slate-500">En cours</p>
            </div>
          </Card>
          <Card padding="md" class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100">
              <Icon name="lucide:check-circle" class="h-6 w-6 text-success-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900">{{ tournamentsStats.completed }}</p>
              <p class="text-sm text-slate-500">Terminés</p>
            </div>
          </Card>
        </div>

        <!-- Tournaments Actions -->
        <div class="mb-6 flex justify-end">
          <Button to="/tournaments/create">
            <Icon name="lucide:plus" class="h-4 w-4" />
            Créer un tournoi
          </Button>
        </div>

        <!-- Tournaments Loading -->
        <div v-if="tournamentsPending" class="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p class="mt-4 text-slate-500">Chargement des tournois...</p>
        </div>

        <!-- Tournaments List -->
        <div v-else class="space-y-4">
          <Card
            v-for="tournament in tournamentsList"
            :key="tournament.id"
            hoverable
            padding="md"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <Icon name="lucide:trophy" class="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <div class="flex items-center gap-3">
                    <h3 class="text-lg font-semibold text-slate-900">
                      {{ tournament.name }}
                    </h3>
                    <Badge :variant="getStatusBadge(tournament.status || 'draft').variant" size="sm">
                      {{ getStatusBadge(tournament.status || 'draft').label }}
                    </Badge>
                  </div>
                  <p class="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <Icon name="lucide:calendar" class="h-4 w-4" />
                    {{ formatDate(tournament.date) }}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                :to="`/tournaments/${tournament.id}`"
              >
                <Icon name="lucide:eye" class="h-4 w-4" />
                Voir
              </Button>
            </div>
          </Card>

          <EmptyState
            v-if="!tournamentsList.length"
            icon="lucide:trophy"
            title="Aucun tournoi"
            description="Créez votre premier tournoi pour commencer."
          >
            <template #action>
              <Button to="/tournaments/create">
                <Icon name="lucide:plus" class="h-4 w-4" />
                Créer un tournoi
              </Button>
            </template>
          </EmptyState>
        </div>
      </div>
    </div>

    <!-- ============ MODALS ============ -->

    <!-- Create User Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeModals"
      >
        <Card class="w-full max-w-md">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">Nouvel utilisateur</h2>

          <div v-if="formError" class="mb-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-600">
            {{ formError }}
          </div>

          <form class="space-y-4" @submit.prevent="handleCreate">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Email *</label>
              <input v-model="createForm.email" type="email" required :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Nom d'utilisateur *</label>
              <input v-model="createForm.username" type="text" required :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Mot de passe *</label>
              <input v-model="createForm.password" type="password" required :class="inputClass" />
              <p class="mt-1 text-xs text-slate-500">Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
                <input v-model="createForm.firstName" type="text" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Nom</label>
                <input v-model="createForm.lastName" type="text" :class="inputClass" />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Rôle</label>
              <select v-model="createForm.role" :class="inputClass">
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" @click="closeModals">Annuler</Button>
              <Button type="submit" :disabled="isSubmitting">
                <Spinner v-if="isSubmitting" size="sm" class="mr-2" />
                Créer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Teleport>

    <!-- Edit User Modal -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedUser"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeModals"
      >
        <Card class="w-full max-w-md">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">Modifier l'utilisateur</h2>

          <div v-if="formError" class="mb-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-600">
            {{ formError }}
          </div>

          <form class="space-y-4" @submit.prevent="handleUpdate">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input :value="selectedUser.email" type="email" disabled :class="inputClass" class="bg-slate-100" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Nom d'utilisateur</label>
              <input v-model="editForm.username" type="text" required :class="inputClass" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
                <input v-model="editForm.firstName" type="text" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">Nom</label>
                <input v-model="editForm.lastName" type="text" :class="inputClass" />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">Rôle</label>
              <select
                v-model="editForm.role"
                :class="inputClass"
                :disabled="selectedUser.id === authStore.user?.id"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
              <p v-if="selectedUser.id === authStore.user?.id" class="mt-1 text-xs text-slate-500">
                Vous ne pouvez pas modifier votre propre rôle
              </p>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="isActive"
                v-model="editForm.isActive"
                type="checkbox"
                :disabled="selectedUser.id === authStore.user?.id"
                class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label for="isActive" class="text-sm text-slate-700">Compte actif</label>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" @click="closeModals">Annuler</Button>
              <Button type="submit" :disabled="isSubmitting">
                <Spinner v-if="isSubmitting" size="sm" class="mr-2" />
                Enregistrer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Teleport>

    <!-- Alert Modal -->
    <AlertModal
      :show="showAlertModal"
      :message="alertMessage"
      :type="alertType"
      @close="showAlertModal = false"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      title="Désactiver l'utilisateur"
      :message="confirmMessage"
      type="danger"
      confirm-text="Désactiver"
      :loading="isDeleting"
      @confirm="confirmDeleteUser"
      @cancel="cancelDeleteUser"
    />
  </div>
</template>
