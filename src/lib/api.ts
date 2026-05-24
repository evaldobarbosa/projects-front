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
    const response = await this.post<LoginResponse>('/login', { email, password })
    this.setToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.post('/logout')
    } finally {
      this.removeToken()
    }
  }

  async me(): Promise<MeResponse> {
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
    return this.get<{ project: Project }>(`/projects/${id}`)
  }

  async createProject(data: ProjectPayload): Promise<{ message: string; project: Project }> {
    return this.post<{ message: string; project: Project }>('/projects', data)
  }

  async updateProject(id: number, data: Partial<ProjectPayload>): Promise<{ message: string; project: Project }> {
    return this.put<{ message: string; project: Project }>(`/projects/${id}`, data)
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/projects/${id}`)
  }
}

export const api = new ApiClient()
