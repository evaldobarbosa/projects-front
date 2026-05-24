<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

interface NavItem {
  name: string
  path: string
  icon: string
  iconFilled?: boolean
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Projetos', path: '/projects', icon: 'assignment' },
  { name: 'Contratos', path: '/contracts', icon: 'contract' },
  { name: 'Usuários', path: '/users', icon: 'group' },
  { name: 'Configurações', path: '/settings', icon: 'settings' },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col p-4 gap-2 z-50">
    <!-- Logo -->
    <div class="flex items-center gap-2 mb-6 px-1">
      <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">description</span>
      </div>
      <div>
        <h1 class="text-xl font-semibold text-foreground">FormAssistant</h1>
        <p class="text-xs text-muted-foreground">Enterprise Survey Tool</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 group"
        :class="isActive(item.path)
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
      >
        <span
          class="material-symbols-outlined"
          :style="isActive(item.path) ? `font-variation-settings: 'FILL' 1;` : ''"
          :class="isActive(item.path) ? '' : 'group-hover:text-primary'"
        >
          {{ item.icon }}
        </span>
        <span class="text-sm font-medium">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- Bottom Section -->
    <div class="mt-auto pt-4 border-t border-border space-y-1">
      <button class="w-full mb-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
        Criar Novo Formulário
      </button>

      <a
        href="#"
        class="flex items-center gap-4 px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200"
      >
        <span class="material-symbols-outlined">help</span>
        <span class="text-sm font-medium">Central de Ajuda</span>
      </a>

      <a
        href="#"
        class="flex items-center gap-4 px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200"
      >
        <span class="material-symbols-outlined">contact_support</span>
        <span class="text-sm font-medium">Suporte</span>
      </a>
    </div>
  </aside>
</template>
