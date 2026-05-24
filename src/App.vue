<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { DefaultLayout } from '@/components/layout'

const authStore = useAuthStore()
</script>

<template>
  <!-- Authenticated: Use DefaultLayout with Sidebar + Navbar -->
  <DefaultLayout v-if="authStore.isAuthenticated">
    <RouterView />
  </DefaultLayout>

  <!-- Not authenticated: Simple layout for login -->
  <RouterView v-else />
</template>
