<script setup lang="ts">
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  general: string;
}

interface Props {
  form: PasswordFormData;
  errors: PasswordErrors;
  saving: boolean;
  success: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [];
  "update:form": [form: PasswordFormData];
}>();

const localForm = computed({
  get: () => props.form,
  set: (value) => emit("update:form", value),
});
</script>

<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
    <div class="mb-6 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-100">
        <Icon name="lucide:lock" class="h-5 w-5 text-warning-600" />
      </div>
      <h2 class="text-xl font-semibold text-slate-900">Sécurité</h2>
    </div>

    <form class="space-y-5" @submit.prevent="emit('submit')">
      <!-- Success Message -->
      <div
        v-if="success"
        class="flex items-center gap-3 rounded-xl bg-success-50 p-4 text-sm text-success-700"
      >
        <Icon name="lucide:check-circle" class="h-5 w-5 shrink-0" />
        Mot de passe changé avec succès
      </div>

      <!-- Error Message -->
      <div
        v-if="errors.general"
        class="flex items-center gap-3 rounded-xl bg-danger-50 p-4 text-sm text-danger-700"
      >
        <Icon name="lucide:alert-circle" class="h-5 w-5 shrink-0" />
        {{ errors.general }}
      </div>

      <div class="space-y-2">
        <label for="currentPassword" class="block text-sm font-medium text-slate-700">
          Mot de passe actuel <span class="text-danger-500">*</span>
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon name="lucide:lock" class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="currentPassword"
            v-model="localForm.currentPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            :class="[
              'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
              errors.currentPassword
                ? 'border-danger-300 bg-danger-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
            ]"
          />
        </div>
        <p v-if="errors.currentPassword" class="text-sm text-danger-600">
          {{ errors.currentPassword }}
        </p>
      </div>

      <div class="space-y-2">
        <label for="newPassword" class="block text-sm font-medium text-slate-700">
          Nouveau mot de passe <span class="text-danger-500">*</span>
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon name="lucide:key" class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="newPassword"
            v-model="localForm.newPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            :class="[
              'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
              errors.newPassword
                ? 'border-danger-300 bg-danger-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
            ]"
          />
        </div>
        <p class="text-xs text-slate-500">Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre</p>
        <p v-if="errors.newPassword" class="text-sm text-danger-600">
          {{ errors.newPassword }}
        </p>
      </div>

      <div class="space-y-2">
        <label for="confirmPassword" class="block text-sm font-medium text-slate-700">
          Confirmer le mot de passe <span class="text-danger-500">*</span>
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon name="lucide:key" class="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="confirmPassword"
            v-model="localForm.confirmPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            :class="[
              'w-full rounded-xl border py-3 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
              errors.confirmPassword
                ? 'border-danger-300 bg-danger-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary-300 focus:bg-white',
            ]"
          />
        </div>
        <p v-if="errors.confirmPassword" class="text-sm text-danger-600">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          :disabled="saving"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-warning-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-warning-500/25 transition-all hover:bg-warning-700 hover:shadow-xl hover:shadow-warning-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Spinner v-if="saving" size="sm" class="text-white" />
          <span>{{ saving ? "Modification..." : "Changer le mot de passe" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
