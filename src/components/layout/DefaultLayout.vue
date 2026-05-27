<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
</script>

<template>
  <div class="min-h-screen bg-surface">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <main class="ml-64 flex flex-col min-h-screen">
      <!-- Top Navbar -->
      <AppNavbar />

      <!-- Page Content -->
      <div class="p-8 flex-1 max-w-[1440px] mx-auto w-full">
        <slot />
      </div>

      <!-- Footer -->
      <footer class="p-6 mt-auto bg-surface-container border-t border-outline-variant">
        <div class="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-xs font-medium text-secondary">
            &copy; 2024 FormAssistant Enterprise. Todos os direitos reservados.
          </p>
          <div class="flex gap-6">
            <a href="#" class="text-xs font-medium text-secondary hover:text-primary transition-colors">Termos de Uso</a>
            <a href="#" class="text-xs font-medium text-secondary hover:text-primary transition-colors">Privacidade</a>
            <a href="#" class="text-xs font-medium text-secondary hover:text-primary transition-colors">API Documentacao</a>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>
