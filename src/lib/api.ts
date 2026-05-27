/**
 * Cliente HTTP para comunicação com a API Laravel.
 * Gerencia autenticação via token e tratamento de erros.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'auth_token'

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface User {
  id: number
  name: string
  email: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface MeResponse {
  user: User
}

export interface ProjectOwner {
  id: number
  name: string
  email?: string
}

export interface ProjectContract {
  id: number
  name: string
  code: string
  status?: string
  value?: number
  start_date?: string
  end_date?: string
}

export interface Project {
  id: number
  name: string
  description?: string
  status: 'draft' | 'in_field' | 'finished' | 'archived'
  start_date?: string
  end_date?: string
  owner_id?: number
  owner?: ProjectOwner
  contracts?: ProjectContract[]
  contracts_count?: number
  created_at: string
  updated_at: string
}

export interface ProjectStats {
  total: number
  draft: number
  in_field: number
  finished: number
  archived: number
}

export interface ProjectsResponse {
  projects: {
    data: Project[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: ProjectStats
}

export interface ProjectFilters {
  search?: string
  status?: string
  owner_id?: number
  page?: number
  per_page?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export interface ProjectPayload {
  name: string
  description?: string
  status?: string
  start_date?: string
  end_date?: string
  contract_ids?: number[]
}

export interface Contract {
  id: number
  code: string
  name: string
  client_name: string
  value: number
  start_date: string
  end_date: string
  status: 'draft' | 'pending' | 'active' | 'expired' | 'cancelled'
  notes?: string
  projects?: Project[]
  created_at: string
  updated_at: string
}

export interface ContractStats {
  total_active: number
  total_value: number
  total_pending: number
  expiring_soon: number
}

export interface ContractsResponse {
  contracts: {
    data: Contract[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: ContractStats
}

export interface ContractFilters {
  search?: string
  status?: string
  client?: string
  page?: number
  per_page?: number
}

export interface ContractPayload {
  code: string
  name: string
  client_name: string
  value: number
  start_date: string
  end_date: string
  status?: string
  notes?: string
  project_ids?: number[]
}

// Questionnaire Types
export type ComponentType =
  | 'text' | 'email' | 'phone' | 'number' | 'date' | 'time' | 'textarea'
  | 'select' | 'select_search' | 'radio' | 'checkbox' | 'scale' | 'rating'
  | 'matrix' | 'ranking' | 'file' | 'image' | 'signature' | 'geolocation' | 'cascade'
  | 'section' | 'page_break' | 'html'

export interface ValidationRule {
  type: string
  value?: unknown
  message?: string
}

export interface FormComponent {
  id: string
  type: ComponentType
  label: string
  name: string
  required: boolean
  properties: Record<string, unknown>
  validations: ValidationRule[]
}

export interface Section {
  id: string
  title: string
  components: FormComponent[]
}

export interface FormSettings {
  showProgressBar?: boolean
  allowBackNavigation?: boolean
  [key: string]: unknown
}

export interface FormSchema {
  sections: Section[]
  settings: FormSettings
}

export interface QuestionnaireVersion {
  id: number
  questionnaire_id: number
  version_number: number
  schema: FormSchema
  created_by: number
  created_by_user?: { id: number; name: string }
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Questionnaire {
  id: number
  project_id: number
  title: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  active_version_id?: number
  project?: { id: number; name: string; status?: string }
  active_version?: QuestionnaireVersion
  versions?: QuestionnaireVersion[]
  versions_count?: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface QuestionnaireStats {
  total: number
  draft: number
  published: number
  archived: number
}

export interface QuestionnairesResponse {
  questionnaires: {
    data: Questionnaire[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: QuestionnaireStats
}

export interface QuestionnaireFilters {
  project_id?: number
  search?: string
  status?: string
  page?: number
  per_page?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export interface QuestionnairePayload {
  project_id: number
  title: string
  description?: string
  schema?: FormSchema
}

export interface QuestionnaireUpdatePayload {
  title?: string
  description?: string
  status?: string
}

export interface VersionPayload {
  schema: FormSchema
}

// Mock data storage (in-memory, only for development)
const mockStorage = {
  projects: [] as Project[],
  questionnaires: [] as Questionnaire[],
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  }

  private removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    }

    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      const error: ApiError = {
        message: errorData.message || 'Erro na requisição',
        errors: errorData.errors,
      }

      if (response.status === 401) {
        this.removeToken()
      }

      throw error
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Mock mode for development without backend
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      const mockResponse: LoginResponse = {
        user: { id: 1, name: 'Dev User', email: email },
        token: 'mock-dev-token-12345',
      }
      this.setToken(mockResponse.token)
      return mockResponse
    }

    const response = await this.post<LoginResponse>('/login', { email, password })
    this.setToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    try {
      if (import.meta.env.VITE_USE_MOCK_API !== 'true') {
        await this.post('/logout')
      }
    } finally {
      this.removeToken()
    }
  }

  async me(): Promise<MeResponse> {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return {
        user: { id: 1, name: 'Dev User', email: 'dev@formassistant.com' },
      }
    }

    return this.get<MeResponse>('/me')
  }

  hasToken(): boolean {
    return !!this.getToken()
  }

  clearToken(): void {
    this.removeToken()
  }

  // Contracts
  async getContracts(filters: ContractFilters = {}): Promise<ContractsResponse> {
    // Mock mode
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return {
        contracts: {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
        stats: {
          total_active: 0,
          total_value: 0,
          total_pending: 0,
          expiring_soon: 0,
        },
      }
    }

    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.client) params.append('client', filters.client)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.per_page) params.append('per_page', filters.per_page.toString())

    const query = params.toString()
    return this.get<ContractsResponse>(`/contracts${query ? `?${query}` : ''}`)
  }

  async getContract(id: number): Promise<{ contract: Contract }> {
    return this.get<{ contract: Contract }>(`/contracts/${id}`)
  }

  async createContract(data: ContractPayload): Promise<{ message: string; contract: Contract }> {
    return this.post<{ message: string; contract: Contract }>('/contracts', data)
  }

  async updateContract(id: number, data: Partial<ContractPayload>): Promise<{ message: string; contract: Contract }> {
    return this.put<{ message: string; contract: Contract }>(`/contracts/${id}`, data)
  }

  async deleteContract(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/contracts/${id}`)
  }

  // Projects
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
    // Mock mode
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      console.log('[API Mock] getProjects chamado, retornando', mockStorage.projects.length, 'projetos')

      // Apply filters
      let filteredProjects = [...mockStorage.projects]
      if (filters.search) {
        filteredProjects = filteredProjects.filter(p =>
          p.name.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      if (filters.status) {
        filteredProjects = filteredProjects.filter(p => p.status === filters.status)
      }

      // Calculate stats
      const stats = {
        total: mockStorage.projects.length,
        draft: mockStorage.projects.filter(p => p.status === 'draft').length,
        in_field: mockStorage.projects.filter(p => p.status === 'in_field').length,
        finished: mockStorage.projects.filter(p => p.status === 'finished').length,
        archived: mockStorage.projects.filter(p => p.status === 'archived').length,
      }

      return {
        projects: {
          data: filteredProjects,
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: filteredProjects.length,
        },
        stats,
      }
    }

    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.owner_id) params.append('owner_id', filters.owner_id.toString())
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.per_page) params.append('per_page', filters.per_page.toString())
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.direction) params.append('direction', filters.direction)

    const query = params.toString()
    return this.get<ProjectsResponse>(`/projects${query ? `?${query}` : ''}`)
  }

  async getProject(id: number): Promise<{ project: Project }> {
    // Mock mode
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      console.log('[API Mock] getProject chamado com ID:', id)

      // Try to find in storage first
      const stored = mockStorage.projects.find(p => p.id === id)
      if (stored) {
        console.log('[API Mock] Projeto encontrado no storage:', stored)
        return { project: stored }
      }

      // Fallback to generic mock
      const mockProject: Project = {
        id: id,
        name: `Projeto de Pesquisa ${id}`,
        description: 'Projeto mockado para desenvolvimento e testes de interface',
        status: 'draft',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +90 dias
        owner_id: 1,
        owner: {
          id: 1,
          name: 'Dev User',
          email: 'dev@formassistant.com',
        },
        contracts: [],
        contracts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      console.log('[API Mock] Retornando projeto genérico:', mockProject)
      return { project: mockProject }
    }

    return this.get<{ project: Project }>(`/projects/${id}`)
  }

  async createProject(data: ProjectPayload): Promise<{ message: string; project: Project }> {
    // Mock mode
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      console.log('[API Mock] createProject chamado com data:', data)
      const mockId = Date.now()
      const mockProject: Project = {
        id: mockId,
        name: data.name,
        description: data.description,
        status: (data.status as any) || 'draft',
        start_date: data.start_date,
        end_date: data.end_date,
        owner_id: 1,
        owner: {
          id: 1,
          name: 'Dev User',
          email: 'dev@formassistant.com',
        },
        contracts: [],
        contracts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store in mock storage
      mockStorage.projects.push(mockProject)
      console.log('[API Mock] Projeto criado e armazenado:', mockProject)
      console.log('[API Mock] Total de projetos agora:', mockStorage.projects.length)

      return {
        message: 'Project created successfully',
        project: mockProject
      }
    }

    return this.post<{ message: string; project: Project }>('/projects', data)
  }

  async updateProject(id: number, data: Partial<ProjectPayload>): Promise<{ message: string; project: Project }> {
    return this.put<{ message: string; project: Project }>(`/projects/${id}`, data)
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/projects/${id}`)
  }

  // Questionnaires
  async getQuestionnaires(filters: QuestionnaireFilters = {}): Promise<QuestionnairesResponse> {
    // Mock mode
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      console.log('[API Mock] getQuestionnaires chamado com filtros:', filters)

      // Apply filters
      let filteredQuestionnaires = [...mockStorage.questionnaires]
      if (filters.project_id) {
        filteredQuestionnaires = filteredQuestionnaires.filter(q => q.project_id === filters.project_id)
      }
      if (filters.status) {
        filteredQuestionnaires = filteredQuestionnaires.filter(q => q.status === filters.status)
      }
      if (filters.search) {
        filteredQuestionnaires = filteredQuestionnaires.filter(q =>
          q.title.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }

      console.log('[API Mock] Retornando', filteredQuestionnaires.length, 'questionários')

      // Calculate stats
      const stats = {
        total: mockStorage.questionnaires.length,
        draft: mockStorage.questionnaires.filter(q => q.status === 'draft').length,
        published: mockStorage.questionnaires.filter(q => q.status === 'published').length,
        archived: mockStorage.questionnaires.filter(q => q.status === 'archived').length,
      }

      return {
        questionnaires: {
          data: filteredQuestionnaires,
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: filteredQuestionnaires.length,
        },
        stats,
      }
    }

    const params = new URLSearchParams()
    if (filters.project_id) params.append('project_id', filters.project_id.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.per_page) params.append('per_page', filters.per_page.toString())
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.direction) params.append('direction', filters.direction)

    const query = params.toString()
    return this.get<QuestionnairesResponse>(`/questionnaires${query ? `?${query}` : ''}`)
  }

  async getQuestionnaire(id: number): Promise<{ questionnaire: Questionnaire }> {
    // Mock mode
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      console.log('[API Mock] getQuestionnaire chamado com ID:', id)

      // Try to find in storage first
      const stored = mockStorage.questionnaires.find(q => q.id === id)
      if (stored) {
        console.log('[API Mock] Questionário encontrado no storage:', stored)
        return { questionnaire: stored }
      }

      // Fallback to generic mock
      const mockQuestionnaire: Questionnaire = {
        id: id,
        project_id: 1,
        title: 'Questionário de Teste',
        description: 'Formulário mockado para desenvolvimento',
        status: 'draft',
        active_version_id: null,
        latest_version_id: null,
        active_version: null,
        latest_version: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      console.log('[API Mock] Retornando questionnaire genérico:', mockQuestionnaire)
      return { questionnaire: mockQuestionnaire }
    }

    return this.get<{ questionnaire: Questionnaire }>(`/questionnaires/${id}`)
  }

  async createQuestionnaire(data: QuestionnairePayload): Promise<{ message: string; questionnaire: Questionnaire }> {
    // Mock mode
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      console.log('[API Mock] createQuestionnaire chamado com data:', data)
      const mockId = Date.now() // Use timestamp as unique ID
      const mockQuestionnaire: Questionnaire = {
        id: mockId,
        project_id: data.project_id,
        title: data.title,
        description: data.description || '',
        status: 'draft',
        active_version_id: null,
        latest_version_id: null,
        active_version: null,
        latest_version: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store in mock storage
      mockStorage.questionnaires.push(mockQuestionnaire)
      console.log('[API Mock] Questionário criado e armazenado:', mockQuestionnaire)
      console.log('[API Mock] Total de questionários agora:', mockStorage.questionnaires.length)

      return {
        message: 'Questionnaire created successfully',
        questionnaire: mockQuestionnaire,
      }
    }

    return this.post<{ message: string; questionnaire: Questionnaire }>('/questionnaires', data)
  }

  async updateQuestionnaire(id: number, data: QuestionnaireUpdatePayload): Promise<{ message: string; questionnaire: Questionnaire }> {
    return this.put<{ message: string; questionnaire: Questionnaire }>(`/questionnaires/${id}`, data)
  }

  async deleteQuestionnaire(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/questionnaires/${id}`)
  }

  // Questionnaire Versions
  async getQuestionnaireVersions(questionnaireId: number): Promise<{ versions: QuestionnaireVersion[] }> {
    return this.get<{ versions: QuestionnaireVersion[] }>(`/questionnaires/${questionnaireId}/versions`)
  }

  async getQuestionnaireVersion(questionnaireId: number, versionId: number): Promise<{ version: QuestionnaireVersion }> {
    return this.get<{ version: QuestionnaireVersion }>(`/questionnaires/${questionnaireId}/versions/${versionId}`)
  }

  async createQuestionnaireVersion(questionnaireId: number, data: VersionPayload): Promise<{ message: string; version: QuestionnaireVersion }> {
    return this.post<{ message: string; version: QuestionnaireVersion }>(`/questionnaires/${questionnaireId}/versions`, data)
  }

  async publishQuestionnaireVersion(questionnaireId: number, versionId: number): Promise<{ message: string; version: QuestionnaireVersion }> {
    return this.post<{ message: string; version: QuestionnaireVersion }>(`/questionnaires/${questionnaireId}/versions/${versionId}/publish`)
  }
}

export const api = new ApiClient()
