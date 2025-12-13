<script setup lang="ts">
definePageMeta({
  title: "Créer un tournoi",
  middleware: ["admin"],
});

const api = useApi();
const router = useRouter();

const form = reactive({
  name: "",
  description: "",
  date: "",
});

const errors = reactive<Record<string, string>>({});
const loading = ref(false);
const apiError = ref("");

function validateForm(): boolean {
  // Reset errors
  Object.keys(errors).forEach((key) => delete errors[key]);
  apiError.value = "";

  let isValid = true;

  if (!form.name.trim()) {
    errors.name = "Le nom est requis";
    isValid = false;
  } else if (form.name.length < 3) {
    errors.name = "Le nom doit faire au moins 3 caractères";
    isValid = false;
  }

  if (!form.date) {
    errors.date = "La date est requise";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validateForm()) return;

  loading.value = true;

  try {
    const response = await api.tournaments.create({
      name: form.name,
      description: form.description || undefined,
      date: new Date(form.date).toISOString(),
    });

    if (response.success && response.data) {
      await router.push(`/tournaments/${response.data.id}`);
    }
  } catch (error: unknown) {
    const fetchError = error as { data?: { error?: { message?: string } } };
    apiError.value = fetchError?.data?.error?.message || "Une erreur est survenue";
  } finally {
    loading.value = false;
  }
}

// Set default date to today
onMounted(() => {
  const today = new Date();
  form.date = today.toISOString().split("T")[0] ?? "";
});
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-8">
      <NuxtLink
        to="/tournaments"
        class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Retour aux tournois
      </NuxtLink>
      <h1 class="text-2xl font-bold text-slate-900">Créer un tournoi</h1>
      <p class="mt-1 text-slate-500">
        Remplissez les informations pour créer votre nouveau tournoi.
      </p>
    </div>

    <Card>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- API Error -->
        <div
          v-if="apiError"
          class="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"
        >
          {{ apiError }}
        </div>

        <!-- Name -->
        <FormField label="Nom du tournoi" html-for="name" required :error="errors.name">
          <Input
            id="name"
            v-model="form.name"
            placeholder="Ex: Tournoi de Noël 2024"
            :error="errors.name"
          />
        </FormField>

        <!-- Date -->
        <FormField label="Date du tournoi" html-for="date" required :error="errors.date">
          <input
            id="date"
            v-model="form.date"
            type="date"
            class="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
          />
        </FormField>

        <!-- Description -->
        <FormField label="Description" html-for="description" :error="errors.description">
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            placeholder="Décrivez votre tournoi..."
            class="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
          />
        </FormField>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <Button variant="outline" type="button" to="/tournaments">
            Annuler
          </Button>
          <Button type="submit" :loading="loading">
            Créer le tournoi
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>
