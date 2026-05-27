<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBuilderStore } from '@/stores/builder'
import { FormBuilder } from '@/components/builder'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const store = useBuilderStore()

const questionnaireId = Number(route.params.id)

async function load() {
  const success = await store.loadQuestionnaire(questionnaireId)
  if (!success) {
    // If failed to load, redirect back
    router.push('/questionnaires')
  }
}

function handleBack() {
  if (store.isDirty) {
    if (!confirm('Existem alteracoes nao salvas. Deseja sair mesmo assim?')) {
      return
    }
  }
  router.push(`/questionnaires/${questionnaireId}`)
}

function handlePreview() {
  router.push(`/questionnaires/${questionnaireId}/preview`)
}

onMounted(() => {
  load()
})

onUnmounted(() => {
  store.cancelAutoSave()
  store.reset()
})
</script>

<template>
  <div class="fixed inset-0 flex flex-col bg-background" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
    <!-- Top Navigation -->
    <header class="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0" style="height: 3.5rem; flex-shrink: 0;">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="sm" @click="handleBack">
          <span class="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
          Voltar
        </Button>
        <div class="h-6 w-px bg-border"></div>
        <span class="text-sm text-muted-foreground">Form Builder</span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Auto-save Status Indicator -->
        <div v-if="store.isAutoSaving" class="flex items-center gap-2 text-xs text-muted-foreground">
          <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
          Salvando...
        </div>
        <div v-else-if="store.lastAutoSaveTime && !store.isDirty" class="flex items-center gap-2 text-xs text-green-600">
          <span class="material-symbols-outlined text-[16px]">check_circle</span>
          Salvo automaticamente
        </div>
        <div v-else-if="store.isDirty" class="flex items-center gap-2 text-xs text-orange-600">
          <span class="material-symbols-outlined text-[16px]">pending</span>
          Alterações pendentes
        </div>

        <div class="h-6 w-px bg-border"></div>

        <Button variant="outline" size="sm" @click="handlePreview">
          <span class="material-symbols-outlined text-[18px] mr-1">visibility</span>
          Preview
        </Button>
      </div>
    </header>

    <!-- Builder Content -->
    <main class="flex-1 overflow-hidden" style="flex: 1 1 0%; overflow: hidden; min-height: 0; display: flex; flex-direction: column;">
      <FormBuilder style="flex: 1; display: flex; flex-direction: column; min-height: 0;" />
    </main>
  </div>
</template>
