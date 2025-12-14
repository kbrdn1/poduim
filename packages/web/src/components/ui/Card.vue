<script setup lang="ts">
import { cn } from "~/utils/cn";

interface Props {
  class?: string;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  class: "",
  hoverable: false,
  padding: "md",
});

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};
</script>

<template>
  <div
    :class="
      cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        paddingClasses[padding],
        hoverable && 'transition-shadow duration-200 hover:shadow-md cursor-pointer',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
