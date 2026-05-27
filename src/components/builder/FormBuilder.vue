<script setup lang="ts">
import { computed } from 'vue'
import { useBuilderStore } from '@/stores/builder'
import ComponentPalette from './ComponentPalette.vue'
import FormCanvas from './FormCanvas.vue'
import EnhancedPropertiesPanel from './EnhancedPropertiesPanel.vue'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const store = useBuilderStore()

const showPropertiesPanel = computed(() => {
  return store.selectedComponentId !== null || store.selectedSectionId !== null
})

async function handleSave() {
  await store.saveVersion()
}

async function handlePublish() {
  if (!confirm('Tem certeza que deseja publicar esta versao?')) return
  await store.publishVersion()
}
</script>

<template>
  <div class="h-full flex flex-col" style="height: 100%; display: flex; flex-direction: column;" data-testid="form-builder">
    <!-- Toolbar -->
    <div class="flex-shrink-0 h-14 border-b border-border bg-card flex items-center justify-between px-4" style="height: 3.5rem; flex-shrink: 0;">
      <div class="flex items-center gap-4">
        <h2 class="font-semibold text-foreground">
          {{ store.questionnaire?.title || 'Carregando...' }}
        </h2>

        <!-- Status badges -->
        <span v-if="store.isAutoSaving" class="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          <span class="material-symbols-outlined text-[14px] animate-spin">sync</span>
          Salvando automaticamente...
        </span>
        <span v-else-if="store.lastAutoSaveTime && !store.isDirty" class="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          <span class="material-symbols-outlined text-[14px]">check_circle</span>
          Salvo
        </span>
        <span v-else-if="store.isDirty" class="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          <span class="material-symbols-outlined text-[14px]">pending</span>
          Alterações pendentes
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground mr-4">
          {{ store.componentCount }} componentes
        </span>

        <Button
          variant="outline"
          size="sm"
          :disabled="!store.isDirty || store.isSaving"
          @click="handleSave"
        >
          <span class="material-symbols-outlined text-[18px] mr-1">save</span>
          {{ store.isSaving ? 'Salvando...' : 'Salvar' }}
        </Button>

        <Button
          size="sm"
          :disabled="store.isDirty || store.isSaving"
          @click="handlePublish"
        >
          <span class="material-symbols-outlined text-[18px] mr-1">publish</span>
          Publicar
        </Button>
      </div>
    </div>

    <!-- Error Alert -->
    <Alert v-if="store.error" variant="destructive" class="m-4">
      <AlertDescription>
        {{ store.error }}
        <button class="ml-2 underline" @click="store.clearError">Fechar</button>
      </AlertDescription>
    </Alert>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex-1 flex items-center justify-center" style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-muted-foreground">Carregando questionario...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div
      v-show="!store.isLoading"
      class="overflow-hidden"
      style="flex: 1 1 0%; min-height: 0; display: flex; flex-direction: row;"
    >
      <!-- Component Palette (Left) -->
      <div
        class="overflow-y-auto border-r border-border bg-card"
        style="width: 288px; flex-shrink: 0;"
      >
        <ComponentPalette />
      </div>

      <!-- Form Canvas (Center) -->
      <div
        class="overflow-y-auto bg-background"
        style="flex: 1 1 auto; min-width: 600px; width: auto;"
      >
        <FormCanvas />
      </div>

      <!-- Properties Panel (Right) -->
      <div
        v-if="showPropertiesPanel"
        class="overflow-y-auto border-l border-border bg-card"
        style="width: 320px; flex-shrink: 0;"
      >
        <EnhancedPropertiesPanel />
      </div>
    </div>
  </div>
</template>
