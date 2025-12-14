<script setup lang="ts">
interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

interface Props {
  pagination: Pagination;
  currentPage: number;
}

defineProps<Props>();

const emit = defineEmits<{
  goToPage: [page: number];
}>();
</script>

<template>
  <div
    v-if="pagination.totalPages > 1"
    class="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row"
  >
    <p class="text-sm text-slate-500">
      Page {{ pagination.page }} sur {{ pagination.totalPages }}
      <span class="text-slate-400">({{ pagination.total }} éléments)</span>
    </p>
    <div class="flex gap-2">
      <button
        :disabled="currentPage === 1"
        :class="[
          'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
          currentPage === 1
            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
            : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600',
        ]"
        @click="emit('goToPage', currentPage - 1)"
      >
        <Icon name="lucide:chevron-left" class="h-4 w-4" />
        Précédent
      </button>
      <button
        :disabled="currentPage >= pagination.totalPages"
        :class="[
          'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
          currentPage >= pagination.totalPages
            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
            : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600',
        ]"
        @click="emit('goToPage', currentPage + 1)"
      >
        Suivant
        <Icon name="lucide:chevron-right" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
