<script setup lang="ts">
import { useBuilderStore } from '@/stores/builder'
import SectionBlock from './SectionBlock.vue'
import { Button } from '@/components/ui/button'

const store = useBuilderStore()

function handleAddSection() {
  store.addSection()
}
</script>

<template>
  <div class="p-8 min-h-full" style="padding: 2rem; min-height: 100%; width: 100%;">
    <div class="mx-auto space-y-6" style="max-width: 900px; margin: 0 auto; width: 100%;">
      <!-- Sections -->
      <SectionBlock
        v-for="section in store.schema.sections"
        :key="section.id"
        :section="section"
      />

      <!-- Add Section Button -->
      <div class="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Button
          variant="outline"
          @click="handleAddSection"
        >
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Adicionar Secao
        </Button>
      </div>

      <!-- Empty State -->
      <div
        v-if="store.schema.sections.length === 0"
        class="text-center py-12"
      >
        <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-[32px] text-muted-foreground">dashboard_customize</span>
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">Comece a construir</h3>
        <p class="text-muted-foreground mb-4">
          Arraste componentes da paleta ou clique para adicionar uma nova secao.
        </p>
        <Button @click="handleAddSection">
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Adicionar Primeira Secao
        </Button>
      </div>
    </div>
  </div>
</template>
