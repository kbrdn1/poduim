<script setup lang="ts">
interface Feature {
  icon: string;
  label: string;
}

interface Props {
  title: string;
  subtitle: string;
  features: readonly Feature[];
}

defineProps<Props>();
</script>

<template>
  <div class="hidden w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 lg:block">
    <div class="flex h-full flex-col justify-between p-12">
      <NuxtLink to="/" class="flex items-center gap-3 text-white">
        <Icon name="lucide:trophy" class="h-8 w-8" />
        <span class="text-2xl font-bold">Poduim</span>
      </NuxtLink>

      <div class="space-y-8">
        <div>
          <h2 class="text-4xl font-bold text-white" v-html="title" />
          <p class="mt-4 text-lg text-primary-100">
            {{ subtitle }}
          </p>
        </div>

        <div class="space-y-4">
          <div v-for="feature in features" :key="feature.label" class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Icon :name="feature.icon" class="h-4 w-4 text-white" />
            </div>
            <span class="text-primary-100">{{ feature.label }}</span>
          </div>
        </div>
      </div>

      <p class="text-sm text-primary-200">
        © {{ new Date().getFullYear() }} Poduim. Tous droits réservés.
      </p>
    </div>
  </div>
</template>
