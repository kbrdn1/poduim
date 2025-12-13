<script setup lang="ts">
const authStore = useAuthStore();

const navLinks = computed(() => {
  const links = [
    { to: "/", label: "Accueil" },
    { to: "/tournaments", label: "Tournois" },
  ];

  if (authStore.isAuthenticated) {
    links.push({ to: "/subscriptions", label: "Mes abonnements" });
  }

  if (authStore.isAdmin) {
    links.push({ to: "/admin", label: "Administration" });
  }

  return links;
});

function handleLogout() {
  authStore.logout();
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-50 border-b border-primary-700 bg-primary-600 shadow-md">
      <nav class="container flex h-16 items-center justify-between">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-xl font-bold text-white transition-opacity hover:opacity-90"
        >
          <Icon name="lucide:trophy" class="h-7 w-7" />
          <span class="hidden sm:inline">Poduim</span>
        </NuxtLink>

        <div class="flex items-center gap-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium text-white/90 transition-colors hover:text-white"
            active-class="!text-white underline underline-offset-4"
          >
            {{ link.label }}
          </NuxtLink>

          <div class="flex items-center gap-4 border-l border-primary-500 pl-4">
            <template v-if="authStore.isAuthenticated">
              <span class="hidden text-sm text-white/80 sm:inline">
                {{ authStore.fullName }}
              </span>
              <span
                v-if="authStore.isAdmin"
                class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white"
              >
                Admin
              </span>
              <button
                @click="handleLogout"
                class="rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-400"
              >
                Déconnexion
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                Connexion
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
              >
                Inscription
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-1 py-8">
      <div class="container">
        <slot />
      </div>
    </main>

    <footer class="border-t border-slate-200 bg-slate-50 py-6">
      <div class="container text-center text-sm text-slate-500">
        <p>&copy; {{ new Date().getFullYear() }} Poduim — Gestionnaire de tournois</p>
      </div>
    </footer>
  </div>
</template>
