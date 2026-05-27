<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => route.meta.title as string || '')
const pageSubtitle = computed(() => route.meta.subtitle as string || '')
</script>

<template>
  <header class="sticky top-0 bg-surface/80 backdrop-blur-md z-40 border-b border-outline-variant">
    <div class="flex justify-between items-center w-full px-xl h-[72px] max-w-[1440px] mx-auto">
      <!-- Title & Subtitle (from route meta) -->
      <div>
        <h2 class="font-h2 text-h2 text-primary tracking-tight leading-none">
          {{ pageTitle }}
        </h2>
        <p class="font-label-sm text-label-sm text-secondary">
          {{ pageSubtitle }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-lg">
        <!-- Notifications -->
        <button class="p-sm hover:bg-surface-container-low transition-colors rounded-full text-secondary relative">
          <span class="material-symbols-outlined">notifications</span>
          <!-- Notification badge (optional) -->
          <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
        </button>
      </div>
    </div>
  </header>
</template>
