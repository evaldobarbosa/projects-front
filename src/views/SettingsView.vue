<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground">Configurações</h1>
      <p class="mt-1 text-muted-foreground">Gerencie as configurações do sistema e preferências.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1">
        <Card class="border-border">
          <CardContent class="p-4">
            <nav class="space-y-1">
              <a
                href="#general"
                class="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-lg"
              >
                <span class="material-symbols-outlined text-[20px]">settings</span>
                Geral
              </a>
              <a
                href="#profile"
                class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">person</span>
                Perfil
              </a>
              <a
                href="#security"
                class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">lock</span>
                Segurança
              </a>
              <a
                href="#notifications"
                class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">notifications</span>
                Notificações
              </a>
              <a
                href="#integrations"
                class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">extension</span>
                Integrações
              </a>
            </nav>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- General Settings -->
        <Card id="general" class="border-border">
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Configurações básicas da organização</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-2">
              <Label htmlFor="org-name">Nome da Organização</Label>
              <Input id="org-name" value="Minha Empresa" />
            </div>

            <div class="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <select
                id="timezone"
                class="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
              >
                <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                <option value="America/New_York">América/New York (GMT-5)</option>
                <option value="Europe/London">Europa/Londres (GMT+0)</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <select
                id="language"
                class="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div class="flex justify-end">
              <Button>Salvar Alterações</Button>
            </div>
          </CardContent>
        </Card>

        <!-- Profile Settings -->
        <Card id="profile" class="border-border">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center gap-6">
              <div class="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-[40px]">person</span>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <span class="material-symbols-outlined text-[16px] mr-2">upload</span>
                  Alterar Foto
                </Button>
                <p class="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF. Máx 2MB.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label htmlFor="first-name">Nome</Label>
                <Input id="first-name" value="Test" />
              </div>
              <div class="space-y-2">
                <Label htmlFor="last-name">Sobrenome</Label>
                <Input id="last-name" value="User" />
              </div>
            </div>

            <div class="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value="test@example.com" />
            </div>

            <div class="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(00) 00000-0000" />
            </div>

            <div class="flex justify-end">
              <Button>Salvar Perfil</Button>
            </div>
          </CardContent>
        </Card>

        <!-- Security Settings -->
        <Card id="security" class="border-border">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Gerencie sua senha e autenticação</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
              <div class="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>

            <div class="flex justify-end">
              <Button>Alterar Senha</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
