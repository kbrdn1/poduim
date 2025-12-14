<script setup lang="ts">
definePageMeta({
  title: "Mes abonnements",
  middleware: ["auth"],
});

const { subscriptions } = useAuthApi();
const { formatDate, getStatusVariant, getStatusLabel } = useFormatters();

const { data: subscriptionData, pending, error, refresh } = await useAsyncData(
  "subscriptions",
  () => subscriptions.list()
);

async function handleUnsubscribe(tournamentId: string) {
  try {
    await subscriptions.unsubscribe(tournamentId);
    refresh();
  } catch (e) {
    console.error("Failed to unsubscribe:", e);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
    <div class="mx-auto max-w-5xl px-4">
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
            <h1 class="text-3xl font-bold text-slate-900">Mes abonnements</h1>
            <p class="mt-2 text-slate-600">
              Suivez vos tournois favoris et recevez des notifications en temps réel.
            </p>
          </div>
          <NuxtLink
            to="/tournaments"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30"
          >
            <Icon name="lucide:search" class="h-4 w-4" />
            Découvrir les tournois
          </NuxtLink>
        </div>
      </div>

      <!-- Stats Bar -->
      <div v-if="subscriptionData?.data?.length" class="mb-8 grid grid-cols-3 gap-4">
        <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <Icon name="lucide:star" class="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-900">{{ subscriptionData.data.length }}</div>
              <div class="text-sm text-slate-500">Abonnements</div>
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100">
              <Icon name="lucide:play" class="h-6 w-6 text-success-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-900">
                {{ subscriptionData.data.filter(s => s.tournamentStatus === 'in_progress').length }}
              </div>
              <div class="text-sm text-slate-500">En cours</div>
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100">
              <Icon name="lucide:bell" class="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-slate-900">
                {{ subscriptionData.data.filter(s => s.notifyOnMatch || s.notifyOnResult).length }}
              </div>
              <div class="text-sm text-slate-500">Notifications actives</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" />
        <p class="mt-4 text-slate-500">Chargement de vos abonnements...</p>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-danger-200 bg-danger-50 p-8 text-center"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
          <Icon name="lucide:alert-circle" class="h-8 w-8 text-danger-600" />
        </div>
        <h3 class="text-lg font-semibold text-danger-700">Erreur de chargement</h3>
        <p class="mt-2 text-sm text-danger-600">
          Une erreur est survenue lors du chargement de vos abonnements.
        </p>
        <button
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-danger-700"
          @click="() => refresh()"
        >
          <Icon name="lucide:refresh-cw" class="h-4 w-4" />
          Réessayer
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!subscriptionData?.data?.length"
        class="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm"
      >
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Icon name="lucide:star" class="h-10 w-10 text-slate-400" />
        </div>
        <h3 class="text-xl font-semibold text-slate-900">Aucun abonnement</h3>
        <p class="mx-auto mt-3 max-w-sm text-slate-500">
          Vous n'êtes abonné à aucun tournoi pour le moment. Explorez les tournois disponibles et commencez à suivre vos compétitions préférées.
        </p>
        <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <NuxtLink
            to="/tournaments"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30"
          >
            <Icon name="lucide:search" class="h-4 w-4" />
            Découvrir les tournois
          </NuxtLink>
        </div>
      </div>

      <!-- Subscriptions list -->
      <div v-else class="space-y-4">
        <div
          v-for="sub in subscriptionData.data"
          :key="sub.id"
          class="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <NuxtLink
                  :to="`/tournaments/${sub.tournamentId}`"
                  class="text-xl font-semibold text-slate-900 transition-colors hover:text-primary-600"
                >
                  {{ sub.tournamentName }}
                </NuxtLink>
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                    getStatusVariant(sub.tournamentStatus || 'draft') === 'success'
                      ? 'bg-success-100 text-success-700'
                      : getStatusVariant(sub.tournamentStatus || 'draft') === 'warning'
                        ? 'bg-warning-100 text-warning-700'
                        : getStatusVariant(sub.tournamentStatus || 'draft') === 'primary'
                          ? 'bg-primary-100 text-primary-700'
                          : getStatusVariant(sub.tournamentStatus || 'draft') === 'danger'
                            ? 'bg-danger-100 text-danger-700'
                            : 'bg-slate-100 text-slate-700',
                  ]"
                >
                  {{ getStatusLabel(sub.tournamentStatus || 'draft') }}
                </span>
              </div>

              <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span v-if="sub.tournamentDate" class="inline-flex items-center gap-1.5">
                  <Icon name="lucide:calendar" class="h-4 w-4" />
                  {{ formatDate(sub.tournamentDate) }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <Icon name="lucide:clock" class="h-4 w-4" />
                  Abonné le {{ formatDate(sub.subscribedAt) }}
                </span>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-4">
                <label class="flex items-center gap-2 text-sm">
                  <div
                    :class="[
                      'flex h-5 w-5 items-center justify-center rounded',
                      sub.notifyOnMatch ? 'bg-primary-600' : 'border-2 border-slate-300 bg-white',
                    ]"
                  >
                    <Icon v-if="sub.notifyOnMatch" name="lucide:check" class="h-3 w-3 text-white" />
                  </div>
                  <span class="text-slate-600">Notifications de matchs</span>
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <div
                    :class="[
                      'flex h-5 w-5 items-center justify-center rounded',
                      sub.notifyOnResult ? 'bg-primary-600' : 'border-2 border-slate-300 bg-white',
                    ]"
                  >
                    <Icon v-if="sub.notifyOnResult" name="lucide:check" class="h-3 w-3 text-white" />
                  </div>
                  <span class="text-slate-600">Notifications de résultats</span>
                </label>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <NuxtLink
                :to="`/tournaments/${sub.tournamentId}`"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
              >
                <Icon name="lucide:eye" class="h-4 w-4" />
                Voir
              </NuxtLink>
              <button
                class="inline-flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-2.5 text-sm font-medium text-danger-600 transition-all hover:bg-danger-100"
                @click="handleUnsubscribe(sub.tournamentId)"
              >
                <Icon name="lucide:star-off" class="h-4 w-4" />
                Se désabonner
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div
        v-if="subscriptionData?.data?.length"
        class="mt-8 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center shadow-xl"
      >
        <h3 class="text-xl font-semibold text-white">Envie de plus de compétition ?</h3>
        <p class="mx-auto mt-2 max-w-md text-primary-100">
          Découvrez tous les tournois disponibles et rejoignez de nouvelles compétitions passionnantes.
        </p>
        <NuxtLink
          to="/tournaments"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-primary-600 shadow-lg transition-all hover:bg-primary-50"
        >
          Explorer les tournois
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
