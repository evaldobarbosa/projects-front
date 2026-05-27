import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth Routes (Login, Register, etc)
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/views/LoginView.vue'),
          meta: {
            guest: true
          }
        }
      ]
    },

    // Full-screen builder routes (no AppLayout sidebar)
    {
      path: '/questionnaires/:id/builder',
      name: 'QuestionnaireBuilder',
      component: () => import('@/views/QuestionnaireBuilderView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Construtor de Formulários',
        subtitle: 'Edite seu questionário com drag & drop'
      }
    },
    {
      path: '/questionnaires/:id/preview',
      name: 'QuestionnairePreview',
      component: () => import('@/views/QuestionnairePreviewView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Preview do Questionário',
        subtitle: 'Visualize como o formulário será exibido'
      }
    },

    // App Routes (Protected)
    {
      path: '/',
      component: AppLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: {
            title: 'Dashboard',
            subtitle: 'Manage your organizational forms and data metrics'
          }
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('@/views/ProjectsView.vue'),
          meta: {
            title: 'Projetos',
            subtitle: 'Gerencie suas pesquisas e acompanhe o progresso em tempo real.'
          }
        },
        {
          path: 'projects/new',
          name: 'ProjectsNew',
          component: () => import('@/views/ProjectFormView.vue'),
          meta: {
            title: 'Novo Projeto',
            subtitle: 'Crie um novo projeto de pesquisa'
          }
        },
        {
          path: 'projects/:id',
          name: 'ProjectDetail',
          component: () => import('@/views/ProjectDetailView.vue'),
          meta: {
            title: 'Detalhes do Projeto',
            subtitle: 'Visualize e gerencie informações do projeto'
          }
        },
        {
          path: 'projects/:id/edit',
          name: 'ProjectEdit',
          component: () => import('@/views/ProjectFormView.vue'),
          meta: {
            title: 'Editar Projeto',
            subtitle: 'Edite as informações do projeto'
          }
        },
        {
          path: 'projects/:id/builder',
          name: 'FormBuilder',
          component: () => import('@/views/FormBuilderView.vue'),
          meta: {
            title: 'Form Builder',
            subtitle: 'Construa e edite seus formulários'
          }
        },
        {
          path: 'questionnaires',
          name: 'Questionnaires',
          component: () => import('@/views/QuestionnairesView.vue'),
          meta: {
            title: 'Questionários',
            subtitle: 'Gerencie seus formulários e versões'
          }
        },
        {
          path: 'questionnaires/new',
          name: 'QuestionnaireNew',
          component: () => import('@/views/QuestionnaireFormView.vue'),
          meta: {
            title: 'Novo Questionário',
            subtitle: 'Crie um novo questionário'
          }
        },
        {
          path: 'questionnaires/:id',
          name: 'QuestionnaireDetail',
          component: () => import('@/views/QuestionnaireDetailView.vue'),
          meta: {
            title: 'Detalhes do Questionário',
            subtitle: 'Visualize e gerencie o questionário'
          }
        },
        {
          path: 'questionnaires/:id/edit',
          name: 'QuestionnaireEdit',
          component: () => import('@/views/QuestionnaireFormView.vue'),
          meta: {
            title: 'Editar Questionário',
            subtitle: 'Edite as informações do questionário'
          }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/UsersView.vue'),
          meta: {
            title: 'Usuários',
            subtitle: 'Gerencie os usuários do sistema'
          }
        },
        {
          path: 'contracts',
          name: 'Contracts',
          component: () => import('@/views/ContractsView.vue'),
          meta: {
            title: 'Contratos',
            subtitle: 'Gerencie contratos e acordos comerciais'
          }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/SettingsView.vue'),
          meta: {
            title: 'Configurações',
            subtitle: 'Configure as preferências do sistema'
          }
        }
      ]
    },

    // Redirect to login if no match
    {
      path: '/:pathMatch(.*)*',
      redirect: '/auth/login'
    }
  ],
})

router.beforeEach(async (to) => {
  console.log('[Router] Navegando para:', to.path, 'Meta:', to.meta)

  const authStore = useAuthStore()

  // Inicializa o store se ainda não foi inicializado
  if (!authStore.isInitialized) {
    console.log('[Router] Auth store não inicializado, inicializando...')
    await authStore.fetchUser()
  }

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const isGuestRoute = to.meta.guest

  console.log('[Router] isAuthenticated:', isAuthenticated, 'requiresAuth:', requiresAuth, 'isGuestRoute:', isGuestRoute)

  // Rota requer autenticacao e usuario não está autenticado
  if (requiresAuth && !isAuthenticated) {
    console.log('[Router] Rota protegida e não autenticado, redirecionando para Login')
    return { name: 'Login' }
  }

  // Rota é apenas para guests e usuario está autenticado
  if (isGuestRoute && isAuthenticated) {
    console.log('[Router] Rota de guest e autenticado, redirecionando para Dashboard')
    return { name: 'Dashboard' }
  }

  console.log('[Router] Navegação permitida')
  // Permite a navegação
  return true
})

export default router
