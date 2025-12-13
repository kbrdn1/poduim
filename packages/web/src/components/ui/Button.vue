<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
        secondary: "bg-slate-600 text-white hover:bg-slate-700 shadow-sm",
        success: "bg-success-600 text-white hover:bg-success-700 shadow-sm",
        danger: "bg-danger-600 text-white hover:bg-danger-700 shadow-sm",
        warning: "bg-warning-500 text-white hover:bg-warning-600 shadow-sm",
        outline:
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
        ghost: "text-slate-700 hover:bg-slate-100",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface Props {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  as?: "button" | "a" | "nuxt-link";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  href?: string;
  to?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  as: "button",
  disabled: false,
  loading: false,
  type: "button",
});

const componentType = computed(() => {
  if (props.to) return resolveComponent("NuxtLink");
  if (props.href) return "a";
  return props.as;
});
</script>

<template>
  <component
    :is="componentType"
    :class="cn(buttonVariants({ variant, size }))"
    :disabled="disabled || loading"
    :type="as === 'button' ? type : undefined"
    :href="href"
    :to="to"
  >
    <span v-if="loading" class="spinner" />
    <slot />
  </component>
</template>
