import { test, expect } from '@playwright/test'

test.describe('Captura de Screenshots da Aplicação', () => {
  test.beforeEach(async ({ page }) => {
    // Mock da API de autenticação
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 1,
            name: 'Usuário Demo',
            email: 'demo@formassistant.com'
          }
        })
      })
    })

    // Mock da API de projetos
    await page.route('**/api/projects*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: {
            data: [
              {
                id: 1,
                name: 'Pesquisa de Satisfação 2026',
                description: 'Pesquisa anual de satisfação dos clientes',
                status: 'in_field',
                start_date: '2026-01-15',
                end_date: '2026-12-31',
                owner: { id: 1, name: 'João Silva' },
                contracts_count: 2,
                created_at: '2026-01-15T10:00:00Z',
                updated_at: '2026-05-27T10:00:00Z'
              },
              {
                id: 2,
                name: 'NPS Trimestral',
                description: 'Medição de Net Promoter Score',
                status: 'draft',
                start_date: '2026-06-01',
                end_date: '2026-06-30',
                owner: { id: 2, name: 'Maria Santos' },
                contracts_count: 1,
                created_at: '2026-05-20T10:00:00Z',
                updated_at: '2026-05-27T10:00:00Z'
              }
            ],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 2
          },
          stats: {
            total: 2,
            draft: 1,
            in_field: 1,
            finished: 0,
            archived: 0
          }
        })
      })
    })

    // Mock da API de projeto individual
    await page.route('**/api/projects/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          project: {
            id: 1,
            name: 'Pesquisa de Satisfação 2026',
            description: 'Pesquisa anual de satisfação dos clientes',
            status: 'in_field',
            start_date: '2026-01-15',
            end_date: '2026-12-31',
            owner: { id: 1, name: 'João Silva', email: 'joao@empresa.com' },
            contracts: [
              { id: 1, name: 'Contrato Pesquisa 2026', code: 'C-2026-001' }
            ],
            created_at: '2026-01-15T10:00:00Z',
            updated_at: '2026-05-27T10:00:00Z'
          }
        })
      })
    })

    // Mock da API de questionários
    await page.route('**/api/questionnaires*', async (route) => {
      if (route.request().url().includes('project_id=1')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            questionnaires: {
              data: [
                {
                  id: 1,
                  project_id: 1,
                  title: 'Questionário Principal - Satisfação',
                  description: 'Questionário completo de satisfação',
                  status: 'published',
                  active_version_id: 1,
                  responses_count: 245,
                  created_at: '2026-01-15T10:00:00Z'
                }
              ],
              current_page: 1,
              last_page: 1,
              per_page: 10,
              total: 1
            }
          })
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            questionnaires: {
              data: [],
              current_page: 1,
              last_page: 1,
              per_page: 10,
              total: 0
            }
          })
        })
      }
    })

    // Mock da API de questionário individual
    await page.route('**/api/questionnaires/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questionnaire: {
            id: 1,
            project_id: 1,
            title: 'Questionário Principal - Satisfação',
            description: 'Questionário completo de satisfação',
            status: 'published',
            active_version_id: 1,
            active_version: {
              id: 1,
              version: 1,
              status: 'published',
              schema: {
                sections: [
                  {
                    id: 'section_1',
                    title: 'Dados Pessoais',
                    components: [
                      {
                        id: 'comp_1',
                        type: 'text',
                        label: 'Nome Completo',
                        name: 'nome_completo',
                        required: true,
                        properties: {
                          placeholder: 'Digite seu nome completo',
                          helpText: 'Nome completo sem abreviações'
                        },
                        validations: [
                          { type: 'min_length', value: 3, message: 'Mínimo de 3 caracteres' }
                        ]
                      },
                      {
                        id: 'comp_2',
                        type: 'email',
                        label: 'E-mail',
                        name: 'email',
                        required: true,
                        properties: {
                          placeholder: 'seu@email.com'
                        },
                        validations: [
                          { type: 'email', message: 'Digite um e-mail válido' }
                        ]
                      },
                      {
                        id: 'comp_3',
                        type: 'phone',
                        label: 'Telefone',
                        name: 'telefone',
                        required: false,
                        properties: {
                          placeholder: '(00) 00000-0000',
                          mask: '(##) #####-####'
                        },
                        validations: []
                      }
                    ]
                  },
                  {
                    id: 'section_2',
                    title: 'Avaliação',
                    components: [
                      {
                        id: 'comp_4',
                        type: 'rating',
                        label: 'Como você avalia nosso atendimento?',
                        name: 'avaliacao_atendimento',
                        required: true,
                        properties: {
                          max: 5
                        },
                        validations: []
                      },
                      {
                        id: 'comp_5',
                        type: 'textarea',
                        label: 'Comentários adicionais',
                        name: 'comentarios',
                        required: false,
                        properties: {
                          placeholder: 'Deixe seus comentários aqui...',
                          rows: 4
                        },
                        validations: []
                      }
                    ]
                  }
                ],
                settings: {
                  showProgressBar: true,
                  allowBackNavigation: true
                }
              }
            },
            responses_count: 245,
            created_at: '2026-01-15T10:00:00Z'
          }
        })
      })
    })

    // Mock da API de contratos
    await page.route('**/api/contracts*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          contracts: {
            data: [
              {
                id: 1,
                code: 'C-2026-001',
                name: 'Contrato Pesquisa 2026',
                status: 'active',
                value: 150000.00,
                start_date: '2026-01-01',
                end_date: '2026-12-31',
                created_at: '2025-12-15T10:00:00Z'
              }
            ],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 1
          }
        })
      })
    })

    // Mock da API de usuários
    await page.route('**/api/users*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: {
            data: [
              {
                id: 1,
                name: 'João Silva',
                email: 'joao@empresa.com',
                role: 'admin',
                created_at: '2025-12-01T10:00:00Z'
              },
              {
                id: 2,
                name: 'Maria Santos',
                email: 'maria@empresa.com',
                role: 'manager',
                created_at: '2025-12-05T10:00:00Z'
              }
            ],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 2
          }
        })
      })
    })
  })

  test('Capturar screenshots de todas as telas', async ({ page }) => {
    // Configurar viewport para desktop
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 1. Dashboard
    await page.goto('http://localhost:5175/dashboard')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/01-dashboard.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Dashboard')

    // 2. Lista de Projetos
    await page.goto('http://localhost:5175/projects')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/02-projetos-lista.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Lista de Projetos')

    // 3. Detalhes do Projeto
    await page.goto('http://localhost:5175/projects/1')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/03-projeto-detalhes.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Detalhes do Projeto')

    // 4. Novo Projeto
    await page.goto('http://localhost:5175/projects/new')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/04-projeto-novo.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Novo Projeto')

    // 5. Lista de Questionários
    await page.goto('http://localhost:5175/questionnaires')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/05-questionarios-lista.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Lista de Questionários')

    // 6. Novo Questionário
    await page.goto('http://localhost:5175/questionnaires/new?project_id=1')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/06-questionario-novo.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Novo Questionário')

    // 7. Form Builder - Canvas Inicial
    await page.goto('http://localhost:5175/questionnaires/1/builder')
    await page.waitForTimeout(2000)
    await page.screenshot({
      path: '../docs/mockups/referencia/07-builder-inicial.png',
      fullPage: false
    })
    console.log('✅ Screenshot: Form Builder - Inicial')

    // 8. Form Builder - Com componente selecionado
    await page.waitForTimeout(1000)
    const componentBlock = page.locator('[data-component-id]').first()
    if (await componentBlock.isVisible()) {
      await componentBlock.click()
      await page.waitForTimeout(500)
      await page.screenshot({
        path: '../docs/mockups/referencia/08-builder-componente-selecionado.png',
        fullPage: false
      })
      console.log('✅ Screenshot: Form Builder - Componente Selecionado')

      // 9. Form Builder - Object Inspector com máscara habilitada
      const maskSwitch = page.locator('button[role="switch"]').nth(1)
      if (await maskSwitch.isVisible()) {
        await maskSwitch.click()
        await page.waitForTimeout(500)
        await page.screenshot({
          path: '../docs/mockups/referencia/09-builder-mascara-habilitada.png',
          fullPage: false
        })
        console.log('✅ Screenshot: Form Builder - Máscara Habilitada')
      }
    }

    // 10. Preview do Questionário
    await page.goto('http://localhost:5175/questionnaires/1/preview')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/10-questionario-preview.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Preview do Questionário')

    // 11. Lista de Contratos
    await page.goto('http://localhost:5175/contracts')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/11-contratos-lista.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Lista de Contratos')

    // 12. Lista de Usuários
    await page.goto('http://localhost:5175/users')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/12-usuarios-lista.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Lista de Usuários')

    // 13. Configurações
    await page.goto('http://localhost:5175/settings')
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: '../docs/mockups/referencia/13-configuracoes.png',
      fullPage: true
    })
    console.log('✅ Screenshot: Configurações')

    console.log('\n🎉 Todas as screenshots foram capturadas com sucesso!')
  })
})
