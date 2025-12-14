<script setup lang="ts">
type ConfirmType = "danger" | "warning" | "info";

interface Props {
  show: boolean;
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "danger",
  confirmText: "Confirmer",
  cancelText: "Annuler",
  loading: false,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const iconConfig = computed(() => {
  const configs: Record<ConfirmType, { name: string; bgClass: string; iconClass: string }> = {
    danger: {
      name: "lucide:alert-triangle",
      bgClass: "bg-danger-100",
      iconClass: "text-danger-600",
    },
    warning: {
      name: "lucide:alert-circle",
      bgClass: "bg-warning-100",
      iconClass: "text-warning-600",
    },
    info: {
      name: "lucide:help-circle",
      bgClass: "bg-primary-100",
      iconClass: "text-primary-600",
    },
  };
  return configs[props.type];
});

const confirmButtonVariant = computed(() => {
  const variants: Record<ConfirmType, "danger" | "primary"> = {
    danger: "danger",
    warning: "danger",
    info: "primary",
  };
  return variants[props.type];
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
          @click.self="!loading && emit('cancel')"
        >
          <Card class="w-full max-w-sm animate-slide-up p-6">
            <div class="mb-4 flex items-center gap-3">
              <div
                :class="[
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  iconConfig.bgClass,
                ]"
              >
                <Icon :name="iconConfig.name" :class="['h-5 w-5', iconConfig.iconClass]" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
            </div>
            <p class="mb-6 text-sm text-slate-600">{{ message }}</p>
            <div class="flex justify-end gap-3">
              <Button variant="outline" :disabled="loading" @click="emit('cancel')">
                {{ cancelText }}
              </Button>
              <Button :variant="confirmButtonVariant" :loading="loading" @click="emit('confirm')">
                {{ confirmText }}
              </Button>
            </div>
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
