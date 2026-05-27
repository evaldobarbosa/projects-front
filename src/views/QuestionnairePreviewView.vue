<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Questionnaire, type FormSchema, type Section } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

const route = useRoute()
const router = useRouter()

const questionnaireId = Number(route.params.id)
const questionnaire = ref<Questionnaire | null>(null)
const schema = ref<FormSchema | null>(null)
const currentSectionIndex = ref(0)
const isLoading = ref(true)
const error = ref<string | null>(null)

const currentSection = computed<Section | null>(() => {
  if (!schema.value) return null
  const section = schema.value.sections[currentSectionIndex.value]
  return section ?? null
})

const totalSections = computed(() => schema.value?.sections.length || 0)

const progress = computed(() => {
  if (totalSections.value === 0) return 0
  return ((currentSectionIndex.value + 1) / totalSections.value) * 100
})

async function loadQuestionnaire() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.getQuestionnaire(questionnaireId)
    questionnaire.value = response.questionnaire
    schema.value = response.questionnaire.active_version?.schema || null
  } catch (err) {
    error.value = 'Erro ao carregar questionario.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function nextSection() {
  if (currentSectionIndex.value < totalSections.value - 1) {
    currentSectionIndex.value++
  }
}

function prevSection() {
  if (currentSectionIndex.value > 0) {
    currentSectionIndex.value--
  }
}

function goBack() {
  router.push(`/questionnaires/${questionnaireId}`)
}

function getComponentIcon(type: string): string {
  const icons: Record<string, string> = {
    text: 'text_fields',
    email: 'mail',
    phone: 'phone',
    number: 'tag',
    date: 'calendar_month',
    time: 'schedule',
    textarea: 'notes',
    select: 'arrow_drop_down_circle',
    radio: 'radio_button_checked',
    checkbox: 'check_box',
    scale: 'linear_scale',
    rating: 'star',
  }
  return icons[type] || 'help'
}

onMounted(() => {
  loadQuestionnaire()
})
</script>

<template>
  <div class="min-h-screen bg-muted w-full">
    <!-- Header -->
    <header class="bg-card border-b border-border sticky top-0 z-10 w-full">
      <div class="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" @click="goBack">
          <span class="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
          Voltar
        </Button>
        <span class="text-sm text-muted-foreground">Preview</span>
        <div class="w-20"></div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-muted-foreground">Carregando...</p>
      </div>
    </div>

    <!-- Error -->
    <Alert v-else-if="error" variant="destructive" class="m-4">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Preview Content -->
    <template v-else-if="schema">
      <!-- Mobile Preview Container -->
      <div class="max-w-4xl mx-auto px-6 py-6 w-full">
        <!-- Questionnaire Title -->
        <div class="mb-6 text-center">
          <h1 class="text-xl font-bold text-foreground">{{ questionnaire?.title }}</h1>
          <p v-if="questionnaire?.description" class="text-sm text-muted-foreground mt-1">
            {{ questionnaire.description }}
          </p>
        </div>

        <!-- Progress Bar -->
        <div v-if="schema.settings?.showProgressBar" class="mb-6">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-muted-foreground">
              Secao {{ currentSectionIndex + 1 }} de {{ totalSections }}
            </span>
            <span class="text-xs text-muted-foreground">{{ Math.round(progress) }}%</span>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Current Section -->
        <div v-if="currentSection" class="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">{{ currentSection.title }}</h2>

          <!-- Components -->
          <div class="space-y-6">
            <div
              v-for="component in currentSection.components"
              :key="component.id"
              class="space-y-2"
            >
              <label class="flex items-center gap-1 text-sm font-medium text-foreground">
                {{ component.label }}
                <span v-if="component.required" class="text-destructive">*</span>
              </label>

              <!-- Text Input -->
              <Input
                v-if="component.type === 'text' || component.type === 'email' || component.type === 'phone'"
                :type="component.type === 'email' ? 'email' : component.type === 'phone' ? 'tel' : 'text'"
                :placeholder="(component.properties.placeholder as string) || ''"
                class="w-full"
              />

              <!-- Number Input -->
              <Input
                v-else-if="component.type === 'number'"
                type="number"
                :placeholder="(component.properties.placeholder as string) || ''"
                class="w-full"
              />

              <!-- Date Input -->
              <Input
                v-else-if="component.type === 'date'"
                type="date"
                class="w-full"
              />

              <!-- Time Input -->
              <Input
                v-else-if="component.type === 'time'"
                type="time"
                class="w-full"
              />

              <!-- Textarea -->
              <textarea
                v-else-if="component.type === 'textarea'"
                :placeholder="(component.properties.placeholder as string) || ''"
                :rows="(component.properties.rows as number) || 3"
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
              ></textarea>

              <!-- Select -->
              <select
                v-else-if="component.type === 'select'"
                class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">{{ (component.properties.placeholder as string) || 'Selecione...' }}</option>
                <option
                  v-for="option in (component.properties.options as Array<{value: string, label: string}>)"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>

              <!-- Radio -->
              <div
                v-else-if="component.type === 'radio'"
                class="space-y-2"
              >
                <label
                  v-for="option in (component.properties.options as Array<{value: string, label: string}>)"
                  :key="option.value"
                  class="flex items-center gap-2 cursor-pointer"
                >
                  <input type="radio" :name="component.name" :value="option.value" class="text-primary" />
                  <span class="text-sm text-foreground">{{ option.label }}</span>
                </label>
                <p v-if="!(component.properties.options as Array<{value: string, label: string}>)?.length" class="text-sm text-muted-foreground italic">
                  Nenhuma opcao configurada
                </p>
              </div>

              <!-- Checkbox -->
              <div
                v-else-if="component.type === 'checkbox'"
                class="space-y-2"
              >
                <label
                  v-for="option in (component.properties.options as Array<{value: string, label: string}>)"
                  :key="option.value"
                  class="flex items-center gap-2 cursor-pointer"
                >
                  <input type="checkbox" :value="option.value" class="rounded text-primary" />
                  <span class="text-sm text-foreground">{{ option.label }}</span>
                </label>
                <p v-if="!(component.properties.options as Array<{value: string, label: string}>)?.length" class="text-sm text-muted-foreground italic">
                  Nenhuma opcao configurada
                </p>
              </div>

              <!-- Scale -->
              <div
                v-else-if="component.type === 'scale'"
                class="flex items-center justify-between gap-2"
              >
                <span class="text-xs text-muted-foreground">{{ (component.properties.minLabel as string) || (component.properties.min as number) }}</span>
                <div class="flex gap-2">
                  <button
                    v-for="n in ((component.properties.max as number) || 5) - ((component.properties.min as number) || 1) + 1"
                    :key="n"
                    class="w-10 h-10 rounded-full border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {{ ((component.properties.min as number) || 1) + n - 1 }}
                  </button>
                </div>
                <span class="text-xs text-muted-foreground">{{ (component.properties.maxLabel as string) || (component.properties.max as number) }}</span>
              </div>

              <!-- Rating -->
              <div
                v-else-if="component.type === 'rating'"
                class="flex gap-1"
              >
                <button
                  v-for="n in ((component.properties.max as number) || 5)"
                  :key="n"
                  class="text-2xl text-muted-foreground hover:text-warning transition-colors"
                >
                  <span class="material-symbols-outlined">star</span>
                </button>
              </div>

              <!-- Fallback -->
              <div
                v-else
                class="p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground"
              >
                <span class="material-symbols-outlined text-[24px] block mb-1">{{ getComponentIcon(component.type) }}</span>
                <span class="text-sm">{{ component.type }}</span>
              </div>
            </div>
          </div>

          <!-- Empty Section -->
          <div v-if="currentSection.components.length === 0" class="text-center py-8 text-muted-foreground">
            <span class="material-symbols-outlined text-[32px] block mb-2">widgets</span>
            <p class="text-sm">Esta secao nao possui componentes</p>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between">
          <Button
            v-if="schema.settings?.allowBackNavigation"
            variant="outline"
            :disabled="currentSectionIndex === 0"
            @click="prevSection"
          >
            <span class="material-symbols-outlined text-[18px] mr-1">chevron_left</span>
            Anterior
          </Button>
          <div v-else></div>

          <Button
            v-if="currentSectionIndex < totalSections - 1"
            @click="nextSection"
          >
            Proximo
            <span class="material-symbols-outlined text-[18px] ml-1">chevron_right</span>
          </Button>
          <Button v-else>
            Enviar
            <span class="material-symbols-outlined text-[18px] ml-1">send</span>
          </Button>
        </div>
      </div>
    </template>

    <!-- Empty Schema -->
    <div v-else class="max-w-3xl mx-auto px-4 py-12 text-center">
      <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="material-symbols-outlined text-[32px] text-muted-foreground">assignment</span>
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">Questionario vazio</h3>
      <p class="text-muted-foreground mb-4">Este questionario ainda nao possui componentes.</p>
      <Button @click="router.push(`/questionnaires/${questionnaireId}/builder`)">
        Abrir Builder
      </Button>
    </div>
  </div>
</template>
