<script setup lang="ts">
import type { FetchError } from "@poduim/shared/types";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const { auth } = useAuthApi();

// Fetch user stats
const { data: statsData, pending: statsPending } = await useAsyncData("user-stats", () =>
  auth.stats()
);

const stats = computed(() => statsData.value?.data);

// Profile form
const profileForm = reactive({
  username: authStore.user?.username || "",
  firstName: authStore.user?.firstName || "",
  lastName: authStore.user?.lastName || "",
});

const profileErrors = reactive({
  username: "",
  firstName: "",
  lastName: "",
  general: "",
});

const savingProfile = ref(false);
const profileSuccess = ref(false);

// Password form
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordErrors = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  general: "",
});

const savingPassword = ref(false);
const passwordSuccess = ref(false);

// Sync form with store on user change
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      profileForm.username = user.username;
      profileForm.firstName = user.firstName || "";
      profileForm.lastName = user.lastName || "";
    }
  },
  { immediate: true }
);

function clearProfileErrors() {
  profileErrors.username = "";
  profileErrors.firstName = "";
  profileErrors.lastName = "";
  profileErrors.general = "";
  profileSuccess.value = false;
}

function clearPasswordErrors() {
  passwordErrors.currentPassword = "";
  passwordErrors.newPassword = "";
  passwordErrors.confirmPassword = "";
  passwordErrors.general = "";
  passwordSuccess.value = false;
}

function validateProfile(): boolean {
  clearProfileErrors();
  let valid = true;

  if (!profileForm.username.trim()) {
    profileErrors.username = "Le nom d'utilisateur est requis";
    valid = false;
  } else if (profileForm.username.length < 3) {
    profileErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    valid = false;
  }

  return valid;
}

function validatePassword(): boolean {
  clearPasswordErrors();
  let valid = true;

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = "Le mot de passe actuel est requis";
    valid = false;
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = "Le nouveau mot de passe est requis";
    valid = false;
  } else if (passwordForm.newPassword.length < 8) {
    passwordErrors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    valid = false;
  }

  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = "La confirmation est requise";
    valid = false;
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    valid = false;
  }

  return valid;
}

async function handleSaveProfile() {
  if (!validateProfile()) return;

  savingProfile.value = true;
  clearProfileErrors();

  try {
    const response = await auth.updateProfile({
      username: profileForm.username.trim(),
      firstName: profileForm.firstName.trim() || undefined,
      lastName: profileForm.lastName.trim() || undefined,
    });

    if (response.success && response.data) {
      if (authStore.user && authStore.token) {
        authStore.setAuth(response.data.user, authStore.token);
      }
      profileSuccess.value = true;
      setTimeout(() => {
        profileSuccess.value = false;
      }, 3000);
    }
  } catch (e) {
    const err = e as FetchError;
    profileErrors.general = err?.data?.error?.message || "Erreur lors de la mise à jour du profil";
  } finally {
    savingProfile.value = false;
  }
}

async function handleChangePassword() {
  if (!validatePassword()) return;

  savingPassword.value = true;
  clearPasswordErrors();

  try {
    const response = await auth.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (response.success) {
      passwordForm.currentPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
      passwordSuccess.value = true;
      setTimeout(() => {
        passwordSuccess.value = false;
      }, 3000);
    }
  } catch (e) {
    const err = e as FetchError;
    const message = err?.data?.error?.message || "Erreur lors du changement de mot de passe";

    if (message.toLowerCase().includes("incorrect") || message.toLowerCase().includes("invalide")) {
      passwordErrors.currentPassword = "Mot de passe actuel incorrect";
    } else {
      passwordErrors.general = message;
    }
  } finally {
    savingPassword.value = false;
  }
}

function handleUpdateProfileForm(form: typeof profileForm) {
  Object.assign(profileForm, form);
}

function handleUpdatePasswordForm(form: typeof passwordForm) {
  Object.assign(passwordForm, form);
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
    <div class="mx-auto max-w-4xl px-4">
      <!-- Header Section -->
      <div class="mb-8">
        <NuxtLink
          to="/"
          class="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          Retour à l'accueil
        </NuxtLink>
        <h1 class="text-3xl font-bold text-slate-900">Mon profil</h1>
        <p class="mt-2 text-slate-600">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <ProfileHeader class="mb-8" />

      <ProfileStats :stats="stats" :pending="statsPending" class="mb-8" />

      <div class="grid gap-8 lg:grid-cols-2">
        <ProfileForm
          :form="profileForm"
          :errors="profileErrors"
          :saving="savingProfile"
          :success="profileSuccess"
          :email="authStore.user?.email || ''"
          @submit="handleSaveProfile"
          @update:form="handleUpdateProfileForm"
        />

        <PasswordForm
          :form="passwordForm"
          :errors="passwordErrors"
          :saving="savingPassword"
          :success="passwordSuccess"
          @submit="handleChangePassword"
          @update:form="handleUpdatePasswordForm"
        />
      </div>

      <ProfileDangerZone class="mt-8" />
    </div>
  </div>
</template>
