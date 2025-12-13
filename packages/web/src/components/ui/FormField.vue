<script setup lang="ts">
interface Props {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="htmlFor"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-slate-500">
      {{ hint }}
    </p>
    <p v-if="error" class="text-xs text-danger-600">
      {{ error }}
    </p>
  </div>
</template>
