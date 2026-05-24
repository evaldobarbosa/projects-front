<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Project } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const route = useRoute()
const router = useRouter()

const project = ref<Project | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const projectId = computed(() => Number(route.params.id))

async function loadProject() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.getProject(projectId.value)
    project.value = response.project
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
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div class="flex items-start gap-4">
          <button
            class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            @click="router.push('/projects')"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold text-foreground">{{ project.name }}</h1>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusBadgeClass(project.status)"
              >
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
            <p class="text-muted-foreground">{{ project.description || 'Sem descrição' }}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <Button variant="outline" @click="deleteProject">
            <span class="material-symbols-outlined text-[18px] mr-2">delete</span>
            Excluir
          </Button>
          <RouterLink :to="`/projects/${project.id}/edit`">
            <Button variant="outline">
              <span class="material-symbols-outlined text-[18px] mr-2">edit</span>
              Editar
            </Button>
          </RouterLink>
          <Button v-if="project.status === 'draft'">
            <span class="material-symbols-outlined text-[18px] mr-2">play_arrow</span>
            Iniciar Coleta
          </Button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card class="border-border">
          <CardContent class="p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Questionários</span>
              <div class="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">description</span>
              </div>
            </div>
            <div class="text-3xl font-bold text-foreground">0</div>
            <div class="text-muted-foreground text-sm mt-1">formulários criados</div>
          </CardContent>
        </Card>

        <Card class="border-border">
          <CardContent class="p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Respostas</span>
              <div class="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">inbox</span>
              </div>
            </div>
            <div class="text-3xl font-bold text-foreground">0</div>
            <div class="text-muted-foreground text-sm mt-1">coletadas</div>
          </CardContent>
        </Card>

        <Card class="border-border">
          <CardContent class="p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Equipe</span>
              <div class="w-8 h-8 bg-warning/10 text-warning rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">group</span>
              </div>
            </div>
            <div class="text-3xl font-bold text-foreground">1</div>
            <div class="text-muted-foreground text-sm mt-1">membros</div>
          </CardContent>
        </Card>

        <Card class="border-border">
          <CardContent class="p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contratos</span>
              <div class="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">contract</span>
              </div>
            </div>
            <div class="text-3xl font-bold text-foreground">{{ project.contracts?.length || 0 }}</div>
            <div class="text-muted-foreground text-sm mt-1">vinculados</div>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Info + Contracts -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Project Info -->
          <Card class="border-border">
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Responsável</dt>
                  <dd class="mt-1 text-foreground flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium">{{ project.owner?.name?.charAt(0) || '?' }}</span>
                    </div>
                    {{ project.owner?.name || '—' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Criado em</dt>
                  <dd class="mt-1 text-foreground">{{ formatDate(project.created_at) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Data de Início</dt>
                  <dd class="mt-1 text-foreground">{{ formatDate(project.start_date) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Data de Término</dt>
                  <dd class="mt-1 text-foreground">{{ formatDate(project.end_date) }}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <!-- Contracts -->
          <Card class="border-border">
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Contratos Vinculados</CardTitle>
                <Button variant="outline" size="sm">
                  <span class="material-symbols-outlined text-[16px] mr-1">add</span>
                  Vincular Contrato
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div v-if="project.contracts && project.contracts.length > 0" class="space-y-3">
                <div
                  v-for="contract in project.contracts"
                  :key="contract.id"
                  class="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <span class="material-symbols-outlined text-secondary-foreground">contract</span>
                    </div>
                    <div>
                      <div class="font-medium text-foreground">{{ contract.code }}</div>
                      <div class="text-sm text-muted-foreground">{{ contract.name }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <div class="font-medium text-foreground">{{ formatCurrency(contract.value) }}</div>
                      <div class="text-xs text-muted-foreground">
                        {{ formatDate(contract.start_date) }} - {{ formatDate(contract.end_date) }}
                      </div>
                    </div>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getContractStatusClass(contract.status || '')"
                    >
                      {{ getContractStatusLabel(contract.status || '') }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <span class="material-symbols-outlined text-muted-foreground">contract</span>
                </div>
                <p class="text-muted-foreground mb-4">Nenhum contrato vinculado</p>
                <Button variant="outline" size="sm">
                  <span class="material-symbols-outlined text-[16px] mr-1">add</span>
                  Vincular Contrato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <Card class="border-border">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <Button variant="outline" class="w-full justify-start">
                <span class="material-symbols-outlined text-[18px] mr-3">add</span>
                Criar Questionário
              </Button>
              <Button variant="outline" class="w-full justify-start">
                <span class="material-symbols-outlined text-[18px] mr-3">person_add</span>
                Adicionar Membro
              </Button>
              <Button variant="outline" class="w-full justify-start">
                <span class="material-symbols-outlined text-[18px] mr-3">analytics</span>
                Ver Relatórios
              </Button>
              <Button variant="outline" class="w-full justify-start">
                <span class="material-symbols-outlined text-[18px] mr-3">download</span>
                Exportar Dados
              </Button>
            </CardContent>
          </Card>

          <!-- Team -->
          <Card class="border-border">
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Equipe</CardTitle>
                <Button variant="ghost" size="sm">
                  <span class="material-symbols-outlined text-[16px]">add</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium">{{ project.owner?.name?.charAt(0) || '?' }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-foreground">{{ project.owner?.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ project.owner?.email }}</div>
                  </div>
                  <span class="text-xs text-primary font-medium">Responsável</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Activity -->
          <Card class="border-border">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-center py-6">
                <span class="material-symbols-outlined text-muted-foreground text-[32px]">history</span>
                <p class="text-sm text-muted-foreground mt-2">Nenhuma atividade recente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
