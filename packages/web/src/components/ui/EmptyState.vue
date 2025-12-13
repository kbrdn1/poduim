<script setup lang="ts">
interface Props {
  icon?: string;
  title: string;
  description?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div v-if="icon" class="mb-4 flex items-center justify-center">
      <Icon :name="icon" class="h-12 w-12 text-slate-400" />
    </div>
    <div v-else class="mb-4 flex items-center justify-center">
      <Icon name="lucide:inbox" class="h-12 w-12 text-slate-400" />
    </div>
    <h3 class="text-lg font-medium text-slate-900">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-1 text-sm text-slate-500">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>
