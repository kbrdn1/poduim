<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/cn";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-white text-slate-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-slate-300 hover:border-slate-400",
        error: "border-danger-500 focus-visible:ring-danger-500",
      },
      inputSize: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

type InputVariants = VariantProps<typeof inputVariants>;

interface Props {
  modelValue?: string | number;
  variant?: InputVariants["variant"];
  inputSize?: InputVariants["inputSize"];
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  variant: "default",
  inputSize: "md",
  type: "text",
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const computedVariant = computed(() => {
  if (props.error) return "error";
  return props.variant;
});

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", props.type === "number" ? Number(target.value) : target.value);
}
</script>

<template>
  <div class="w-full">
    <input
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="cn(inputVariants({ variant: computedVariant, inputSize }))"
      @input="handleInput"
    />
    <p v-if="error" class="mt-1.5 text-xs text-danger-600">
      {{ error }}
    </p>
  </div>
</template>
