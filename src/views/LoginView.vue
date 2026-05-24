<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const validationErrors = ref<{ email?: string; password?: string }>({})

function validateForm(): boolean {
  validationErrors.value = {}

  if (!email.value) {
    validationErrors.value.email = 'O e-mail é obrigatório.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    validationErrors.value.email = 'Informe um e-mail válido.'
  }

  if (!password.value) {
    validationErrors.value.password = 'A senha é obrigatória.'
  } else if (password.value.length < 6) {
    validationErrors.value.password = 'A senha deve ter no mínimo 6 caracteres.'
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

onMounted(() => {
  authStore.clearError()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md border-border">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl text-primary">FormAssistant</CardTitle>
        <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <Alert v-if="authStore.error" variant="destructive">
            <AlertDescription>{{ authStore.error }}</AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="email">E-mail</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              :class="{ 'border-destructive': validationErrors.email }"
            />
            <p v-if="validationErrors.email" class="text-sm text-destructive">
              {{ validationErrors.email }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="password">Senha</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Sua senha"
              :class="{ 'border-destructive': validationErrors.password }"
            />
            <p v-if="validationErrors.password" class="text-sm text-destructive">
              {{ validationErrors.password }}
            </p>
          </div>

          <Button
            type="submit"
            class="w-full"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading">Entrando...</span>
            <span v-else>Entrar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
