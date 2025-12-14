<script setup lang="ts">
interface ProfileFormData {
  username: string;
  firstName: string;
  lastName: string;
}

interface ProfileErrors {
  username: string;
  firstName: string;
  lastName: string;
  general: string;
}

interface Props {
  form: ProfileFormData;
  errors: ProfileErrors;
  saving: boolean;
  success: boolean;
  email: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [];
  "update:form": [form: ProfileFormData];
}>();

const localForm = computed({
  get: () => props.form,
  set: (value) => emit("update:form", value),
});
</script>

<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
    <div class="mb-6 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
        <Icon name="lucide:user" class="h-5 w-5 text-primary-600" />
      </div>
      <h2 class="text-xl font-semibold text-slate-900">Informations personnelles</h2>
    </div>

    <form class="space-y-5" @submit.prevent="emit('submit')">
      <!-- Success Message -->
      <div
        v-if="success"
        class="flex items-center gap-3 rounded-xl bg-success-50 p-4 text-sm text-success-700"
      >
        <Icon name="lucide:check-circle" class="h-5 w-5 shrink-0" />
        Profil mis à jour avec succès
      </div>

      <!-- Error Message -->
      <div
        v-if="errors.general"
        class="flex items-center gap-3 rounded-xl bg-danger-50 p-4 text-sm text-danger-700"
      >
        <Icon name="lucide:alert-circle" class="h-5 w-5 shrink-0" />
        {{ errors.general }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label for="firstName" class="block text-sm font-medium text-slate-700">
            Prénom
          </label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Icon name="lucide:user" class="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="firstName"
              v-model="localForm.firstName"
              type="text"
              placeholder="Votre prénom"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="lastName" class="block text-sm font-medium text-slate-700">
            Nom
          </label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Icon name="lucide:user" class="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="lastName"
              v-model="localForm.lastName"
              type="text"
              placeholder="Votre nom"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label for="username" class="block text-sm font-medium text-slate-700">
          Nom d'utilisateur <span class="text-danger-500">*</span>
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon name="lucide:at-sign" class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="username"
            v-model="localForm.username"
            type="text"
            placeholder="Votre nom d'utilisateur"
            :class="[
              'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
              errors.username
                ? 'border-danger-300 bg-danger-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
            ]"
          />
        </div>
        <p v-if="errors.username" class="text-sm text-danger-600">
          {{ errors.username }}
        </p>
      </div>

      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-slate-700">
          Email
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon name="lucide:mail" class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="email"
            :value="email"
            type="email"
            disabled
            class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3 pl-12 pr-4 text-sm text-slate-500"
          />
        </div>
        <p class="text-xs text-slate-500">L'email ne peut pas être modifié</p>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          :disabled="saving"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Spinner v-if="saving" size="sm" class="text-white" />
          <span>{{ saving ? "Enregistrement..." : "Enregistrer les modifications" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
