<script setup lang="ts">
const authStore = useAuthStore();
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2">
    <NuxtLink
      v-if="!authStore.isAuthenticated"
      to="/register"
      class="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100/50 p-6 transition-all hover:shadow-lg"
    >
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon name="lucide:user-plus" class="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <p class="font-semibold text-slate-900">Créez votre compte gratuitement</p>
          <p class="text-sm text-slate-600">Commencez à organiser vos tournois</p>
        </div>
      </div>
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:translate-x-1">
        <Icon name="lucide:arrow-right" class="h-5 w-5 text-primary-600" />
      </div>
    </NuxtLink>

    <NuxtLink
      to="/tournaments"
      class="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 p-6 transition-all hover:shadow-lg"
    >
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon name="lucide:search" class="h-6 w-6 text-slate-600" />
        </div>
        <div>
          <p class="font-semibold text-slate-900">Parcourir les tournois</p>
          <p class="text-sm text-slate-600">Découvrez tous les tournois disponibles</p>
        </div>
      </div>
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:translate-x-1">
        <Icon name="lucide:arrow-right" class="h-5 w-5 text-slate-600" />
      </div>
    </NuxtLink>
  </section>
</template>
