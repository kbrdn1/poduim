<script setup lang="ts">
import { HOME_HERO_BENEFITS } from "~/constants/home";

const authStore = useAuthStore();
</script>

<template>
  <section class="relative">
    <div class="grid items-center gap-12 lg:grid-cols-2">
      <!-- Left Content -->
      <div class="space-y-8">
        <div class="relative">
          <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Poduim,
            <span class="relative">
              <svg class="absolute -right-8 -top-6 h-12 w-12 text-primary-500" viewBox="0 0 50 50" fill="none">
                <path d="M10 25 Q25 10 40 25 Q35 30 30 28" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M30 28 L35 35 M30 28 L38 25" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </span>
            <br />
            <span class="text-primary-600">La gestion de tournois</span>
            <br />
            simplifiée
          </h1>
        </div>

        <p class="max-w-lg text-lg text-slate-600">
          Créez et gérez vos tournois de baby-foot facilement. Ajoutez des équipes,
          générez automatiquement les matchs et suivez les résultats en temps réel.
        </p>

        <!-- Checkmarks -->
        <div class="space-y-3">
          <div v-for="benefit in HOME_HERO_BENEFITS" :key="benefit" class="flex items-center gap-3">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
              <Icon name="lucide:check" class="h-4 w-4 text-success-600" />
            </div>
            <span class="text-slate-700">{{ benefit }}</span>
          </div>
        </div>

        <!-- CTAs -->
        <div class="flex flex-wrap items-center gap-4">
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/tournaments/create"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30"
          >
            Créer un tournoi
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
          <NuxtLink
            v-else-if="!authStore.isAuthenticated"
            to="/register"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30"
          >
            Commencer gratuitement
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
          <NuxtLink
            to="/tournaments"
            class="inline-flex items-center gap-2 rounded-lg border-2 border-primary-200 bg-white px-6 py-3.5 text-sm font-medium text-primary-600 transition-all hover:border-primary-300 hover:bg-primary-50"
          >
            Voir les tournois
          </NuxtLink>
        </div>
      </div>

      <!-- Right Content - Product Cards -->
      <div class="relative space-y-4 lg:pl-8">
        <!-- Card 1 - Tournois -->
        <div class="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">Gestion de tournois</h3>
              <span class="mt-2 inline-block rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">
                100% en ligne
              </span>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon name="lucide:trophy" class="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-success-100">
              <Icon name="lucide:check" class="h-5 w-5 text-success-600" />
            </div>
            <span class="text-lg font-medium text-slate-700">Prêt à l'emploi</span>
          </div>
        </div>

        <!-- Card 2 - Équipes -->
        <div class="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">Équipes illimitées</h3>
              <span class="mt-2 inline-block rounded-full bg-success-500 px-3 py-1 text-xs font-medium text-white">
                Sans restriction
              </span>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon name="lucide:users" class="h-6 w-6 text-success-600" />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex -space-x-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-200 text-xs font-medium text-primary-700 ring-2 ring-white">JD</div>
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-success-200 text-xs font-medium text-success-700 ring-2 ring-white">ML</div>
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-warning-200 text-xs font-medium text-warning-700 ring-2 ring-white">PK</div>
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-700 ring-2 ring-white">+∞</div>
            </div>
            <span class="text-sm text-slate-600">Ajoutez autant d'équipes que vous voulez</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
