<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
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
    </main>
  </div>
</template>
