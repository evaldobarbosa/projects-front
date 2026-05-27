<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

interface NavItem {
  name: string
  path: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { name: 'Projects', path: '/projects', icon: 'assignment', label: 'Projetos' },
  { name: 'Users', path: '/users', icon: 'group', label: 'Usuários' },
  { name: 'Contracts', path: '/contracts', icon: 'description', label: 'Contratos' },
  { name: 'Settings', path: '/settings', icon: 'settings', label: 'Configurações' },
]

const supportLinks: NavItem[] = [
  { name: 'Help', path: '/help', icon: 'help', label: 'Central de Ajuda' },
  { name: 'Support', path: '/support', icon: 'contact_support', label: 'Suporte' },
]

const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/'
  }
  return route.path.startsWith(path)
}

const getIconStyle = (path: string) => {
  return isActive(path) ? "font-variation-settings: 'FILL' 1;" : ''
}
</script>

<template>
  <aside class="fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-outline-variant flex flex-col p-md gap-sm z-50">
    <!-- Brand Section -->
    <div class="flex items-center gap-sm mb-lg px-xs">
      <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
        <span class="material-symbols-outlined">architecture</span>
      </div>
      <div>
        <h1 class="font-h3 text-h3 text-on-surface leading-none">FormAssistant</h1>
        <p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
          Enterprise Survey Tool
        </p>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"
        :class="isActive(item.path)
          ? 'bg-secondary-container text-on-secondary-container'
          : 'text-on-surface-variant hover:bg-surface-container-high'"
      >
        <span
          class="material-symbols-outlined"
          :style="getIconStyle(item.path)"
        >
          {{ item.icon }}
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Support Section -->
    <div class="mt-auto space-y-1 pb-md">
      <a
        v-for="link in supportLinks"
        :key="link.path"
        href="#"
        class="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"
      >
        <span class="material-symbols-outlined">{{ link.icon }}</span>
        <span>{{ link.label }}</span>
      </a>
    </div>

    <!-- User Profile Dropdown (Footer) -->
    <div class="border-t border-outline-variant pt-md px-xs">
      <button class="w-full flex items-center gap-md p-sm hover:bg-surface-container-high rounded-xl transition-colors text-left">
        <img
          alt="User profile photo"
          class="w-10 h-10 rounded-full object-cover border border-outline-variant shadow-sm"
          src="https://via.placeholder.com/40"
        />
        <div class="flex-1 min-w-0">
          <p class="font-label-md text-label-md text-on-surface truncate">Admin User</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant truncate">Administrator</p>
        </div>
        <span class="material-symbols-outlined text-outline">unfold_more</span>
      </button>
    </div>
  </aside>
</template>
