import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  api,
  type Questionnaire,
  type QuestionnaireVersion,
  type FormSchema,
  type Section,
  type FormComponent,
  type ApiError,
} from '@/lib/api'

export const useBuilderStore = defineStore('builder', () => {
  // State
  const questionnaire = ref<Questionnaire | null>(null)
  const schema = ref<FormSchema>({
    sections: [],
    settings: {
      showProgressBar: true,
      allowBackNavigation: true,
    },
  })
  const selectedComponentId = ref<string | null>(null)
  const selectedSectionId = ref<string | null>(null)
  const isDirty = ref(false)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const isAutoSaving = ref(false)
  const lastAutoSaveTime = ref<Date | null>(null)
  const autoSaveTimer = ref<number | null>(null)
  const autoSaveEnabled = ref(true)
  const AUTO_SAVE_DELAY = 3000 // 3 seconds

  // Getters
  const selectedSection = computed(() => {
    if (!selectedSectionId.value) return null
    return schema.value.sections.find((s) => s.id === selectedSectionId.value) || null
  })

  const selectedComponent = computed(() => {
    if (!selectedComponentId.value) return null
    for (const section of schema.value.sections) {
      const component = section.components.find((c) => c.id === selectedComponentId.value)
      if (component) return component
    }
    return null
  })

  const componentCount = computed(() => {
    return schema.value.sections.reduce((sum, section) => sum + section.components.length, 0)
  })

  // Actions
  async function loadQuestionnaire(id: number): Promise<boolean> {
    console.log('[BuilderStore] loadQuestionnaire chamado com ID:', id)
    isLoading.value = true
    error.value = null

    try {
      console.log('[BuilderStore] Buscando questionário via API...')
      const response = await api.getQuestionnaire(id)
      questionnaire.value = response.questionnaire
      console.log('[BuilderStore] Questionário carregado:', response.questionnaire)

      // Load active version schema
      if (response.questionnaire.active_version?.schema) {
        console.log('[BuilderStore] Carregando schema da versão ativa')
        schema.value = response.questionnaire.active_version.schema
      } else {
        // Initialize empty schema
        console.log('[BuilderStore] Nenhuma versão ativa, inicializando schema vazio')
        schema.value = {
          sections: [
            {
              id: generateId('section'),
              title: 'Secao 1',
              components: [],
            },
          ],
          settings: {
            showProgressBar: true,
            allowBackNavigation: true,
          },
        }
      }

      console.log('[BuilderStore] Schema final:', schema.value)
      isDirty.value = false
      return true
    } catch (err) {
      const apiError = err as ApiError
      console.error('[BuilderStore] Erro ao carregar questionário:', err)
      error.value = apiError.message || 'Erro ao carregar questionario'
      return false
    } finally {
      isLoading.value = false
      console.log('[BuilderStore] isLoading definido como false')
    }
  }

  async function saveVersion(): Promise<QuestionnaireVersion | null> {
    if (!questionnaire.value) return null

    isSaving.value = true
    error.value = null

    try {
      const response = await api.createQuestionnaireVersion(questionnaire.value.id, {
        schema: schema.value,
      })
      isDirty.value = false

      // Update questionnaire active version
      if (questionnaire.value) {
        questionnaire.value.active_version = response.version
        questionnaire.value.active_version_id = response.version.id
      }

      return response.version
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Erro ao salvar versao'
      return null
    } finally {
      isSaving.value = false
    }
  }

  async function autoSave(): Promise<void> {
    if (!questionnaire.value || !isDirty.value || !autoSaveEnabled.value) {
      return
    }

    isAutoSaving.value = true

    try {
      await api.createQuestionnaireVersion(questionnaire.value.id, {
        schema: schema.value,
      })
      isDirty.value = false
      lastAutoSaveTime.value = new Date()
      console.log('[BuilderStore] Auto-save concluído:', lastAutoSaveTime.value)
    } catch (err) {
      console.error('[BuilderStore] Erro no auto-save:', err)
      // Não exibir erro ao usuário em auto-save para não ser intrusivo
    } finally {
      isAutoSaving.value = false
    }
  }

  function scheduleAutoSave(): void {
    if (!autoSaveEnabled.value) return

    // Clear existing timer
    if (autoSaveTimer.value !== null) {
      clearTimeout(autoSaveTimer.value)
    }

    // Schedule new auto-save
    autoSaveTimer.value = window.setTimeout(() => {
      autoSave()
    }, AUTO_SAVE_DELAY)

    console.log('[BuilderStore] Auto-save agendado para', AUTO_SAVE_DELAY / 1000, 'segundos')
  }

  function cancelAutoSave(): void {
    if (autoSaveTimer.value !== null) {
      clearTimeout(autoSaveTimer.value)
      autoSaveTimer.value = null
    }
  }

  function toggleAutoSave(enabled: boolean): void {
    autoSaveEnabled.value = enabled
    if (!enabled) {
      cancelAutoSave()
    }
  }

  async function publishVersion(): Promise<boolean> {
    if (!questionnaire.value?.active_version_id) return false

    isSaving.value = true
    error.value = null

    try {
      await api.publishQuestionnaireVersion(
        questionnaire.value.id,
        questionnaire.value.active_version_id
      )
      return true
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || 'Erro ao publicar versao'
      return false
    } finally {
      isSaving.value = false
    }
  }

  function addSection(): Section {
    const section: Section = {
      id: generateId('section'),
      title: `Secao ${schema.value.sections.length + 1}`,
      components: [],
    }
    schema.value.sections.push(section)
    isDirty.value = true
    scheduleAutoSave()
    return section
  }

  function updateSection(sectionId: string, updates: Partial<Section>): void {
    const index = schema.value.sections.findIndex((s) => s.id === sectionId)
    const existing = schema.value.sections[index]
    if (index !== -1 && existing) {
      schema.value.sections[index] = {
        id: updates.id ?? existing.id,
        title: updates.title ?? existing.title,
        components: updates.components ?? existing.components,
      }
      isDirty.value = true
      scheduleAutoSave()
    }
  }

  function removeSection(sectionId: string): void {
    const index = schema.value.sections.findIndex((s) => s.id === sectionId)
    if (index !== -1) {
      schema.value.sections.splice(index, 1)
      if (selectedSectionId.value === sectionId) {
        selectedSectionId.value = null
        selectedComponentId.value = null
      }
      isDirty.value = true
      scheduleAutoSave()
    }
  }

  function addComponent(sectionId: string, componentType: string): FormComponent {
    const section = schema.value.sections.find((s) => s.id === sectionId)
    if (!section) throw new Error('Secao nao encontrada')

    const component: FormComponent = {
      id: generateId('component'),
      type: componentType as FormComponent['type'],
      label: getDefaultLabel(componentType),
      name: generateFieldName(componentType),
      required: false,
      properties: getDefaultProperties(componentType),
      validations: [],
    }

    section.components.push(component)
    isDirty.value = true
    scheduleAutoSave()
    selectedComponentId.value = component.id
    return component
  }

  function updateComponent(componentId: string, updates: Partial<FormComponent>): void {
    for (const section of schema.value.sections) {
      const index = section.components.findIndex((c) => c.id === componentId)
      const existing = section.components[index]
      if (index !== -1 && existing) {
        section.components[index] = {
          id: updates.id ?? existing.id,
          type: updates.type ?? existing.type,
          label: updates.label ?? existing.label,
          name: updates.name ?? existing.name,
          required: updates.required ?? existing.required,
          properties: updates.properties ?? existing.properties,
          validations: updates.validations ?? existing.validations,
        }
        isDirty.value = true
        scheduleAutoSave()
        return
      }
    }
  }

  function removeComponent(componentId: string): void {
    for (const section of schema.value.sections) {
      const index = section.components.findIndex((c) => c.id === componentId)
      if (index !== -1) {
        section.components.splice(index, 1)
        if (selectedComponentId.value === componentId) {
          selectedComponentId.value = null
        }
        isDirty.value = true
        scheduleAutoSave()
        return
      }
    }
  }

  function moveComponent(
    componentId: string,
    targetSectionId: string,
    targetIndex: number
  ): void {
    // Find and remove component from current location
    let component: FormComponent | undefined
    for (const section of schema.value.sections) {
      const index = section.components.findIndex((c) => c.id === componentId)
      if (index !== -1) {
        const removed = section.components.splice(index, 1)
        component = removed[0]
        break
      }
    }

    if (!component) return

    // Add to target location
    const targetSection = schema.value.sections.find((s) => s.id === targetSectionId)
    if (targetSection) {
      targetSection.components.splice(targetIndex, 0, component)
      isDirty.value = true
      scheduleAutoSave()
    }
  }

  function selectComponent(componentId: string | null): void {
    selectedComponentId.value = componentId
  }

  function selectSection(sectionId: string | null): void {
    selectedSectionId.value = sectionId
  }

  function updateSettings(updates: Partial<FormSchema['settings']>): void {
    schema.value.settings = { ...schema.value.settings, ...updates }
    isDirty.value = true
    scheduleAutoSave()
  }

  function clearError(): void {
    error.value = null
  }

  function reset(): void {
    questionnaire.value = null
    schema.value = {
      sections: [],
      settings: {
        showProgressBar: true,
        allowBackNavigation: true,
      },
    }
    selectedComponentId.value = null
    selectedSectionId.value = null
    isDirty.value = false
    error.value = null
  }

  // Helpers
  function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function generateFieldName(componentType: string): string {
    const count = schema.value.sections.reduce(
      (sum, section) =>
        sum + section.components.filter((c) => c.type === componentType).length,
      0
    )
    return `${componentType}_${count + 1}`
  }

  function getDefaultLabel(componentType: string): string {
    const labels: Record<string, string> = {
      text: 'Campo de Texto',
      email: 'E-mail',
      phone: 'Telefone',
      number: 'Numero',
      date: 'Data',
      time: 'Hora',
      textarea: 'Texto Longo',
      select: 'Selecao',
      select_search: 'Selecao com Busca',
      radio: 'Escolha Unica',
      checkbox: 'Multipla Escolha',
      scale: 'Escala',
      rating: 'Avaliacao',
      matrix: 'Matriz',
      ranking: 'Ordenacao',
      file: 'Arquivo',
      image: 'Imagem',
      signature: 'Assinatura',
      geolocation: 'Geolocalizacao',
      cascade: 'Selecao em Cascata',
      section: 'Secao',
      page_break: 'Quebra de Pagina',
      html: 'HTML Personalizado',
    }
    return labels[componentType] || 'Novo Campo'
  }

  function getDefaultProperties(componentType: string): Record<string, unknown> {
    const defaults: Record<string, Record<string, unknown>> = {
      text: { placeholder: '', maxLength: null },
      email: { placeholder: 'email@exemplo.com' },
      phone: { placeholder: '(00) 00000-0000', mask: '(##) #####-####' },
      number: { min: null, max: null, step: 1 },
      date: { minDate: null, maxDate: null },
      time: { format: '24h' },
      textarea: { placeholder: '', rows: 3, maxLength: null },
      select: { options: [], placeholder: 'Selecione...' },
      select_search: { options: [], placeholder: 'Buscar...', allowCustom: false },
      radio: { options: [], layout: 'vertical' },
      checkbox: { options: [], layout: 'vertical', minSelect: null, maxSelect: null },
      scale: { min: 1, max: 5, minLabel: '', maxLabel: '' },
      rating: { max: 5, icon: 'star' },
      matrix: { rows: [], columns: [], type: 'radio' },
      ranking: { options: [] },
      file: { accept: '*', maxSize: 10 },
      image: { maxSize: 5, allowCamera: true },
      signature: { width: 400, height: 200 },
      geolocation: { accuracy: 'high' },
      cascade: { levels: [] },
      html: { content: '<p>Conteudo HTML</p>' },
    }
    return defaults[componentType] || {}
  }

  return {
    // State
    questionnaire,
    schema,
    selectedComponentId,
    selectedSectionId,
    isDirty,
    isLoading,
    isSaving,
    error,
    isAutoSaving,
    lastAutoSaveTime,
    autoSaveEnabled,
    // Getters
    selectedSection,
    selectedComponent,
    componentCount,
    // Actions
    loadQuestionnaire,
    saveVersion,
    publishVersion,
    autoSave,
    scheduleAutoSave,
    cancelAutoSave,
    toggleAutoSave,
    addSection,
    updateSection,
    removeSection,
    addComponent,
    updateComponent,
    removeComponent,
    moveComponent,
    selectComponent,
    selectSection,
    updateSettings,
    clearError,
    reset,
  }
})
