<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Usuários</h1>
        <p class="mt-1 text-muted-foreground">Gerencie os usuários e permissões do sistema.</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline">
          <span class="material-symbols-outlined text-[18px] mr-2">download</span>
          Exportar
        </Button>
        <Button>
          <span class="material-symbols-outlined text-[18px] mr-2">person_add</span>
          Novo Usuário
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
            <div class="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">1</div>
          <div class="text-muted-foreground text-sm mt-1">usuários cadastrados</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ativos</span>
            <div class="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">1</div>
          <div class="text-muted-foreground text-sm mt-1">usuários ativos</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes</span>
            <div class="w-8 h-8 bg-warning/10 text-warning rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">pending</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">0</div>
          <div class="text-muted-foreground text-sm mt-1">convites pendentes</div>
        </CardContent>
      </Card>

      <Card class="border-border">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Administradores</span>
            <div class="w-8 h-8 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
          </div>
          <div class="text-3xl font-bold text-foreground">1</div>
          <div class="text-muted-foreground text-sm mt-1">com acesso total</div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card class="mb-6 border-border">
      <CardContent class="p-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border border-border">
              <span class="text-sm text-muted-foreground">Perfil:</span>
              <select class="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-foreground">
                <option value="">Todos</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="researcher">Pesquisador</option>
                <option value="interviewer">Entrevistador</option>
              </select>
            </div>

            <div class="relative">
              <Input
                placeholder="Buscar usuários..."
                class="pl-10 w-64"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <span class="material-symbols-outlined text-[18px]">search</span>
              </span>
            </div>
          </div>

          <button class="text-primary text-sm hover:underline">
            Limpar Filtros
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Users Table -->
    <Card class="border-border">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted border-b border-border">
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Perfil</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Último Acesso</th>
              <th class="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr class="hover:bg-muted/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium">T</span>
                  </div>
                  <span class="font-medium text-foreground">Test User</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-foreground">test@example.com</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Administrador
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground">Agora</td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                  Ativo
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Editar">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button class="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Excluir">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
