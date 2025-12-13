<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800",
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-slate-100 text-slate-600",
        success: "bg-success-100 text-success-800",
        warning: "bg-warning-100 text-warning-800",
        danger: "bg-danger-100 text-danger-800",
        outline: "border border-current bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

interface Props {
  variant?: BadgeVariants["variant"];
  size?: BadgeVariants["size"];
}

withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
});
</script>

<template>
  <span :class="cn(badgeVariants({ variant, size }))">
    <slot />
  </span>
</template>
