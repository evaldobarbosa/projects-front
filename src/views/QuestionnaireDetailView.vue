<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, type Questionnaire } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()
const route = useRoute()

const questionnaireId = Number(route.params.id)
const questionnaire = ref<Questionnaire | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

async function loadQuestionnaire() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.getQuestionnaire(questionnaireId)
    questionnaire.value = response.questionnaire
  } catch (err) {
    error.value = 'Erro ao carregar questionario.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-success/10 text-success',
    archived: 'bg-secondary text-secondary-foreground',
  }
  return classes[status] || 'bg-muted text-muted-foreground'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
  }
  return labels[status] || status
}

function openBuilder() {
  router.push(`/questionnaires/${questionnaireId}/builder`)
}

function openPreview() {
  router.push(`/questionnaires/${questionnaireId}/preview`)
}

function editQuestionnaire() {
  router.push(`/questionnaires/${questionnaireId}/edit`)
}

async function deleteQuestionnaire() {
  if (!questionnaire.value) return

  if (!confirm(`Tem certeza que deseja excluir o questionario "${questionnaire.value.title}"?`)) {
    return
  }

  try {
    await api.deleteQuestionnaire(questionnaireId)
    router.push('/questionnaires')
  } catch (err) {
    error.value = 'Erro ao excluir questionario.'
    console.error(err)
  }
}

onMounted(() => {
  loadQuestionnaire()
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-muted-foreground">Carregando...</p>
      </div>
    </div>

    <!-- Error -->
    <Alert v-else-if="error" variant="destructive" class="mb-6">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Content -->
    <template v-else-if="questionnaire">
      <!-- Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <RouterLink to="/questionnaires" class="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </RouterLink>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getStatusBadgeClass(questionnaire.status)"
          >
            {{ getStatusLabel(questionnaire.status) }}
          </span>
        </div>

        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="openPreview">
            <span class="material-symbols-outlined text-[16px] mr-1.5">visibility</span>
            Preview
          </Button>
          <Button size="sm" @click="openBuilder">
            <span class="material-symbols-outlined text-[16px] mr-1.5">edit_square</span>
            Abrir Builder
          </Button>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined">folder</span>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Projeto</p>
                <p class="font-semibold text-foreground">{{ questionnaire.project?.name || '-' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined">history</span>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Versao Ativa</p>
                <p class="font-semibold text-foreground">
                  v{{ questionnaire.active_version?.version_number || 1 }}
                  <span v-if="questionnaire.active_version?.published_at" class="text-xs text-success ml-1">(publicada)</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted text-muted-foreground rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Atualizado em</p>
                <p class="font-semibold text-foreground">{{ formatDate(questionnaire.updated_at) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Versions History -->
      <Card class="mb-8">
        <CardHeader>
          <CardTitle>Historico de Versoes</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="questionnaire.versions && questionnaire.versions.length > 0" class="space-y-3">
            <div
              v-for="version in questionnaire.versions"
              :key="version.id"
              class="flex items-center justify-between p-3 border border-border rounded-lg"
              :class="{ 'bg-primary/5 border-primary/30': version.id === questionnaire.active_version_id }"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold">v{{ version.version_number }}</span>
                </div>
                <div>
                  <p class="text-sm text-foreground">
                    Criada por {{ version.created_by_user?.name || 'Usuario' }}
                  </p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(version.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="version.published_at" class="text-xs text-success bg-success/10 px-2 py-1 rounded">
                  Publicada
                </span>
                <span v-if="version.id === questionnaire.active_version_id" class="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                  Ativa
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground text-center py-4">
            Nenhuma versao encontrada.
          </p>
        </CardContent>
      </Card>

      <!-- Actions -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-foreground">Acoes</h3>
              <p class="text-sm text-muted-foreground">Gerencie este questionario</p>
            </div>
            <div class="flex gap-2">
              <Button variant="outline" @click="editQuestionnaire">
                <span class="material-symbols-outlined text-[18px] mr-2">edit</span>
                Editar Informacoes
              </Button>
              <Button variant="destructive" @click="deleteQuestionnaire">
                <span class="material-symbols-outlined text-[18px] mr-2">delete</span>
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
