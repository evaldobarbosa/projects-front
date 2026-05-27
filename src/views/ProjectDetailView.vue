<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Project, type Questionnaire } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const route = useRoute()
const router = useRouter()

const project = ref<Project | null>(null)
const questionnaires = ref<Questionnaire[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const projectId = computed(() => Number(route.params.id))

const totalResponses = computed(() => {
  return questionnaires.value.reduce((acc, q: any) => acc + (q.responses_count || 0), 0)
})

function getQuestionnaireStatusBadge(status: string) {
  const badges: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-success/10 text-success',
    archived: 'bg-secondary/10 text-secondary',
  }
  return badges[status] || 'bg-muted text-muted-foreground'
}

function getQuestionnaireStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
  }
  return labels[status] || status
}

function handleCreateQuestionnaire() {
  router.push(`/questionnaires/new?project_id=${projectId.value}`)
}

async function loadProject() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.getProject(projectId.value)
    project.value = response.project

    // Load questionnaires
    const questionnairesResponse = await api.getQuestionnaires({
      project_id: projectId.value,
      per_page: 100,
    })
    questionnaires.value = questionnairesResponse.questionnaires.data
  } catch (err) {
    error.value = 'Erro ao carregar projeto.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatCurrency(value: number | undefined): string {
  if (!value) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    in_field: 'bg-primary/10 text-primary',
    finished: 'bg-success/10 text-success',
    archived: 'bg-secondary text-secondary-foreground',
  }
  return classes[status] || 'bg-muted text-muted-foreground'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    in_field: 'Em Campo',
    finished: 'Concluído',
    archived: 'Arquivado',
  }
  return labels[status] || status
}

function getContractStatusClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    expired: 'bg-muted text-muted-foreground',
    draft: 'bg-primary/10 text-primary',
    cancelled: 'bg-destructive/10 text-destructive',
  }
  return classes[status] || 'bg-muted text-muted-foreground'
}

function getContractStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Ativo',
    pending: 'Pendente',
    expired: 'Expirado',
    draft: 'Rascunho',
    cancelled: 'Cancelado',
  }
  return labels[status] || status
}

async function deleteProject() {
  if (!project.value) return

  if (!confirm(`Tem certeza que deseja excluir o projeto "${project.value.name}"?`)) {
    return
  }

  try {
    await api.deleteProject(project.value.id)
    router.push('/projects')
  } catch (err) {
    error.value = 'Erro ao excluir projeto.'
    console.error(err)
  }
}

onMounted(() => {
  loadProject()
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Carregando...</div>
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive" class="mb-6">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Project Details -->
    <template v-else-if="project">
      <!-- Actions Bar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <button
            class="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            @click="router.push('/projects')"
          >
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getStatusBadgeClass(project.status)"
          >
            {{ getStatusLabel(project.status) }}
          </span>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="deleteProject">
            <span class="material-symbols-outlined text-[16px] mr-1.5">delete</span>
            Excluir
          </Button>
          <RouterLink :to="`/projects/${project.id}/edit`">
            <Button variant="outline" size="sm">
              <span class="material-symbols-outlined text-[16px] mr-1.5">edit</span>
              Editar
            </Button>
          </RouterLink>
          <Button v-if="project.status === 'draft'" size="sm">
            <span class="material-symbols-outlined text-[16px] mr-1.5">play_arrow</span>
            Iniciar Coleta
          </Button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Left Column: Info + Contracts -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Project Info -->
          <Card class="border-border">
            <CardHeader class="pb-3">
              <CardTitle class="text-base">Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent class="pt-0">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Responsável</dt>
                  <dd class="text-foreground flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-xs font-medium">{{ project.owner?.name?.charAt(0) || '?' }}</span>
                    </div>
                    <span class="truncate">{{ project.owner?.name || '—' }}</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Criado em</dt>
                  <dd class="text-foreground">{{ formatDate(project.created_at) }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Data de Início</dt>
                  <dd class="text-foreground">{{ formatDate(project.start_date) }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Data de Término</dt>
                  <dd class="text-foreground">{{ formatDate(project.end_date) }}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <!-- Questionnaires -->
          <Card class="border-border">
            <CardHeader class="pb-3">
              <div class="flex items-center justify-between">
                <div>
                  <CardTitle class="text-base">Questionários</CardTitle>
                  <CardDescription class="mt-1 text-xs">
                    {{ questionnaires.length }} {{ questionnaires.length === 1 ? 'questionário' : 'questionários' }}
                    • {{ totalResponses }} {{ totalResponses === 1 ? 'resposta' : 'respostas' }}
                  </CardDescription>
                </div>
                <Button size="sm" @click="handleCreateQuestionnaire">
                  <span class="material-symbols-outlined text-[16px] mr-1">add</span>
                  Novo
                </Button>
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <div v-if="questionnaires.length > 0" class="space-y-2">
                <div
                  v-for="questionnaire in questionnaires"
                  :key="questionnaire.id"
                  class="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                  @click="router.push(`/questionnaires/${questionnaire.id}/builder`)"
                >
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span class="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-sm text-foreground truncate">{{ questionnaire.title }}</div>
                      <div class="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{{ questionnaire.versions_count || 0 }} {{ questionnaire.versions_count === 1 ? 'versão' : 'versões' }}</span>
                        <span>•</span>
                        <span>{{ (questionnaire as any).responses_count || 0 }} {{ (questionnaire as any).responses_count === 1 ? 'resposta' : 'respostas' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                      :class="getQuestionnaireStatusBadge(questionnaire.status)"
                    >
                      {{ getQuestionnaireStatusLabel(questionnaire.status) }}
                    </span>
                    <span class="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6">
                <div class="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                  <span class="material-symbols-outlined text-muted-foreground text-[20px]">description</span>
                </div>
                <p class="text-sm text-muted-foreground mb-3">Nenhum questionário criado</p>
                <Button variant="outline" size="sm" @click="handleCreateQuestionnaire">
                  <span class="material-symbols-outlined text-[16px] mr-1">add</span>
                  Criar Primeiro Questionário
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Contracts -->
          <Card class="border-border">
            <CardHeader class="pb-3">
              <div class="flex items-center justify-between">
                <CardTitle class="text-base">Contratos Vinculados</CardTitle>
                <Button variant="outline" size="sm">
                  <span class="material-symbols-outlined text-[16px] mr-1">add</span>
                  Vincular
                </Button>
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <div v-if="project.contracts && project.contracts.length > 0" class="space-y-2">
                <div
                  v-for="contract in project.contracts"
                  :key="contract.id"
                  class="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span class="material-symbols-outlined text-[18px] text-secondary">contract</span>
                    </div>
                    <div>
                      <div class="font-medium text-sm text-foreground">{{ contract.code }}</div>
                      <div class="text-xs text-muted-foreground">{{ contract.name }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <div class="font-medium text-sm text-foreground">{{ formatCurrency(contract.value) }}</div>
                      <div class="text-[10px] text-muted-foreground">
                        {{ formatDate(contract.start_date) }} - {{ formatDate(contract.end_date) }}
                      </div>
                    </div>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                      :class="getContractStatusClass(contract.status || '')"
                    >
                      {{ getContractStatusLabel(contract.status || '') }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6">
                <div class="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                  <span class="material-symbols-outlined text-[20px] text-muted-foreground">contract</span>
                </div>
                <p class="text-sm text-muted-foreground mb-3">Nenhum contrato vinculado</p>
                <Button variant="outline" size="sm">
                  <span class="material-symbols-outlined text-[16px] mr-1">add</span>
                  Vincular Contrato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="space-y-5">
          <!-- Quick Actions -->
          <Card class="border-border">
            <CardHeader class="pb-3">
              <CardTitle class="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent class="space-y-1.5 pt-0">
              <Button variant="outline" size="sm" class="w-full justify-start text-sm">
                <span class="material-symbols-outlined text-[16px] mr-2">analytics</span>
                Ver Relatórios
              </Button>
              <Button variant="outline" size="sm" class="w-full justify-start text-sm">
                <span class="material-symbols-outlined text-[16px] mr-2">download</span>
                Exportar Dados
              </Button>
            </CardContent>
          </Card>

          <!-- Team -->
          <Card class="border-border">
            <CardHeader class="pb-3">
              <div class="flex items-center justify-between">
                <CardTitle class="text-base">Equipe</CardTitle>
                <Button variant="ghost" size="sm">
                  <span class="material-symbols-outlined text-[16px]">add</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="space-y-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-medium">{{ project.owner?.name?.charAt(0) || '?' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm text-foreground truncate">{{ project.owner?.name }}</div>
                    <div class="text-xs text-muted-foreground truncate">{{ project.owner?.email }}</div>
                  </div>
                  <span class="text-[10px] text-primary font-medium uppercase tracking-wide">Admin</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Activity -->
          <Card class="border-border">
            <CardHeader class="pb-3">
              <CardTitle class="text-base">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="text-center py-5">
                <span class="material-symbols-outlined text-muted-foreground text-[24px]">history</span>
                <p class="text-xs text-muted-foreground mt-1.5">Nenhuma atividade recente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
