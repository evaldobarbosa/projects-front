<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api, type Project, type ProjectStats, type ProjectFilters } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()

const projects = ref<Project[]>([])
const stats = ref<ProjectStats>({
  total: 0,
  draft: 0,
  in_field: 0,
  finished: 0,
  archived: 0,
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})
const isLoading = ref(false)
const error = ref<string | null>(null)

const filters = ref<ProjectFilters>({
  search: '',
  status: '',
  page: 1,
})

async function loadProjects() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.getProjects(filters.value)
    projects.value = response.projects.data
    stats.value = response.stats
    pagination.value = {
      current_page: response.projects.current_page,
      last_page: response.projects.last_page,
      per_page: response.projects.per_page,
      total: response.projects.total,
    }
  } catch (err) {
    error.value = 'Erro ao carregar projetos.'
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
    month: 'short',
    year: 'numeric',
  })
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

function applyFilters() {
  filters.value.page = 1
  loadProjects()
}

function clearFilters() {
  filters.value = {
    search: '',
    status: '',
    page: 1,
  }
  loadProjects()
}

function goToPage(page: number) {
  if (page >= 1 && page <= pagination.value.last_page) {
    filters.value.page = page
    loadProjects()
  }
}

function viewProject(project: Project) {
  router.push(`/projects/${project.id}`)
}

async function deleteProject(project: Project) {
  if (!confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
    return
  }

  try {
    await api.deleteProject(project.id)
    loadProjects()
  } catch (err) {
    error.value = 'Erro ao excluir projeto.'
    console.error(err)
  }
}

const paginationPages = computed(() => {
  const pages: (number | string)[] = []
  const current = pagination.value.current_page
  const last = pagination.value.last_page

  if (last <= 5) {
    for (let i = 1; i <= last; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < last - 2) pages.push('...')
    pages.push(last)
  }

  return pages
})

onMounted(() => {
  loadProjects()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Projetos</h1>
        <p class="mt-1 text-muted-foreground">Gerencie seus projetos de pesquisa e questionários.</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline">
          <span class="material-symbols-outlined text-[18px] mr-2">download</span>
          Exportar
        </Button>
        <RouterLink to="/projects/new">
          <Button>
            <span class="material-symbols-outlined text-[18px] mr-2">add</span>
            Novo Projeto
          </Button>
        </RouterLink>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
            <div class="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">folder</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.total }}</div>
          <div class="text-muted-foreground text-sm mt-1">projetos</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rascunho</span>
            <div class="w-8 h-8 bg-muted text-muted-foreground rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.draft }}</div>
          <div class="text-muted-foreground text-sm mt-1">em elaboração</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Em Campo</span>
            <div class="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">play_circle</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.in_field }}</div>
          <div class="text-muted-foreground text-sm mt-1">coletando dados</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Concluídos</span>
            <div class="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.finished }}</div>
          <div class="text-muted-foreground text-sm mt-1">finalizados</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Arquivados</span>
            <div class="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">archive</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.archived }}</div>
          <div class="text-muted-foreground text-sm mt-1">arquivados</div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card class="mb-6 border-border">
      <CardContent class="p-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border border-border">
              <span class="text-sm text-muted-foreground">Status:</span>
              <select
                v-model="filters.status"
                class="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-foreground"
                @change="applyFilters"
              >
                <option value="">Todos</option>
                <option value="draft">Rascunho</option>
                <option value="in_field">Em Campo</option>
                <option value="finished">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            <div class="relative">
              <Input
                v-model="filters.search"
                placeholder="Buscar projetos..."
                class="pl-10 w-64"
                @keyup.enter="applyFilters"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <span class="material-symbols-outlined text-[18px]">search</span>
              </span>
            </div>
          </div>

          <button
            class="text-primary text-sm hover:underline"
            @click="clearFilters"
          >
            Limpar Filtros
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive" class="mb-6">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Table -->
    <Card class="border-border">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted border-b border-border">
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Projeto</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsável</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Período</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contratos</th>
              <th class="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                Carregando...
              </td>
            </tr>
            <tr v-else-if="projects.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center">
                  <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-[32px] text-muted-foreground">folder_off</span>
                  </div>
                  <h3 class="text-lg font-semibold text-foreground mb-2">Nenhum projeto encontrado</h3>
                  <p class="text-muted-foreground mb-4">Crie seu primeiro projeto de pesquisa para começar.</p>
                  <RouterLink to="/projects/new">
                    <Button>
                      <span class="material-symbols-outlined text-[18px] mr-2">add</span>
                      Criar Projeto
                    </Button>
                  </RouterLink>
                </div>
              </td>
            </tr>
            <tr
              v-for="project in projects"
              :key="project.id"
              class="hover:bg-muted/50 transition-colors group cursor-pointer"
              @click="viewProject(project)"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-foreground">{{ project.name }}</span>
                  <span class="text-sm text-muted-foreground line-clamp-1">{{ project.description || '—' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-foreground">
                {{ project.owner?.name || '—' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm text-foreground">{{ formatDate(project.start_date) }}</span>
                  <span class="text-xs text-muted-foreground">até {{ formatDate(project.end_date) }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.contracts && project.contracts.length > 0" class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-muted-foreground text-[18px]">contract</span>
                  <span class="text-sm text-foreground">{{ project.contracts[0]?.name }}</span>
                  <span v-if="project.contracts.length > 1" class="text-xs text-muted-foreground">
                    +{{ project.contracts.length - 1 }}
                  </span>
                </div>
                <span v-else class="text-sm text-muted-foreground">—</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(project.status)"
                >
                  {{ getStatusLabel(project.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                    title="Ver Detalhes"
                    @click="viewProject(project)"
                  >
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <RouterLink :to="`/projects/${project.id}/edit`">
                    <button
                      class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                      title="Editar"
                    >
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </RouterLink>
                  <button
                    class="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    title="Excluir"
                    @click="deleteProject(project)"
                  >
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="projects.length > 0" class="px-6 py-4 border-t border-border bg-muted flex items-center justify-between">
        <span class="text-sm text-muted-foreground">
          Mostrando {{ (pagination.current_page - 1) * pagination.per_page + 1 }}-{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de {{ pagination.total }} projetos
        </span>
        <div class="flex items-center gap-2">
          <button
            class="p-1 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
            :disabled="pagination.current_page === 1"
            @click="goToPage(pagination.current_page - 1)"
          >
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <template v-for="page in paginationPages" :key="page">
            <span v-if="page === '...'" class="text-muted-foreground">...</span>
            <button
              v-else
              class="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
              :class="page === pagination.current_page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </button>
          </template>
          <button
            class="p-1 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
            :disabled="pagination.current_page === pagination.last_page"
            @click="goToPage(pagination.current_page + 1)"
          >
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>
