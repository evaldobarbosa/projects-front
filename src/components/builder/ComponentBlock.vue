<script setup lang="ts">
import { computed } from 'vue'
import { useBuilderStore } from '@/stores/builder'
import type { FormComponent } from '@/lib/api'

const props = defineProps<{
  component: FormComponent
  sectionId: string
}>()

const store = useBuilderStore()

const isSelected = computed(() => store.selectedComponentId === props.component.id)

function handleSelect() {
  store.selectComponent(props.component.id)
  store.selectSection(null)
}

function handleRemove() {
  store.removeComponent(props.component.id)
}

function getComponentIcon(type: string): string {
  const icons: Record<string, string> = {
    text: 'text_fields',
    email: 'mail',
    phone: 'phone',
    number: 'tag',
    date: 'calendar_month',
    time: 'schedule',
    textarea: 'notes',
    select: 'arrow_drop_down_circle',
    select_search: 'search',
    radio: 'radio_button_checked',
    checkbox: 'check_box',
    scale: 'linear_scale',
    rating: 'star',
    matrix: 'grid_on',
    ranking: 'format_list_numbered',
    file: 'attach_file',
    image: 'image',
    signature: 'draw',
    geolocation: 'location_on',
    cascade: 'account_tree',
    html: 'code',
    page_break: 'insert_page_break',
    section: 'dashboard',
  }
  return icons[type] || 'help'
}

function getComponentTypeName(type: string): string {
  const names: Record<string, string> = {
    text: 'Texto',
    email: 'E-mail',
    phone: 'Telefone',
    number: 'Numero',
    date: 'Data',
    time: 'Hora',
    textarea: 'Texto Longo',
    select: 'Lista Suspensa',
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
    html: 'HTML',
    page_break: 'Quebra de Pagina',
  }
  return names[type] || type
}
</script>

<template>
  <div
    :data-component-id="component.id"
    :data-component-type="component.type"
    class="flex items-start gap-3 p-3 border border-border rounded-lg bg-background cursor-pointer transition-all hover:border-primary/50"
    :class="{
      'ring-2 ring-primary border-primary': isSelected,
    }"
    draggable="true"
    @click="handleSelect"
  >
    <!-- Drag Handle -->
    <span class="material-symbols-outlined text-muted-foreground cursor-grab mt-0.5">
      drag_indicator
    </span>

    <!-- Component Icon -->
    <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
      <span class="material-symbols-outlined text-[18px] text-muted-foreground">
        {{ getComponentIcon(component.type) }}
      </span>
    </div>

    <!-- Component Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="font-medium text-foreground truncate">{{ component.label }}</span>
        <span
          v-if="component.required"
          class="text-destructive text-xs font-semibold"
          title="Campo obrigatorio"
        >*</span>
      </div>
      <div class="flex items-center gap-2 mt-0.5">
        <span class="text-xs text-muted-foreground">{{ getComponentTypeName(component.type) }}</span>
        <span class="text-xs text-muted-foreground/60">|</span>
        <span class="text-xs text-muted-foreground/60 font-mono">{{ component.name }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1" @click.stop>
      <button
        data-action="delete-component"
        class="p-1 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground"
        title="Excluir"
        @click="handleRemove"
      >
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  </div>
</template>
