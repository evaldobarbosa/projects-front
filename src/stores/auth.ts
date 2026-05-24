import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, type User, type ApiError } from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.name ?? '')

  // Actions
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.login(email, password)
      user.value = response.user
      return true
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.errors?.email?.[0] ?? apiError.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true

    try {
      await api.logout()
    } finally {
      user.value = null
      isLoading.value = false
    }
  }

  async function fetchUser(): Promise<void> {
    if (!api.hasToken()) {
      isInitialized.value = true
      return
    }

    isLoading.value = true

    try {
      const response = await api.me()
      user.value = response.user
    } catch {
      api.clearToken()
      user.value = null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,
    // Getters
    isAuthenticated,
    userName,
    // Actions
    login,
    logout,
    fetchUser,
    clearError,
  }
})
