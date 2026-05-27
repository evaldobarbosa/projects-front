<script setup lang="ts">
import { ref } from 'vue'
import { useBuilderStore } from '@/stores/builder'
import ComponentBlock from './ComponentBlock.vue'
import type { Section } from '@/lib/api'

const props = defineProps<{
  section: Section
}>()

const store = useBuilderStore()
const isEditing = ref(false)
const editTitle = ref(props.section.title)

const isSelected = computed(() => store.selectedSectionId === props.section.id)

import { computed } from 'vue'

function handleSelect() {
  store.selectSection(props.section.id)
  store.selectComponent(null)
}

function startEditing() {
  editTitle.value = props.section.title
  isEditing.value = true
}

function saveTitle() {
  if (editTitle.value.trim()) {
    store.updateSection(props.section.id, { title: editTitle.value.trim() })
  }
  isEditing.value = false
}

function cancelEditing() {
  editTitle.value = props.section.title
  isEditing.value = false
}

function handleRemove() {
  if (confirm(`Tem certeza que deseja excluir a secao "${props.section.title}"?`)) {
    store.removeSection(props.section.id)
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const componentType = event.dataTransfer?.getData('componentType')
  if (componentType) {
    store.addComponent(props.section.id, componentType)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}
</script>

<template>
  <div
    class="border border-border rounded-lg bg-card transition-all"
    :class="{
      'ring-2 ring-primary': isSelected,
    }"
    @click.self="handleSelect"
  >
    <!-- Section Header -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 rounded-t-lg cursor-pointer"
      @click="handleSelect"
    >
      <div class="flex items-center gap-3 flex-1">
        <span class="material-symbols-outlined text-muted-foreground cursor-grab">drag_indicator</span>

        <div v-if="isEditing" class="flex items-center gap-2 flex-1" @click.stop>
          <input
            v-model="editTitle"
            type="text"
            class="flex-1 px-2 py-1 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
            @keyup.enter="saveTitle"
            @keyup.esc="cancelEditing"
            @blur="saveTitle"
          />
        </div>
        <h4 v-else class="font-medium text-foreground">{{ section.title }}</h4>
      </div>

      <div class="flex items-center gap-1" @click.stop>
        <button
          class="p-1.5 hover:bg-accent rounded text-muted-foreground"
          title="Renomear"
          @click="startEditing"
        >
          <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          class="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground"
          title="Excluir Secao"
          @click="handleRemove"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>

    <!-- Section Content -->
    <div
      class="p-4 min-h-[100px]"
      @drop="handleDrop"
      @dragover="handleDragOver"
    >
      <div v-if="section.components.length === 0" class="text-center py-8 text-muted-foreground">
        <span class="material-symbols-outlined text-[32px] mb-2 block">widgets</span>
        <p class="text-sm">Arraste componentes aqui ou clique na paleta para adicionar</p>
      </div>

      <div v-else class="space-y-3">
        <ComponentBlock
          v-for="component in section.components"
          :key="component.id"
          :component="component"
          :section-id="section.id"
        />
      </div>
    </div>
  </div>
</template>
