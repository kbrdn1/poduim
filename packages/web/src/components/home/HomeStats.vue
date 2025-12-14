<script setup lang="ts">
import { HOME_STATS } from "~/constants/home";
</script>

<template>
  <section class="rounded-2xl bg-slate-50 px-8 py-6">
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
      <div v-for="stat in HOME_STATS" :key="stat.label" class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon :name="stat.icon" class="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
          <p class="text-sm text-slate-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
