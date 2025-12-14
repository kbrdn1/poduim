<script setup lang="ts">
interface Props {
  show: boolean;
  teamName: string;
  loading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [];
  "update:teamName": [value: string];
}>();

const localTeamName = computed({
  get: () => props.teamName,
  set: (value) => emit("update:teamName", value),
});
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="show"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          @click.self="emit('close')"
        >
          <Card class="w-full max-w-md animate-slide-up p-6">
            <div class="mb-6 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                <Icon name="lucide:users" class="h-5 w-5 text-primary-600" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900">Ajouter une équipe</h3>
            </div>
            <form @submit.prevent="emit('submit')">
              <div class="space-y-2">
                <label for="teamName" class="block text-sm font-medium text-slate-700">
                  Nom de l'équipe <span class="text-danger-500">*</span>
                </label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Icon name="lucide:users" class="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="teamName"
                    v-model="localTeamName"
                    type="text"
                    placeholder="Ex: Les Champions"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autofocus
                  />
                </div>
              </div>
              <div class="mt-6 flex justify-end gap-3">
                <Button variant="outline" type="button" @click="emit('close')">
                  Annuler
                </Button>
                <Button type="submit" :loading="loading" :disabled="!teamName.trim()">
                  <Icon name="lucide:plus" class="mr-1 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
