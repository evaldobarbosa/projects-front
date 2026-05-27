<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const validationErrors = ref<{ email?: string; password?: string }>({})

function validateForm(): boolean {
  validationErrors.value = {}

  if (!email.value) {
    validationErrors.value.email = 'O e-mail e obrigatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    validationErrors.value.email = 'Informe um e-mail valido.'
  }

  if (!password.value) {
    validationErrors.value.password = 'A senha e obrigatoria.'
  } else if (password.value.length < 6) {
    validationErrors.value.password = 'A senha deve ter no minimo 6 caracteres.'
  }

  return Object.keys(validationErrors.value).length === 0
}

async function handleSubmit() {
  authStore.clearError()

  if (!validateForm()) {
    return
  }

  const success = await authStore.login(email.value, password.value)

  if (success) {
    router.push('/')
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

onMounted(() => {
  authStore.clearError()
})
</script>

<template>
  <main class="flex min-h-screen">
    <!-- Left Side: Hero Section -->
    <section class="hidden lg:flex lg:w-1/2 relative items-end p-8 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');">
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- Logo Overlay -->
      <div class="absolute top-8 left-8 flex items-center gap-1 text-white z-10">
        <span class="material-symbols-outlined text-[32px]">assignment</span>
        <span class="text-2xl font-bold tracking-tight">FormAssistant</span>
      </div>

      <!-- Testimonial Overlay -->
      <div class="relative z-10 bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/20 max-w-lg">
        <p class="text-white text-xl font-medium mb-4 leading-relaxed">
          "Simply all the tools that my team and I need."
        </p>
        <div>
          <p class="text-white font-semibold">Karen Yue</p>
          <p class="text-white/80 text-sm">Director of Digital Marketing Technology</p>
        </div>
      </div>
    </section>

    <!-- Right Side: Login Form Section -->
    <section class="w-full lg:w-1/2 flex items-center justify-center p-4 bg-white">
      <div class="w-full max-w-[440px] px-4">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center justify-center gap-1 mb-8">
          <span class="material-symbols-outlined text-primary text-[32px]">assignment</span>
          <h1 class="text-2xl font-bold text-primary tracking-tight">FormAssistant</h1>
        </div>

        <!-- Header -->
        <div class="mb-8 text-center lg:text-left">
          <h2 class="text-3xl font-bold text-on-surface mb-2">Welcome back to FormAssistant</h2>
          <p class="text-on-surface-variant">Entre com suas credenciais para acessar o sistema</p>
        </div>

        <!-- Error Alert -->
        <div v-if="authStore.error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ authStore.error }}</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Email Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-on-surface" for="email">Email</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
              <input
                id="email"
                v-model="email"
                type="email"
                name="email"
                placeholder="alex.jordan@gmail.com"
                class="w-full h-12 pl-10 pr-4 bg-white border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm placeholder:text-outline"
                :class="validationErrors.email ? 'border-red-500' : 'border-outline-variant'"
              />
            </div>
            <p v-if="validationErrors.email" class="text-sm text-red-500">
              {{ validationErrors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-on-surface" for="password">Password</label>
              <a class="text-sm font-semibold text-primary hover:underline" href="#">Forgot password?</a>
            </div>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                class="w-full h-12 pl-10 pr-12 bg-white border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                :class="validationErrors.password ? 'border-red-500' : 'border-outline-variant'"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                @click="togglePassword"
              >
                <span class="material-symbols-outlined text-[20px]">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <p v-if="validationErrors.password" class="text-sm text-red-500">
              {{ validationErrors.password }}
            </p>
          </div>

          <!-- Remember Me Toggle -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-on-surface-variant">Remember sign in details</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="rememberMe" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <!-- Primary Action -->
          <button
            type="submit"
            class="w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-1"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span>{{ authStore.isLoading ? 'Carregando...' : 'Log in' }}</span>
          </button>

          <!-- Divider -->
          <div class="relative flex items-center py-4">
            <div class="flex-grow border-t border-outline-variant"></div>
            <span class="flex-shrink mx-4 text-sm text-outline uppercase tracking-wider">or</span>
            <div class="flex-grow border-t border-outline-variant"></div>
          </div>

          <!-- Social Login -->
          <button
            type="button"
            class="w-full h-12 border border-outline-variant rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition-all"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span class="text-sm font-medium text-on-surface">Continue with Google</span>
          </button>
        </form>

        <!-- Sign Up Link -->
        <div class="mt-8 text-center">
          <p class="text-sm text-on-surface-variant">
            Don't have an account?
            <a class="text-primary font-semibold hover:underline" href="#">Sign up</a>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
