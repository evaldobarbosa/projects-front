<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBuilderStore } from '@/stores/builder'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const store = useBuilderStore()

// Local state for editing
const localLabel = ref('')
const localName = ref('')
const localRequired = ref(false)
const localPlaceholder = ref('')
const localOptions = ref<Array<{ value: string; label: string }>>([])

// Watch for selected component changes
watch(() => store.selectedComponent, (component) => {
  if (component) {
    localLabel.value = component.label
    localName.value = component.name
    localRequired.value = component.required
    localPlaceholder.value = (component.properties.placeholder as string) || ''
    localOptions.value = (component.properties.options as Array<{ value: string; label: string }>) || []
  }
}, { immediate: true })

const isSection = computed(() => store.selectedSectionId !== null && store.selectedComponentId === null)
const hasOptions = computed(() => {
  const typesWithOptions = ['select', 'select_search', 'radio', 'checkbox', 'scale', 'rating']
  return store.selectedComponent && typesWithOptions.includes(store.selectedComponent.type)
})

function updateComponent() {
  if (!store.selectedComponent) return

  const updates: Record<string, unknown> = {
    label: localLabel.value,
    name: localName.value,
    required: localRequired.value,
    properties: {
      ...store.selectedComponent.properties,
      placeholder: localPlaceholder.value,
      options: localOptions.value,
    },
  }

  store.updateComponent(store.selectedComponent.id, updates)
}

function addOption() {
  const index = localOptions.value.length + 1
  localOptions.value.push({
    value: `option_${index}`,
    label: `Opcao ${index}`,
  })
  updateComponent()
}

function removeOption(index: number) {
  localOptions.value.splice(index, 1)
  updateComponent()
}

function updateSection() {
  if (!store.selectedSection) return
  // Section updates are handled in SectionBlock
}

function closePanel() {
  store.selectComponent(null)
  store.selectSection(null)
}
</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-foreground">Propriedades</h3>
      <button
        class="p-1 hover:bg-muted rounded text-muted-foreground"
        @click="closePanel"
      >
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>

    <!-- Section Properties -->
    <div v-if="isSection && store.selectedSection" class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Edite o titulo da secao diretamente no canvas clicando no icone de edicao.
      </p>
    </div>

    <!-- Component Properties -->
    <div v-else-if="store.selectedComponent" class="space-y-4">
      <!-- Basic Info -->
      <div class="space-y-3">
        <div>
          <Label for="label" class="text-xs">Rotulo</Label>
          <Input
            id="label"
            v-model="localLabel"
            placeholder="Digite o rotulo"
            class="mt-1"
            @blur="updateComponent"
          />
        </div>

        <div>
          <Label for="name" class="text-xs">Nome do Campo</Label>
          <Input
            id="name"
            v-model="localName"
            placeholder="nome_do_campo"
            class="mt-1 font-mono text-sm"
            @blur="updateComponent"
          />
          <p class="text-xs text-muted-foreground mt-1">Usado para identificar o campo nas respostas</p>
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

        <div class="flex items-center gap-2">
          <input
            id="required"
            v-model="localRequired"
            type="checkbox"
            class="rounded border-border"
            @change="updateComponent"
          />
          <Label for="required" class="text-sm cursor-pointer">Campo obrigatorio</Label>
        </div>
      </div>

      <!-- Options (for select, radio, checkbox, etc) -->
      <div v-if="hasOptions" class="pt-4 border-t border-border">
        <div class="flex items-center justify-between mb-3">
          <Label class="text-xs">Opcoes</Label>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 px-2"
            @click="addOption"
          >
            <span class="material-symbols-outlined text-[16px] mr-1">add</span>
            Adicionar
          </Button>
        </div>

        <div class="space-y-2">
          <div
            v-for="(option, index) in localOptions"
            :key="index"
            class="flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-muted-foreground text-[16px] cursor-grab">
              drag_indicator
            </span>
            <Input
              v-model="option.label"
              placeholder="Rotulo da opcao"
              class="flex-1 h-8 text-sm"
              @blur="updateComponent"
            />
            <button
              class="p-1 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground"
              @click="removeOption(index)"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <p v-if="localOptions.length === 0" class="text-sm text-muted-foreground text-center py-2">
            Nenhuma opcao adicionada
          </p>
        </div>
      </div>

      <!-- Component Type Info -->
      <div class="pt-4 border-t border-border">
        <p class="text-xs text-muted-foreground">
          Tipo: <span class="font-mono">{{ store.selectedComponent.type }}</span>
        </p>
        <p class="text-xs text-muted-foreground">
          ID: <span class="font-mono">{{ store.selectedComponent.id }}</span>
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-muted-foreground">
      <span class="material-symbols-outlined text-[32px] mb-2 block">touch_app</span>
      <p class="text-sm">Selecione um componente ou secao para editar suas propriedades</p>
    </div>
  </div>
</template>
