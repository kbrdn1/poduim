export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  if (authStore.isLoading) {
    await authStore.init();
  }

  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }
});
