<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      color: {
        primary: "text-primary-600",
        white: "text-white",
        slate: "text-slate-600",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
);

type SpinnerVariants = VariantProps<typeof spinnerVariants>;

interface Props {
  size?: SpinnerVariants["size"];
  color?: SpinnerVariants["color"];
}

withDefaults(defineProps<Props>(), {
  size: "md",
  color: "primary",
});
</script>

<template>
  <span
    role="status"
    aria-label="Loading"
    :class="cn(spinnerVariants({ size, color }))"
  />
</template>
