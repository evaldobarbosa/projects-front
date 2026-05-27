<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, type Project, type QuestionnairePayload, type ApiError } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()
const route = useRoute()

const isEditing = computed(() => !!route.params.id)
const questionnaireId = computed(() => route.params.id ? Number(route.params.id) : null)

const form = ref<QuestionnairePayload>({
  project_id: route.query.project_id ? Number(route.query.project_id) : 0,
  title: '',
  description: '',
})

const projects = ref<Project[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)

async function loadProjects() {
  try {
    const response = await api.getProjects({ per_page: 100 })
    projects.value = response.projects.data
  } catch (err) {
    console.error('Erro ao carregar projetos:', err)
  }
}

async function loadQuestionnaire() {
  if (!questionnaireId.value) return

  isLoading.value = true
  try {
    const response = await api.getQuestionnaire(questionnaireId.value)
    form.value = {
      project_id: response.questionnaire.project_id,
      title: response.questionnaire.title,
      description: response.questionnaire.description || '',
    }
  } catch (err) {
    error.value = 'Erro ao carregar questionario.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  isSaving.value = true
  error.value = null

  try {
    if (isEditing.value && questionnaireId.value) {
      await api.updateQuestionnaire(questionnaireId.value, {
        title: form.value.title,
        description: form.value.description,
      })
      router.push(`/questionnaires/${questionnaireId.value}`)
    } else {
      const response = await api.createQuestionnaire(form.value)
      // Redirect to builder after creation
      router.push(`/questionnaires/${response.questionnaire.id}/builder`)
    }
  } catch (err) {
    const apiError = err as ApiError
    error.value = apiError.message || 'Erro ao salvar questionario.'
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  router.back()
}

onMounted(() => {
  loadProjects()
  if (isEditing.value) {
    loadQuestionnaire()
  }
})
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <Alert v-if="error" variant="destructive" class="mb-6">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <CardTitle>Informacoes do Questionario</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <Label for="project_id">Projeto *</Label>
            <select
              id="project_id"
              v-model="form.project_id"
              class="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              :disabled="isEditing"
              required
            >
              <option :value="0" disabled>Selecione um projeto...</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div>
            <Label for="title">Titulo *</Label>
            <Input
              id="title"
              v-model="form.title"
              placeholder="Digite o titulo do questionario"
              class="mt-1"
              required
            />
          </div>

          <div>
            <Label for="description">Descricao</Label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Descreva o questionario..."
              rows="3"
              class="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" @click="handleCancel">
              Cancelar
            </Button>
            <Button type="submit" :disabled="isSaving || form.project_id === 0">
              {{ isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alteracoes' : 'Criar e Abrir Builder') }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
