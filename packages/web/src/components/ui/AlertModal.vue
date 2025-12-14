<script setup lang="ts">
type AlertType = "error" | "success" | "warning" | "info";

interface Props {
  show: boolean;
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  type: "error",
  confirmText: "OK",
});

const emit = defineEmits<{
  close: [];
}>();

const iconConfig = computed(() => {
  const configs: Record<AlertType, { name: string; bgClass: string; iconClass: string }> = {
    error: {
      name: "lucide:alert-circle",
      bgClass: "bg-danger-100",
      iconClass: "text-danger-600",
    },
    success: {
      name: "lucide:check-circle",
      bgClass: "bg-success-100",
      iconClass: "text-success-600",
    },
    warning: {
      name: "lucide:alert-triangle",
      bgClass: "bg-warning-100",
      iconClass: "text-warning-600",
    },
    info: {
      name: "lucide:info",
      bgClass: "bg-primary-100",
      iconClass: "text-primary-600",
    },
  };
  return configs[props.type];
});

const defaultTitle = computed(() => {
  if (props.title) return props.title;
  const titles: Record<AlertType, string> = {
    error: "Erreur",
    success: "Succès",
    warning: "Attention",
    info: "Information",
  };
  return titles[props.type];
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
          @click.self="emit('close')"
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
              <h3 class="text-lg font-semibold text-slate-900">{{ defaultTitle }}</h3>
            </div>
            <p class="mb-6 text-sm text-slate-600">{{ message }}</p>
            <div class="flex justify-end">
              <Button @click="emit('close')">
                {{ confirmText }}
              </Button>
            </div>
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
