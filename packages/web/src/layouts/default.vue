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

const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

function closeUserMenu() {
  isUserMenuOpen.value = false;
}

function handleLogout() {
  closeUserMenu();
  authStore.logout();
}

onClickOutside(userMenuRef, closeUserMenu);
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
              <div ref="userMenuRef" class="relative">
                <button
                  @click="toggleUserMenu"
                  class="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-primary-500"
                >
                  <div class="hidden text-right sm:block">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-white">
                        {{ authStore.user?.firstName || authStore.user?.username }}
                      </span>
                      <span
                        v-if="authStore.isAdmin"
                        class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white"
                      >
                        Admin
                      </span>
                    </div>
                    <span class="text-xs text-white/70">
                      {{ authStore.user?.email }}
                    </span>
                  </div>
                  <Icon
                    name="lucide:chevron-down"
                    class="h-4 w-4 text-white/80 transition-transform"
                    :class="{ 'rotate-180': isUserMenuOpen }"
                  />
                </button>

                <Transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <div
                    v-if="isUserMenuOpen"
                    class="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5"
                  >
                    <div class="border-b border-slate-100 px-4 py-2 sm:hidden">
                      <p class="text-sm font-medium text-slate-900">
                        {{ authStore.user?.firstName || authStore.user?.username }}
                      </p>
                      <p class="text-xs text-slate-500">{{ authStore.user?.email }}</p>
                    </div>
                    <NuxtLink
                      to="/profile"
                      @click="closeUserMenu"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Icon name="lucide:user" class="h-4 w-4" />
                      Mon profil
                    </NuxtLink>
                    <button
                      @click="handleLogout"
                      class="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                    >
                      <Icon name="lucide:log-out" class="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </Transition>
              </div>
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

    <footer class="border-t border-slate-200 bg-slate-900">
      <div class="container py-12">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-white">
              <Icon name="lucide:trophy" class="h-7 w-7 text-primary-500" />
              Poduim
            </NuxtLink>
            <p class="mt-4 text-sm text-slate-400">
              La plateforme simple et efficace pour organiser et gérer vos tournois de baby-foot.
            </p>
          </div>

          <!-- Navigation -->
          <div>
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Navigation
            </h3>
            <ul class="space-y-3">
              <li>
                <NuxtLink to="/" class="text-sm text-slate-400 transition-colors hover:text-primary-400">
                  Accueil
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/tournaments" class="text-sm text-slate-400 transition-colors hover:text-primary-400">
                  Tournois
                </NuxtLink>
              </li>
              <li v-if="authStore.isAuthenticated">
                <NuxtLink to="/subscriptions" class="text-sm text-slate-400 transition-colors hover:text-primary-400">
                  Mes abonnements
                </NuxtLink>
              </li>
              <li v-if="authStore.isAdmin">
                <NuxtLink to="/admin" class="text-sm text-slate-400 transition-colors hover:text-primary-400">
                  Administration
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Compte -->
          <div>
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Compte
            </h3>
            <ul class="space-y-3">
              <template v-if="authStore.isAuthenticated">
                <li>
                  <NuxtLink to="/profile" class="text-sm text-slate-400 transition-colors hover:text-primary-400">
                    Mon profil
                  </NuxtLink>
                </li>
                <li>
                  <button
                    class="text-sm text-slate-400 transition-colors hover:text-primary-400"
                    @click="authStore.logout()"
                  >
                    Déconnexion
                  </button>
                </li>
              </template>
              <template v-else>
                <li>
                  <NuxtLink to="/login" class="text-sm text-slate-400 transition-colors hover:text-primary-400">
                    Connexion
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/register" class="text-sm text-slate-400 transition-colors hover:text-primary-400">
                    Inscription
                  </NuxtLink>
                </li>
              </template>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Fonctionnalités
            </h3>
            <ul class="space-y-3">
              <li class="flex items-center gap-2 text-sm text-slate-400">
                <Icon name="lucide:check" class="h-4 w-4 text-primary-500" />
                Création de tournois
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-400">
                <Icon name="lucide:check" class="h-4 w-4 text-primary-500" />
                Gestion des équipes
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-400">
                <Icon name="lucide:check" class="h-4 w-4 text-primary-500" />
                Classement automatique
              </li>
              <li class="flex items-center gap-2 text-sm text-slate-400">
                <Icon name="lucide:check" class="h-4 w-4 text-primary-500" />
                Suivi en temps réel
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom -->
        <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p class="text-sm text-slate-500">
            &copy; {{ new Date().getFullYear() }} Poduim. Tous droits réservés.
          </p>
          <a
            href="https://github.com/kbrdn1"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-400"
          >
            <Icon name="lucide:github" class="h-4 w-4" />
            kbrdn1
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
