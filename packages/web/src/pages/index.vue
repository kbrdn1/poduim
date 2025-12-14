<script setup lang="ts">
definePageMeta({
  title: "Accueil",
});

const api = useApi();

const { data: tournamentsResponse, pending, error } = await useAsyncData(
  "home-tournaments",
  () => api.tournaments.list({ limit: 4 }),
  { server: false }
);

const tournaments = computed(() => tournamentsResponse.value?.data || []);
</script>

<template>
  <div class="space-y-20">
    <HomeHero />
    <HomeStats />
    <HomeFeatures />
    <HomeTournaments
      :tournaments="tournaments"
      :pending="pending"
      :error="error"
    />
    <HomeCtaCards />
  </div>
</template>
