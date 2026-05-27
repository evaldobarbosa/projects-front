<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, type Questionnaire, type QuestionnaireStats, type QuestionnaireFilters } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()
const route = useRoute()

const questionnaires = ref<Questionnaire[]>([])
const stats = ref<QuestionnaireStats>({
  total: 0,
  draft: 0,
  published: 0,
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

const filters = ref<QuestionnaireFilters>({
  search: '',
  status: '',
  page: 1,
  project_id: route.query.project_id ? Number(route.query.project_id) : undefined,
})

async function loadQuestionnaires() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.getQuestionnaires(filters.value)
    questionnaires.value = response.questionnaires.data
    stats.value = response.stats
    pagination.value = {
      current_page: response.questionnaires.current_page,
      last_page: response.questionnaires.last_page,
      per_page: response.questionnaires.per_page,
      total: response.questionnaires.total,
    }
  } catch (err) {
    error.value = 'Erro ao carregar questionarios.'
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

function applyFilters() {
  filters.value.page = 1
  loadQuestionnaires()
}

function clearFilters() {
  filters.value = {
    search: '',
    status: '',
    page: 1,
    project_id: filters.value.project_id,
  }
  loadQuestionnaires()
}

function goToPage(page: number) {
  if (page >= 1 && page <= pagination.value.last_page) {
    filters.value.page = page
    loadQuestionnaires()
  }
}

function viewQuestionnaire(questionnaire: Questionnaire) {
  router.push(`/questionnaires/${questionnaire.id}`)
}

function openBuilder(questionnaire: Questionnaire) {
  router.push(`/questionnaires/${questionnaire.id}/builder`)
}

async function deleteQuestionnaire(questionnaire: Questionnaire) {
  if (!confirm(`Tem certeza que deseja excluir o questionario "${questionnaire.title}"?`)) {
    return
  }

  try {
    await api.deleteQuestionnaire(questionnaire.id)
    loadQuestionnaires()
  } catch (err) {
    error.value = 'Erro ao excluir questionario.'
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
  loadQuestionnaires()
})
</script>

<template>
  <div>
    <!-- Actions Bar -->
    <div class="flex justify-end mb-6">
      <RouterLink to="/questionnaires/new">
        <Button size="sm">
          <span class="material-symbols-outlined text-[16px] mr-1.5">add</span>
          Novo Questionário
        </Button>
      </RouterLink>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
            <div class="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">assignment</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.total }}</div>
          <div class="text-muted-foreground text-sm mt-1">questionarios</div>
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
          <div class="text-muted-foreground text-sm mt-1">em elaboracao</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Publicados</span>
            <div class="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.published }}</div>
          <div class="text-muted-foreground text-sm mt-1">em producao</div>
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
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            <div class="relative">
              <Input
                v-model="filters.search"
                placeholder="Buscar questionarios..."
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
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Questionario</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Projeto</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Versao</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Atualizado</th>
              <th class="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                Carregando...
              </td>
            </tr>
            <tr v-else-if="questionnaires.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center">
                  <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-[32px] text-muted-foreground">assignment</span>
                  </div>
                  <h3 class="text-lg font-semibold text-foreground mb-2">Nenhum questionario encontrado</h3>
                  <p class="text-muted-foreground mb-4">Crie seu primeiro questionario para comecar.</p>
                  <RouterLink to="/questionnaires/new">
                    <Button>
                      <span class="material-symbols-outlined text-[18px] mr-2">add</span>
                      Criar Questionario
                    </Button>
                  </RouterLink>
                </div>
              </td>
            </tr>
            <tr
              v-for="questionnaire in questionnaires"
              :key="questionnaire.id"
              class="hover:bg-muted/50 transition-colors group cursor-pointer"
              @click="viewQuestionnaire(questionnaire)"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-foreground">{{ questionnaire.title }}</span>
                  <span class="text-sm text-muted-foreground line-clamp-1">{{ questionnaire.description || '-' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-foreground">
                {{ questionnaire.project?.name || '-' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-foreground">v{{ questionnaire.active_version?.version_number || 1 }}</span>
                  <span v-if="questionnaire.versions_count && questionnaire.versions_count > 1" class="text-xs text-muted-foreground">
                    ({{ questionnaire.versions_count }} versoes)
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground">
                {{ formatDate(questionnaire.updated_at) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(questionnaire.status)"
                >
                  {{ getStatusLabel(questionnaire.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    title="Abrir Builder"
                    @click="openBuilder(questionnaire)"
                  >
                    <span class="material-symbols-outlined text-[18px]">edit_square</span>
                  </button>
                  <button
                    class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                    title="Ver Detalhes"
                    @click="viewQuestionnaire(questionnaire)"
                  >
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button
                    class="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    title="Excluir"
                    @click="deleteQuestionnaire(questionnaire)"
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
      <div v-if="questionnaires.length > 0" class="px-6 py-4 border-t border-border bg-muted flex items-center justify-between">
        <span class="text-sm text-muted-foreground">
          Mostrando {{ (pagination.current_page - 1) * pagination.per_page + 1 }}-{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de {{ pagination.total }} questionarios
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
