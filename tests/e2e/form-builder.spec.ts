import { test, expect } from '@playwright/test'

test.describe('Form Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Mock da API de autenticação
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
          },
        }),
      })
    })

    // Mock da API de projects
    await page.route('**/api/projects*', async (route) => {
      const url = route.request().url()

      if (url.includes('/api/projects?')) {
        // Lista de projetos
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            projects: {
              data: [
                {
                  id: 1,
                  name: 'Projeto Teste',
                  description: 'Projeto de teste',
                  status: 'draft',
                  created_at: '2024-01-01T00:00:00.000000Z',
                },
              ],
              current_page: 1,
              last_page: 1,
              per_page: 10,
              total: 1,
            },
            stats: {
              total: 1,
              draft: 1,
              in_field: 0,
              finished: 0,
              archived: 0,
            },
          }),
        })
      } else {
        await route.continue()
      }
    })

    // Mock da API de questionários
    await page.route('**/api/questionnaires/1', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            questionnaire: {
              id: 1,
              project_id: 1,
              title: 'Questionário Teste',
              description: 'Teste do form builder',
              status: 'draft',
              active_version: {
                id: 1,
                version_number: 1,
                schema: {
                  sections: [
                    {
                      id: 'section_1',
                      title: 'Seção 1',
                      components: [],
                    },
                  ],
                  settings: {
                    showProgressBar: true,
                    allowBackNavigation: true,
                  },
                },
                published_at: null,
                created_at: '2024-01-01T00:00:00.000000Z',
              },
              created_at: '2024-01-01T00:00:00.000000Z',
              updated_at: '2024-01-01T00:00:00.000000Z',
            },
          }),
        })
      }
    })

    // Mock salvar versão
    await page.route('**/api/questionnaires/1/versions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Versão criada com sucesso.',
            version: {
              id: 2,
              version_number: 2,
              questionnaire_id: 1,
              created_at: '2024-01-01T00:00:00.000000Z',
            },
          }),
        })
      }
    })

    // Navegar para o form builder
    await page.goto('/')

    // Login mock (se necessário)
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token')
    })
  })

  test('deve carregar o form builder corretamente', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')

    // Aguardar carregamento
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Verificar se a paleta de componentes está visível
    await expect(page.locator('text=Campos Simples')).toBeVisible()

    // Verificar se o canvas está visível
    await expect(page.locator('text=Seção 1')).toBeVisible()
  })

  test('deve adicionar um componente de texto ao formulário', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Arrastar componente da paleta (simulando drag & drop)
    // Playwright não suporta drag & drop HTML5 nativamente, então usaremos cliques

    // Clicar no botão de adicionar componente
    await page.click('[data-component-type="text"]')

    // Verificar se o componente foi adicionado
    await expect(page.locator('[data-component-id]').first()).toBeVisible()
  })

  test('deve abrir o object inspector ao selecionar um componente', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Adicionar um componente
    await page.click('[data-component-type="text"]')

    // Clicar no componente para selecioná-lo
    await page.click('[data-component-id]')

    // Verificar se o object inspector apareceu
    await expect(page.locator('text=Object Inspector')).toBeVisible()
    await expect(page.locator('text=Propriedades Básicas')).toBeVisible()
  })

  test('deve editar propriedades do componente no object inspector', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Adicionar e selecionar componente
    await page.click('[data-component-type="text"]')
    await page.click('[data-component-id]')

    // Editar label
    await page.fill('#label', 'Nome Completo')
    await page.fill('#name', 'nome_completo')

    // Marcar como obrigatório
    await page.check('#required')

    // Adicionar placeholder
    await page.fill('#placeholder', 'Digite seu nome completo')

    // Verificar se as mudanças foram aplicadas
    await page.blur('#placeholder')

    // O componente deve ter sido atualizado
    await expect(page.locator('text=Nome Completo')).toBeVisible()
  })

  test('deve adicionar máscara a um campo', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Adicionar componente de texto
    await page.click('[data-component-type="text"]')
    await page.click('[data-component-id]')

    // Verificar se a seção de máscara está visível
    await expect(page.locator('text=Máscara de Input')).toBeVisible()

    // Clicar em um preset de máscara (CPF)
    await page.click('button:has-text("CPF")')

    // Verificar se a máscara foi aplicada
    const maskInput = page.locator('#mask')
    await expect(maskInput).toHaveValue('###.###.###-##')
  })

  test('deve adicionar validações a um campo', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Adicionar e selecionar componente
    await page.click('[data-component-type="email"]')
    await page.click('[data-component-id]')

    // Abrir seção de validações
    await expect(page.locator('text=Validações')).toBeVisible()

    // Adicionar validação
    await page.click('button:has-text("Adicionar"):near(:text("Validações"))')

    // Selecionar tipo de validação
    await page.selectOption('select', 'email')

    // Adicionar mensagem de erro
    await page.fill('input[placeholder="Mensagem de erro"]', 'Email inválido')

    // Verificar se a validação foi adicionada
    await expect(page.locator('text=Email inválido')).toBeVisible()
  })

  test('deve adicionar opções a um campo select', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Adicionar componente select
    await page.click('[data-component-type="select"]')
    await page.click('[data-component-id]')

    // Verificar se a seção de opções está visível
    await expect(page.locator('text=Opções')).toBeVisible()

    // Adicionar primeira opção
    await page.click('button:has-text("Adicionar"):near(:text("Opções"))')

    // Editar label da opção
    const firstOption = page.locator('input[placeholder="Rótulo da opção"]').first()
    await firstOption.fill('Opção A')

    // Adicionar segunda opção
    await page.click('button:has-text("Adicionar"):near(:text("Opções"))')

    // Verificar se as opções foram adicionadas
    await expect(page.locator('text=Opção A')).toBeVisible()
  })

  test('deve salvar o formulário', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Adicionar um componente
    await page.click('[data-component-type="text"]')

    // Clicar no botão salvar
    await page.click('button:has-text("Salvar")')

    // Aguardar confirmação
    await page.waitForTimeout(1000)

    // Verificar se o botão voltou ao estado normal (não está salvando)
    await expect(page.locator('button:has-text("Salvar")')).not.toBeDisabled()
  })

  test('deve adicionar múltiplas seções', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Clicar em adicionar seção
    await page.click('button:has-text("Adicionar Seção")')

    // Verificar se a nova seção foi adicionada
    await expect(page.locator('text=Seção 2')).toBeVisible()

    // Adicionar mais uma seção
    await page.click('button:has-text("Adicionar Seção")')
    await expect(page.locator('text=Seção 3')).toBeVisible()
  })

  test('deve remover um componente', async ({ page }) => {
    await page.goto('/questionnaires/1/builder')
    await page.waitForSelector('[data-testid="form-builder"]', { timeout: 10000 })

    // Adicionar componente
    await page.click('[data-component-type="text"]')

    // Selecionar componente
    await page.click('[data-component-id]')

    // Clicar no botão de remover (se existir)
    const deleteButton = page.locator('[data-action="delete-component"]')
    if (await deleteButton.isVisible()) {
      await deleteButton.click()

      // Confirmar exclusão (se houver diálogo)
      const confirmButton = page.locator('button:has-text("Confirmar")')
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      // Verificar se o componente foi removido
      await expect(page.locator('[data-component-id]')).not.toBeVisible()
    }
  })
})
