<script setup lang="ts">
/**
 * FormBuilderView - Integração automática Projeto → Builder
 *
 * Fluxo:
 * 1. Recebe projectId da rota /projects/:id/builder
 * 2. Verifica se existe questionário ativo para o projeto
 * 3. Se não existir, cria automaticamente um novo questionário
 * 4. Redireciona para /questionnaires/:id/builder (builder funcional)
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Questionnaire } from '@/lib/api'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const error = ref<string | null>(null)
const statusMessage = ref('Carregando projeto...')

const projectId = Number(route.params.id)

async function initializeBuilder() {
  console.log('[FormBuilderView] Iniciando builder para projeto:', projectId)
  console.log('[FormBuilderView] Mock mode ativo?', import.meta.env.VITE_USE_MOCK_API)

  try {
    // 1. Buscar questionários do projeto
    statusMessage.value = 'Buscando questionários do projeto...'
    console.log('[FormBuilderView] Buscando questionários draft...')

    const response = await api.getQuestionnaires({
      project_id: projectId,
      status: 'draft', // Buscar drafts primeiro
    })
    console.log('[FormBuilderView] Resposta questionnaires draft:', response)

    let questionnaire: Questionnaire | null = null

    if (response.questionnaires.data.length > 0) {
      // Usar o primeiro questionário draft encontrado
      questionnaire = response.questionnaires.data[0]
      statusMessage.value = 'Questionário encontrado. Redirecionando...'
      console.log('[FormBuilderView] Questionário draft encontrado:', questionnaire.id)
    } else {
      // Buscar qualquer questionário do projeto
      console.log('[FormBuilderView] Nenhum draft, buscando todos...')
      const allResponse = await api.getQuestionnaires({
        project_id: projectId,
      })
      console.log('[FormBuilderView] Resposta questionnaires todos:', allResponse)

      if (allResponse.questionnaires.data.length > 0) {
        questionnaire = allResponse.questionnaires.data[0]
        statusMessage.value = 'Questionário encontrado. Redirecionando...'
        console.log('[FormBuilderView] Questionário encontrado:', questionnaire.id)
      } else {
        // 2. Criar novo questionário se não existir
        statusMessage.value = 'Criando novo questionário...'
        console.log('[FormBuilderView] Criando novo questionário...')

        const createResponse = await api.createQuestionnaire({
          project_id: projectId,
          title: 'Novo Formulário',
          description: 'Formulário criado automaticamente',
        })
        console.log('[FormBuilderView] Questionário criado:', createResponse)

        questionnaire = createResponse.questionnaire
        statusMessage.value = 'Questionário criado. Redirecionando...'
      }
    }

    // 3. Redirecionar para o builder funcional
    if (questionnaire) {
      const targetRoute = `/questionnaires/${questionnaire.id}/builder`
      console.log('[FormBuilderView] Redirecionando para:', targetRoute)
      await router.push(targetRoute)
      console.log('[FormBuilderView] Redirecionamento concluído')
    } else {
      throw new Error('Não foi possível inicializar o questionário')
    }
  } catch (err) {
    console.error('[FormBuilderView] Erro ao inicializar builder:', err)
    error.value = 'Erro ao inicializar o construtor de formulários. Por favor, tente novamente.'
    isLoading.value = false
  }
}

onMounted(() => {
  if (!projectId || isNaN(projectId)) {
    error.value = 'ID do projeto inválido'
    isLoading.value = false
    return
  }
  initializeBuilder()
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-2xl text-center max-w-md">
      <!-- Loading State -->
      <template v-if="isLoading">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-lg"></div>
        <h2 class="font-h3 text-h3 text-on-surface mb-md">{{ statusMessage }}</h2>
        <p class="font-body-sm text-on-surface-variant">
          Aguarde enquanto preparamos o construtor de formulários...
        </p>
      </template>

      <!-- Error State -->
      <template v-else-if="error">
        <span class="material-symbols-outlined text-[80px] text-error mb-lg">error</span>
        <h2 class="font-h3 text-h3 text-on-surface mb-md">Erro</h2>
        <p class="font-body-lg text-on-surface-variant mb-lg">{{ error }}</p>
        <button
          class="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md text-label-md hover:opacity-90 transition-all"
          @click="router.push(`/projects/${projectId}`)"
        >
          Voltar ao Projeto
        </button>
      </template>
    </div>
  </div>
</template>
