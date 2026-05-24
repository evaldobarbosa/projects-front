<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/ui/input'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Breadcrumb generation based on current route
const breadcrumbs = computed(() => {
  const crumbs: { name: string; path: string; active: boolean }[] = [
    { name: 'Home', path: '/', active: false }
  ]

  const pathSegments = route.path.split('/').filter(Boolean)

  const routeNames: Record<string, string> = {
    'projects': 'Projetos',
    'contracts': 'Contratos',
    'users': 'Usuários',
    'settings': 'Configurações',
    'form-builder': 'Form Builder',
  }

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const name = routeNames[segment] || segment
    crumbs.push({
      name,
      path: currentPath,
      active: index === pathSegments.length - 1
    })
  })

  return crumbs
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="h-16 w-full bg-card border-b border-border flex justify-between items-center px-6 sticky top-0 z-40">
    <!-- Left: Search -->
    <div class="flex items-center gap-6">
      <div class="relative">
        <span class="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          <span class="material-symbols-outlined text-[20px]">search</span>
        </span>
        <Input
          type="text"
          placeholder="Buscar projetos ou contratos..."
          class="pl-10 pr-4 py-2 w-80 bg-muted border-border"
        />
      </div>
    </div>

    <!-- Right: Breadcrumb + Actions -->
    <div class="flex items-center gap-4">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 mr-4">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
          <RouterLink
            v-if="!crumb.active"
            :to="crumb.path"
            class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {{ crumb.name }}
          </RouterLink>
          <span v-else class="text-sm font-medium text-primary">
            {{ crumb.name }}
          </span>
          <span v-if="index < breadcrumbs.length - 1" class="text-border">/</span>
        </template>
      </nav>

      <!-- Notifications -->
      <button class="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
        <span class="material-symbols-outlined">notifications</span>
      </button>

      <!-- User Profile -->
      <div class="flex items-center gap-2 pl-4 border-l border-border">
        <div class="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <span class="text-sm font-medium">
            {{ authStore.userName?.charAt(0)?.toUpperCase() || 'U' }}
          </span>
        </div>
        <span class="text-sm font-medium text-foreground">{{ authStore.userName }}</span>

        <!-- Dropdown Menu -->
        <div class="relative group">
          <button class="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <span class="material-symbols-outlined">expand_more</span>
          </button>

          <div class="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div class="py-1">
              <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <span class="material-symbols-outlined text-[18px]">person</span>
                Meu Perfil
              </a>
              <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <span class="material-symbols-outlined text-[18px]">settings</span>
                Configurações
              </a>
              <hr class="my-1 border-border">
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <span class="material-symbols-outlined text-[18px]">logout</span>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
