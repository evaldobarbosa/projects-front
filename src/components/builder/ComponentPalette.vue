<script setup lang="ts">
import { ref } from 'vue'
import { useBuilderStore } from '@/stores/builder'

const store = useBuilderStore()

const componentGroups = ref([
  {
    title: 'Campos Simples',
    components: [
      { type: 'text', label: 'Texto', icon: 'text_fields' },
      { type: 'email', label: 'E-mail', icon: 'mail' },
      { type: 'phone', label: 'Telefone', icon: 'phone' },
      { type: 'number', label: 'Numero', icon: 'tag' },
      { type: 'date', label: 'Data', icon: 'calendar_month' },
      { type: 'time', label: 'Hora', icon: 'schedule' },
      { type: 'textarea', label: 'Texto Longo', icon: 'notes' },
    ],
  },
  {
    title: 'Selecao',
    components: [
      { type: 'select', label: 'Lista Suspensa', icon: 'arrow_drop_down_circle' },
      { type: 'select_search', label: 'Selecao com Busca', icon: 'search' },
      { type: 'radio', label: 'Escolha Unica', icon: 'radio_button_checked' },
      { type: 'checkbox', label: 'Multipla Escolha', icon: 'check_box' },
      { type: 'scale', label: 'Escala', icon: 'linear_scale' },
      { type: 'rating', label: 'Avaliacao', icon: 'star' },
    ],
  },
  {
    title: 'Avancados',
    components: [
      { type: 'matrix', label: 'Matriz', icon: 'grid_on' },
      { type: 'ranking', label: 'Ordenacao', icon: 'format_list_numbered' },
      { type: 'file', label: 'Arquivo', icon: 'attach_file' },
      { type: 'image', label: 'Imagem', icon: 'image' },
      { type: 'signature', label: 'Assinatura', icon: 'draw' },
      { type: 'geolocation', label: 'Geolocalizacao', icon: 'location_on' },
    ],
  },
  {
    title: 'Layout',
    components: [
      { type: 'html', label: 'HTML', icon: 'code' },
      { type: 'page_break', label: 'Quebra de Pagina', icon: 'insert_page_break' },
    ],
  },
])

const expandedGroups = ref<string[]>(['Campos Simples', 'Selecao'])

function toggleGroup(title: string) {
  const index = expandedGroups.value.indexOf(title)
  if (index === -1) {
    expandedGroups.value.push(title)
  } else {
    expandedGroups.value.splice(index, 1)
  }
}

function isGroupExpanded(title: string): boolean {
  return expandedGroups.value.includes(title)
}

function onDragStart(event: DragEvent, componentType: string) {
  event.dataTransfer?.setData('componentType', componentType)
}

function addToFirstSection(componentType: string) {
  const firstSection = store.schema.sections[0]
  if (firstSection) {
    store.addComponent(firstSection.id, componentType)
  }
}
</script>

<template>
  <div class="p-4">
    <h3 class="text-sm font-semibold text-foreground mb-4">Componentes</h3>

    <div class="space-y-2">
      <div
        v-for="group in componentGroups"
        :key="group.title"
        class="border border-border rounded-lg overflow-hidden"
      >
        <!-- Group Header -->
        <button
          class="w-full flex items-center justify-between px-3 py-2 bg-muted hover:bg-accent text-left transition-colors"
          @click="toggleGroup(group.title)"
        >
          <span class="text-sm font-medium text-foreground">{{ group.title }}</span>
          <span class="material-symbols-outlined text-[18px] text-muted-foreground transition-transform"
            :class="{ 'rotate-180': isGroupExpanded(group.title) }"
          >
            expand_more
          </span>
        </button>

        <!-- Group Content -->
        <div
          v-show="isGroupExpanded(group.title)"
          class="p-2 grid grid-cols-2 gap-1.5"
        >
          <button
            v-for="component in group.components"
            :key="component.type"
            :data-component-type="component.type"
            class="flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 cursor-grab transition-all"
            draggable="true"
            @dragstart="onDragStart($event, component.type)"
            @click="addToFirstSection(component.type)"
          >
            <span class="material-symbols-outlined text-[20px] text-muted-foreground">
              {{ component.icon }}
            </span>
            <span class="text-[10px] text-muted-foreground text-center leading-tight">
              {{ component.label }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
