<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const authStore = useAuthStore()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
      <p class="mt-1 text-muted-foreground">
        Bem-vindo, {{ authStore.userName }}! Gerencie seus projetos de pesquisa e questionários.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Projetos Ativos</span>
            <div class="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">assignment</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">0</div>
          <div class="text-muted-foreground text-sm mt-1">projetos em andamento</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Questionários</span>
            <div class="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">description</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">0</div>
          <div class="text-muted-foreground text-sm mt-1">formulários criados</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Respostas</span>
            <div class="w-8 h-8 bg-warning/10 text-warning rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">inbox</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">0</div>
          <div class="text-muted-foreground text-sm mt-1">coletadas em campo</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contratos</span>
            <div class="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">contract</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">0</div>
          <div class="text-muted-foreground text-sm mt-1">ativos no momento</div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card class="border-border hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">add_circle</span>
            Novo Projeto
          </CardTitle>
          <CardDescription>Crie um novo projeto de pesquisa</CardDescription>
        </CardHeader>
      </Card>

      <Card class="border-border hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">edit_document</span>
            Criar Formulário
          </CardTitle>
          <CardDescription>Construa um novo questionário</CardDescription>
        </CardHeader>
      </Card>

      <Card class="border-border hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">analytics</span>
            Ver Relatórios
          </CardTitle>
          <CardDescription>Analise os dados coletados</CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
