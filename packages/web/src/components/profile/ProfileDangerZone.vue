<script setup lang="ts">
</script>

<template>
  <div class="rounded-2xl border-2 border-danger-200 bg-danger-50/50 p-8">
    <div class="flex items-start gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger-100">
        <Icon name="lucide:alert-triangle" class="h-6 w-6 text-danger-600" />
      </div>
      <div class="flex-1">
        <h2 class="text-xl font-semibold text-danger-700">Zone de danger</h2>
        <p class="mt-2 text-sm text-slate-600">
          Les actions suivantes sont irréversibles et concernent la suppression de votre compte.
        </p>
        <div class="mt-4">
          <button
            disabled
            class="inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-medium text-white opacity-50 transition-all"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" />
            Supprimer mon compte
          </button>
          <p class="mt-2 text-xs text-slate-500">
            Cette fonctionnalité sera disponible prochainement
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
