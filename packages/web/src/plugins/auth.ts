export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  // Initialize auth on client side
  if (import.meta.client) {
    await authStore.init();
  }
});
