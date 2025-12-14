<script setup lang="ts">
import { HOME_FEATURES } from "~/constants/home";
</script>

<template>
  <section class="-mx-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 sm:-mx-6 sm:rounded-3xl sm:px-6 lg:-mx-8 lg:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-12 text-center">
        <span class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-500/20 px-4 py-1.5 text-sm font-medium text-primary-400">
          <Icon name="lucide:sparkles" class="h-4 w-4" />
          Fonctionnalités
        </span>
        <h2 class="text-3xl font-bold text-white sm:text-4xl">
          Tout ce dont vous avez besoin
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Une suite complète d'outils pour organiser et gérer vos tournois de baby-foot
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(feature, index) in HOME_FEATURES"
          :key="feature.title"
          class="group relative overflow-hidden rounded-2xl bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10"
        >
          <!-- Blur overlay on hover -->
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 opacity-0 backdrop-blur-0 transition-all duration-300 group-hover:from-primary-500/10 group-hover:via-transparent group-hover:to-primary-500/5 group-hover:opacity-100 group-hover:backdrop-blur-[2px]" />
          <div class="relative">
            <div
              :class="[
                'mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                index % 3 === 0 ? 'bg-primary-500/20' : index % 3 === 1 ? 'bg-emerald-500/20' : 'bg-violet-500/20',
              ]"
            >
              <Icon
                :name="feature.icon"
                :class="[
                  'h-6 w-6',
                  index % 3 === 0 ? 'text-primary-400' : index % 3 === 1 ? 'text-emerald-400' : 'text-violet-400',
                ]"
              />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-white">{{ feature.title }}</h3>
            <p class="text-sm text-slate-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- CTA dans la section -->
      <div class="mt-12 text-center">
        <NuxtLink
          to="/tournaments"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30"
        >
          Découvrir les tournois
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
