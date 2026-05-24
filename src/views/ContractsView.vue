<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api, type Contract, type ContractStats, type ContractFilters } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const contracts = ref<Contract[]>([])
const stats = ref<ContractStats>({
  total_active: 0,
  total_value: 0,
  total_pending: 0,
  expiring_soon: 0,
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})
const isLoading = ref(false)
const error = ref<string | null>(null)

const filters = ref<ContractFilters>({
  search: '',
  status: '',
  client: '',
  page: 1,
})

async function loadContracts() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.getContracts(filters.value)
    contracts.value = response.contracts.data
    stats.value = response.stats
    pagination.value = {
      current_page: response.contracts.current_page,
      last_page: response.contracts.last_page,
      per_page: response.contracts.per_page,
      total: response.contracts.total,
    }
  } catch (err) {
    error.value = 'Erro ao carregar contratos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    expired: 'bg-muted text-muted-foreground',
    draft: 'bg-primary/10 text-primary',
    cancelled: 'bg-destructive/10 text-destructive',
  }
  return classes[status] || 'bg-muted text-muted-foreground'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Ativo',
    pending: 'Pendente',
    expired: 'Expirado',
    draft: 'Rascunho',
    cancelled: 'Cancelado',
  }
  return labels[status] || status
}

function applyFilters() {
  filters.value.page = 1
  loadContracts()
}

function clearFilters() {
  filters.value = {
    search: '',
    status: '',
    client: '',
    page: 1,
  }
  loadContracts()
}

function goToPage(page: number) {
  if (page >= 1 && page <= pagination.value.last_page) {
    filters.value.page = page
    loadContracts()
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
  loadContracts()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Contratos</h1>
        <p class="mt-1 text-muted-foreground">Gerencie seus acordos comerciais e termos de serviço.</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline">
          <span class="mr-2">↓</span>
          Exportar CSV
        </Button>
        <Button>
          <span class="mr-2">+</span>
          Novo Contrato
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Ativos</span>
            <div class="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center">
              ✓
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ stats.total_active }}</div>
          <div class="flex items-center gap-1 text-success text-sm mt-1">
            <span>↑</span>
            <span>contratos vigentes</span>
          </div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor em Vigor</span>
            <div class="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              $
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ formatCurrency(stats.total_value) }}</div>
          <div class="text-muted-foreground text-sm mt-1">Em contratos ativos</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes</span>
            <div class="w-8 h-8 bg-warning/10 text-warning rounded-lg flex items-center justify-center">
              ⏳
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ String(stats.total_pending).padStart(2, '0') }}</div>
          <div class="text-warning text-sm mt-1">Aguardando assinatura</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expira em 30d</span>
            <div class="w-8 h-8 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center">
              ⚠
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">{{ String(stats.expiring_soon).padStart(2, '0') }}</div>
          <div class="text-destructive text-sm mt-1 font-medium">Requer atenção</div>
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
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="expired">Expirado</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>

            <div class="relative">
              <Input
                v-model="filters.search"
                placeholder="Buscar contratos..."
                class="pl-10 w-64"
                @keyup.enter="applyFilters"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
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
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome / ID</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Projeto Vinculado</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vigência</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Total</th>
              <th class="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="isLoading">
              <td colspan="7" class="px-6 py-12 text-center text-muted-foreground">
                Carregando...
              </td>
            </tr>
            <tr v-else-if="contracts.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-muted-foreground">
                Nenhum contrato encontrado.
              </td>
            </tr>
            <tr
              v-for="contract in contracts"
              :key="contract.id"
              class="hover:bg-muted/50 transition-colors group"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-foreground">{{ contract.code }}</span>
                  <span class="text-sm text-muted-foreground">{{ contract.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="contract.projects && contract.projects.length > 0" class="flex items-center gap-2">
                  <span class="text-muted-foreground">📁</span>
                  <span class="text-sm text-foreground">{{ contract.projects[0]?.name }}</span>
                  <span v-if="contract.projects.length > 1" class="text-xs text-muted-foreground">
                    +{{ contract.projects.length - 1 }}
                  </span>
                </div>
                <span v-else class="text-sm text-muted-foreground">—</span>
              </td>
              <td class="px-6 py-4 text-sm text-foreground">
                {{ contract.client_name }}
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm text-foreground">{{ formatDate(contract.start_date) }}</span>
                  <span class="text-xs text-muted-foreground">até {{ formatDate(contract.end_date) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 font-medium text-foreground">
                {{ formatCurrency(Number(contract.value)) }}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(contract.status)"
                >
                  {{ getStatusLabel(contract.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                    title="Ver Detalhes"
                  >
                    👁
                  </button>
                  <button
                    class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-border bg-muted flex items-center justify-between">
        <span class="text-sm text-muted-foreground">
          Mostrando {{ (pagination.current_page - 1) * pagination.per_page + 1 }}-{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de {{ pagination.total }} contratos
        </span>
        <div class="flex items-center gap-2">
          <button
            class="p-1 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
            :disabled="pagination.current_page === 1"
            @click="goToPage(pagination.current_page - 1)"
          >
            ←
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
            →
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>
