<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBuilderStore } from '@/stores/builder'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { FormComponent } from '@/lib/api'

const store = useBuilderStore()

// Local state for editing
const localLabel = ref('')
const localName = ref('')
const localRequired = ref(false)
const localPlaceholder = ref('')
const localHelpText = ref('')
const localMin = ref<number | undefined>(undefined)
const localMax = ref<number | undefined>(undefined)
const localMask = ref('')
const localMaskEnabled = ref(false)
const localOptions = ref<Array<{ value: string; label: string }>>([])

// Validation rules
const validationRules = ref<Array<{ type: string; value?: any; message?: string }>>([])

// Watch for selected component changes (only when component ID changes)
watch(() => store.selectedComponent?.id, (newId, oldId) => {
  const component = store.selectedComponent
  if (component && newId !== oldId) {
    localLabel.value = component.label
    localName.value = component.name
    localRequired.value = component.required
    localPlaceholder.value = (component.properties.placeholder as string) || ''
    localHelpText.value = (component.properties.helpText as string) || ''
    localMin.value = component.properties.min as number | undefined
    localMax.value = component.properties.max as number | undefined
    const maskValue = (component.properties.mask as string) || ''
    localMask.value = maskValue
    localMaskEnabled.value = maskValue.length > 0
    localOptions.value = (component.properties.options as Array<{ value: string; label: string }>) || []
    validationRules.value = component.validations || []
  }
}, { immediate: true })

const isSection = computed(() => store.selectedSectionId !== null && store.selectedComponentId === null)

const hasOptions = computed(() => {
  const typesWithOptions = ['select', 'select_search', 'radio', 'checkbox', 'scale', 'rating']
  return store.selectedComponent && typesWithOptions.includes(store.selectedComponent.type)
})

const hasNumericConstraints = computed(() => {
  const numericTypes = ['number', 'scale', 'rating']
  return store.selectedComponent && numericTypes.includes(store.selectedComponent.type)
})

// Removido - regex agora é validação, não constraint separado

const hasMaskSupport = computed(() => {
  const maskTypes = ['text', 'phone', 'number']
  return store.selectedComponent && maskTypes.includes(store.selectedComponent.type)
})

function updateComponent() {
  if (!store.selectedComponent) return

  const updates: Partial<FormComponent> = {
    label: localLabel.value,
    name: localName.value,
    required: localRequired.value,
    properties: {
      ...store.selectedComponent.properties,
      placeholder: localPlaceholder.value,
      helpText: localHelpText.value,
      min: localMin.value,
      max: localMax.value,
      mask: localMaskEnabled.value ? localMask.value : '',
      options: localOptions.value,
    },
    validations: validationRules.value,
  }

  store.updateComponent(store.selectedComponent.id, updates)
}

function toggleMask() {
  localMaskEnabled.value = !localMaskEnabled.value
  if (!localMaskEnabled.value) {
    localMask.value = ''
  }
  updateComponent()
}

function addOption() {
  const index = localOptions.value.length + 1
  localOptions.value.push({
    value: `option_${index}`,
    label: `Opção ${index}`,
  })
  updateComponent()
}

function removeOption(index: number) {
  localOptions.value.splice(index, 1)
  updateComponent()
}

function addValidationRule() {
  validationRules.value.push({
    type: '',
    value: undefined,
    message: '',
  })
  // Não chama updateComponent aqui, só quando o usuário selecionar um tipo
}

function removeValidationRule(index: number) {
  validationRules.value.splice(index, 1)
  updateComponent()
}

function closePanel() {
  store.selectComponent(null)
  store.selectSection(null)
}

const maskPresets = [
  { label: 'CPF', value: '###.###.###-##' },
  { label: 'CNPJ', value: '##.###.###/####-##' },
  { label: 'Telefone', value: '(##) ####-####' },
  { label: 'Celular', value: '(##) #####-####' },
  { label: 'CEP', value: '#####-###' },
  { label: 'Data', value: '##/##/####' },
]

// Helpers para validações
function needsValueField(validationType: string): boolean {
  const typesNeedingValue = [
    'min_length',
    'max_length',
    'regex',
    'min_value',
    'max_value',
    'min_date',
    'max_date',
    'min_time',
    'max_time',
    'max_file_size',
    'file_types',
    'image_types',
  ]
  return typesNeedingValue.includes(validationType)
}

function getValueLabel(validationType: string): string {
  const labels: Record<string, string> = {
    min_length: 'Tamanho mínimo',
    max_length: 'Tamanho máximo',
    regex: 'Expressão regular',
    min_value: 'Valor mínimo',
    max_value: 'Valor máximo',
    min_date: 'Data mínima',
    max_date: 'Data máxima',
    min_time: 'Hora mínima',
    max_time: 'Hora máxima',
    max_file_size: 'Tamanho máximo (MB)',
    file_types: 'Tipos permitidos (separados por vírgula)',
    image_types: 'Tipos de imagem (separados por vírgula)',
  }
  return labels[validationType] || 'Valor'
}

function getValueInputType(validationType: string): string {
  const numericTypes = ['min_length', 'max_length', 'min_value', 'max_value', 'max_file_size']
  const dateTypes = ['min_date', 'max_date']
  const timeTypes = ['min_time', 'max_time']

  if (numericTypes.includes(validationType)) return 'number'
  if (dateTypes.includes(validationType)) return 'date'
  if (timeTypes.includes(validationType)) return 'time'
  return 'text'
}

function getValuePlaceholder(validationType: string): string {
  const placeholders: Record<string, string> = {
    regex: '^[A-Za-z]+$',
    file_types: 'pdf, doc, docx',
    image_types: 'jpg, png, gif',
  }
  return placeholders[validationType] || ''
}

// Validações contextuais baseadas no tipo do campo
const validationTypes = computed(() => {
  if (!store.selectedComponent) return []

  const componentType = store.selectedComponent.type

  // Validações comuns a todos os campos de texto
  const textValidations = [
    { label: 'Tamanho Mínimo', value: 'min_length' },
    { label: 'Tamanho Máximo', value: 'max_length' },
    { label: 'Padrão (Regex)', value: 'regex' },
  ]

  // Validações por tipo de campo
  const validationsByType: Record<string, Array<{ label: string; value: string }>> = {
    text: textValidations,
    textarea: textValidations,
    email: [
      { label: 'Formato de Email', value: 'email' },
      ...textValidations,
    ],
    phone: [
      { label: 'Formato de Telefone', value: 'phone' },
      ...textValidations,
    ],
    number: [
      { label: 'Apenas Números', value: 'numeric' },
      { label: 'Valor Mínimo', value: 'min_value' },
      { label: 'Valor Máximo', value: 'max_value' },
    ],
    url: [
      { label: 'Formato de URL', value: 'url' },
      ...textValidations,
    ],
    date: [
      { label: 'Data Mínima', value: 'min_date' },
      { label: 'Data Máxima', value: 'max_date' },
    ],
    time: [
      { label: 'Hora Mínima', value: 'min_time' },
      { label: 'Hora Máxima', value: 'max_time' },
    ],
    file: [
      { label: 'Tamanho Máximo (MB)', value: 'max_file_size' },
      { label: 'Tipos Permitidos', value: 'file_types' },
    ],
    image: [
      { label: 'Tamanho Máximo (MB)', value: 'max_file_size' },
      { label: 'Tipos de Imagem', value: 'image_types' },
    ],
  }

  return validationsByType[componentType] || textValidations
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 p-4 border-b border-border">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-sm text-foreground">Object Inspector</h3>
        <button
          class="p-1 hover:bg-muted rounded text-muted-foreground"
          @click="closePanel"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Section Properties -->
      <div v-if="isSection && store.selectedSection" class="text-sm text-muted-foreground">
        Edite o título da seção diretamente no canvas clicando no ícone de edição.
      </div>

      <!-- Component Properties -->
      <div v-else-if="store.selectedComponent" class="space-y-4">
        <!-- Basic Properties -->
        <Card class="p-3 space-y-3">
          <h4 class="text-xs font-semibold text-foreground uppercase tracking-wide">Propriedades Básicas</h4>

          <div>
            <Label for="label" class="text-xs">Rótulo *</Label>
            <Input
              id="label"
              v-model="localLabel"
              placeholder="Digite o rótulo"
              class="mt-1"
              @blur="updateComponent"
            />
          </div>

          <div>
            <Label for="name" class="text-xs">Nome do Campo *</Label>
            <Input
              id="name"
              v-model="localName"
              placeholder="nome_do_campo"
              class="mt-1 font-mono text-sm"
              @blur="updateComponent"
            />
            <p class="text-[10px] text-muted-foreground mt-1">Identificador único nas respostas</p>
          </div>

          <div>
            <Label for="placeholder" class="text-xs">Placeholder</Label>
            <Input
              id="placeholder"
              v-model="localPlaceholder"
              placeholder="Texto de ajuda..."
              class="mt-1"
              @blur="updateComponent"
            />
          </div>

          <div>
            <Label for="helpText" class="text-xs">Texto de Ajuda</Label>
            <Input
              id="helpText"
              v-model="localHelpText"
              placeholder="Informação adicional"
              class="mt-1"
              @blur="updateComponent"
            />
          </div>

          <div class="flex items-center justify-between pt-1">
            <Label for="required" class="text-xs">Campo obrigatório</Label>
            <button
              type="button"
              role="switch"
              :aria-checked="localRequired"
              :class="[
                'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                localRequired ? 'bg-primary' : 'bg-muted'
              ]"
              @click="localRequired = !localRequired; updateComponent()"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  localRequired ? 'translate-x-4' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </Card>

        <!-- Numeric Constraints -->
        <Card v-if="hasNumericConstraints" class="p-3 space-y-3">
          <h4 class="text-xs font-semibold text-foreground uppercase tracking-wide">Restrições Numéricas</h4>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <Label for="min" class="text-xs">Mínimo</Label>
              <Input
                id="min"
                v-model.number="localMin"
                type="number"
                class="mt-1"
                @blur="updateComponent"
              />
            </div>
            <div>
              <Label for="max" class="text-xs">Máximo</Label>
              <Input
                id="max"
                v-model.number="localMax"
                type="number"
                class="mt-1"
                @blur="updateComponent"
              />
            </div>
          </div>
        </Card>

        <!-- Text Constraints - Removido: regex agora é validação -->

        <!-- Mask Support -->
        <Card v-if="hasMaskSupport" class="p-3 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-semibold text-foreground uppercase tracking-wide">Máscara de Input</h4>
            <button
              type="button"
              role="switch"
              :aria-checked="localMaskEnabled"
              :class="[
                'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                localMaskEnabled ? 'bg-primary' : 'bg-muted'
              ]"
              @click.stop="toggleMask"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  localMaskEnabled ? 'translate-x-4' : 'translate-x-0'
                ]"
              />
            </button>
          </div>

          <div v-if="localMaskEnabled" class="space-y-3 pt-1">
            <div>
              <Label for="mask" class="text-xs">Máscara Personalizada</Label>
              <Input
                id="mask"
                v-model="localMask"
                placeholder="###.###.###-##"
                class="mt-1 font-mono text-sm"
                @blur="updateComponent"
              />
              <p class="text-[10px] text-muted-foreground mt-1">Use # para dígitos, A para letras</p>
            </div>

            <div>
              <Label class="text-xs mb-2 block">Máscaras Prontas</Label>
              <div class="grid grid-cols-2 gap-1">
                <Button
                  v-for="preset in maskPresets"
                  :key="preset.value"
                  variant="outline"
                  size="sm"
                  class="text-[10px] h-7"
                  @click="localMask = preset.value; updateComponent()"
                >
                  {{ preset.label }}
                </Button>
              </div>
            </div>
          </div>

          <div v-else class="text-xs text-muted-foreground py-2">
            Ative para adicionar formatação ao campo
          </div>
        </Card>

        <!-- Options (for select, radio, checkbox, etc) -->
        <Card v-if="hasOptions" class="p-3 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-semibold text-foreground uppercase tracking-wide">Opções</h4>
            <Button
              variant="ghost"
              size="sm"
              class="h-6 px-2 text-[10px]"
              @click="addOption"
            >
              <span class="material-symbols-outlined text-[14px] mr-1">add</span>
              Adicionar
            </Button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(option, index) in localOptions"
              :key="index"
              class="flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-muted-foreground text-[14px] cursor-grab">
                drag_indicator
              </span>
              <Input
                v-model="option.label"
                placeholder="Rótulo da opção"
                class="flex-1 h-7 text-xs"
                @blur="updateComponent"
              />
              <button
                class="p-1 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground"
                @click="removeOption(index)"
              >
                <span class="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>

            <p v-if="localOptions.length === 0" class="text-xs text-muted-foreground text-center py-2">
              Nenhuma opção adicionada
            </p>
          </div>
        </Card>

        <!-- Validation Rules -->
        <Card class="p-3 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-semibold text-foreground uppercase tracking-wide">Validações</h4>
            <Button
              variant="ghost"
              size="sm"
              class="h-6 px-2 text-[10px]"
              @click="addValidationRule"
            >
              <span class="material-symbols-outlined text-[14px] mr-1">add</span>
              Adicionar
            </Button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(rule, index) in validationRules"
              :key="index"
              class="border border-border rounded-md p-2 space-y-2"
            >
              <div class="flex items-center gap-2">
                <select
                  v-model="rule.type"
                  class="flex-1 text-xs border border-border rounded px-2 py-1 bg-background"
                  @change="updateComponent"
                >
                  <option value="">Selecione o tipo</option>
                  <option v-for="type in validationTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
                <button
                  class="p-1 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground"
                  @click="removeValidationRule(index)"
                >
                  <span class="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>

              <!-- Campo de valor (apenas para validações que precisam) -->
              <div v-if="needsValueField(rule.type)">
                <Label class="text-[10px] text-muted-foreground mb-1 block">
                  {{ getValueLabel(rule.type) }}
                </Label>
                <Input
                  v-model="rule.value"
                  :type="getValueInputType(rule.type)"
                  :placeholder="getValuePlaceholder(rule.type)"
                  class="h-7 text-xs"
                  @blur="updateComponent"
                />
              </div>

              <!-- Campo de mensagem de erro (opcional) -->
              <div>
                <Label class="text-[10px] text-muted-foreground mb-1 block">
                  Mensagem de erro (opcional)
                </Label>
                <Input
                  v-model="rule.message"
                  placeholder="Ex: Campo inválido"
                  class="h-7 text-xs"
                  @blur="updateComponent"
                />
              </div>
            </div>

            <p v-if="validationRules.length === 0" class="text-xs text-muted-foreground text-center py-2">
              Nenhuma validação configurada
            </p>
          </div>
        </Card>

        <!-- Component Meta Info -->
        <Card class="p-3 space-y-2 bg-muted/30">
          <p class="text-[10px] text-muted-foreground">
            <span class="font-semibold">Tipo:</span> <span class="font-mono">{{ store.selectedComponent.type }}</span>
          </p>
          <p class="text-[10px] text-muted-foreground">
            <span class="font-semibold">ID:</span> <span class="font-mono">{{ store.selectedComponent.id }}</span>
          </p>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 text-muted-foreground">
        <span class="material-symbols-outlined text-[32px] mb-2 block">touch_app</span>
        <p class="text-xs">Selecione um componente ou seção para editar suas propriedades</p>
      </div>
    </div>
  </div>
</template>
