<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Project, type ProjectPayload, type Contract } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => !!route.params.id)
const projectId = computed(() => Number(route.params.id))

const form = ref<ProjectPayload>({
  name: '',
  description: '',
  status: 'draft',
  start_date: '',
  end_date: '',
  contract_ids: [],
})

const contracts = ref<Contract[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})

async function loadProject() {
  if (!isEditing.value) return

  isLoading.value = true
  error.value = null

  try {
    const response = await api.getProject(projectId.value)
    const project = response.project

    form.value = {
      name: project.name,
      description: project.description || '',
      status: project.status,
      start_date: project.start_date?.split('T')[0] || '',
      end_date: project.end_date?.split('T')[0] || '',
      contract_ids: project.contracts?.map(c => c.id) || [],
    }
  } catch (err) {
    error.value = 'Erro ao carregar projeto.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function loadContracts() {
  try {
    const response = await api.getContracts({ per_page: 100 })
    contracts.value = response.contracts.data
  } catch (err) {
    console.error('Erro ao carregar contratos:', err)
  }
}

async function handleSubmit() {
  console.log('[ProjectFormView] handleSubmit chamado')
  console.log('[ProjectFormView] Dados do formulário:', form.value)
  isSaving.value = true
  error.value = null
  validationErrors.value = {}

  try {
    const action = isEditing.value ? 'Editando' : 'Criando'
    console.log(`[ProjectFormView] ${action} projeto`)

    const saveProject = isEditing.value
      ? async () => {
          await api.updateProject(projectId.value, form.value)
          return projectId.value
        }
      : async () => {
          const response = await api.createProject(form.value)
          console.log('[ProjectFormView] Projeto criado:', response)
          return response.project.id
        }

    const id = await saveProject()
    console.log('[ProjectFormView] Redirecionando para /projects/' + id)
    router.push(`/projects/${id}`)
  } catch (err: any) {
    console.error('[ProjectFormView] Erro ao salvar projeto:', err)
    if (err.errors) {
      validationErrors.value = err.errors
    }
    error.value = err.message || 'Erro ao salvar projeto.'
  } finally {
    isSaving.value = false
  }
}

function toggleContract(contractId: number) {
  const ids = form.value.contract_ids || []
  const index = ids.indexOf(contractId)

  if (index === -1) {
    form.value.contract_ids = [...ids, contractId]
  } else {
    form.value.contract_ids = ids.filter(id => id !== contractId)
  }
}

function isContractSelected(contractId: number): boolean {
  return form.value.contract_ids?.includes(contractId) || false
}

onMounted(() => {
  loadContracts()
  loadProject()
})
</script>

<template>
  <div>
    <!-- Back Button -->
    <div class="mb-6">
      <button
        class="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
        @click="router.push('/projects')"
      >
        <span class="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Carregando...</div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Error Alert -->
      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Info -->
          <Card class="border-border">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados gerais do projeto de pesquisa</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="name">Nome do Projeto *</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  placeholder="Ex: Pesquisa de Satisfação 2024"
                  :class="{ 'border-destructive': validationErrors.name }"
                />
                <p v-if="validationErrors.name" class="text-sm text-destructive">
                  {{ validationErrors.name[0] }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="description">Descrição</Label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  placeholder="Descreva o objetivo e escopo do projeto..."
                  class="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  :class="{ 'border-destructive': validationErrors.description }"
                ></textarea>
                <p v-if="validationErrors.description" class="text-sm text-destructive">
                  {{ validationErrors.description[0] }}
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    v-model="form.start_date"
                    type="date"
                    :class="{ 'border-destructive': validationErrors.start_date }"
                  />
                  <p v-if="validationErrors.start_date" class="text-sm text-destructive">
                    {{ validationErrors.start_date[0] }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="end_date">Data de Término</Label>
                  <Input
                    id="end_date"
                    v-model="form.end_date"
                    type="date"
                    :class="{ 'border-destructive': validationErrors.end_date }"
                  />
                  <p v-if="validationErrors.end_date" class="text-sm text-destructive">
                    {{ validationErrors.end_date[0] }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Contracts -->
          <Card class="border-border">
            <CardHeader>
              <CardTitle>Contratos Vinculados</CardTitle>
              <CardDescription>Selecione os contratos associados a este projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="contracts.length > 0" class="space-y-2">
                <div
                  v-for="contract in contracts"
                  :key="contract.id"
                  class="flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer"
                  :class="isContractSelected(contract.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'"
                  @click="toggleContract(contract.id)"
                >
                  <div
                    class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                    :class="isContractSelected(contract.id) ? 'border-primary bg-primary' : 'border-border'"
                  >
                    <span v-if="isContractSelected(contract.id)" class="material-symbols-outlined text-primary-foreground text-[14px]">check</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-foreground">{{ contract.code }} - {{ contract.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ contract.client_name }}</div>
                  </div>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-success/10 text-success': contract.status === 'active',
                      'bg-warning/10 text-warning': contract.status === 'pending',
                      'bg-muted text-muted-foreground': contract.status === 'expired' || contract.status === 'draft',
                    }"
                  >
                    {{ contract.status === 'active' ? 'Ativo' : contract.status === 'pending' ? 'Pendente' : contract.status }}
                  </span>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <span class="material-symbols-outlined text-muted-foreground text-[32px]">contract</span>
                <p class="text-muted-foreground mt-2">Nenhum contrato disponível</p>
                <RouterLink to="/contracts" class="text-primary text-sm hover:underline">
                  Criar novo contrato
                </RouterLink>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <Card class="border-border">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <label
                  v-for="status in [
                    { value: 'draft', label: 'Rascunho', icon: 'edit_note', description: 'Projeto em elaboração' },
                    { value: 'in_field', label: 'Em Campo', icon: 'play_circle', description: 'Coletando dados' },
                    { value: 'finished', label: 'Concluído', icon: 'check_circle', description: 'Coleta finalizada' },
                    { value: 'archived', label: 'Arquivado', icon: 'archive', description: 'Projeto arquivado' },
                  ]"
                  :key="status.value"
                  class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                  :class="form.status === status.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'"
                >
                  <input
                    type="radio"
                    :value="status.value"
                    v-model="form.status"
                    class="sr-only"
                  />
                  <span class="material-symbols-outlined text-[20px]" :class="form.status === status.value ? 'text-primary' : 'text-muted-foreground'">
                    {{ status.icon }}
                  </span>
                  <div>
                    <div class="font-medium text-foreground">{{ status.label }}</div>
                    <div class="text-xs text-muted-foreground">{{ status.description }}</div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <!-- Actions -->
          <Card class="border-border">
            <CardContent class="p-4 space-y-3">
              <Button type="submit" class="w-full" :disabled="isSaving">
                <span v-if="isSaving">Salvando...</span>
                <span v-else>
                  <span class="material-symbols-outlined text-[18px] mr-2">save</span>
                  {{ isEditing ? 'Salvar Alterações' : 'Criar Projeto' }}
                </span>
              </Button>
              <Button type="button" variant="outline" class="w-full" @click="router.push('/projects')">
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  </div>
</template>
