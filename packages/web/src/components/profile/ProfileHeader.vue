<script setup lang="ts">
const authStore = useAuthStore();
</script>

<template>
  <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 shadow-xl">
    <div class="flex flex-col items-center gap-6 sm:flex-row">
      <div class="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-4xl font-bold text-white ring-4 ring-white/30">
        {{ authStore.user?.firstName?.[0] || authStore.user?.username?.[0] || "?" }}
      </div>
      <div class="text-center sm:text-left">
        <h2 class="text-2xl font-bold text-white">{{ authStore.fullName }}</h2>
        <p class="mt-1 text-primary-100">{{ authStore.user?.email }}</p>
        <div class="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <span
            v-if="authStore.isAdmin"
            class="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white"
          >
            <Icon name="lucide:shield" class="h-4 w-4" />
            Administrateur
          </span>
          <span class="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
            <Icon name="lucide:check-circle" class="h-4 w-4" />
            Compte vérifié
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
