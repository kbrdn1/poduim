<script setup lang="ts">
interface StatusOption {
  value: string;
  label: string;
}

interface Props {
  search: string;
  statusFilter: string;
  statusOptions: StatusOption[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  search: [];
  "update:search": [value: string];
  "update:statusFilter": [value: string];
}>();

const localSearch = computed({
  get: () => props.search,
  set: (value) => emit("update:search", value),
});

const localStatusFilter = computed({
  get: () => props.statusFilter,
  set: (value) => emit("update:statusFilter", value),
});
</script>

<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <div class="flex flex-col gap-4 sm:flex-row">
      <div class="relative flex-1">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Icon name="lucide:search" class="h-5 w-5 text-slate-400" />
        </div>
        <input
          v-model="localSearch"
          type="text"
          placeholder="Rechercher un tournoi..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          @keyup.enter="emit('search')"
        />
      </div>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Icon name="lucide:filter" class="h-5 w-5 text-slate-400" />
        </div>
        <select
          v-model="localStatusFilter"
          class="h-12 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-10 text-sm transition-all hover:border-slate-300 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
        @click="emit('search')"
      >
        <Icon name="lucide:search" class="h-4 w-4" />
        Rechercher
      </button>
    </div>
  </div>
</template>
