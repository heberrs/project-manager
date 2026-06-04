// API integration layer for Project Manager Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface User {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  cargo: string;
  login: string;
  perfil: 'ADMINISTRADOR' | 'GERENTE' | 'COLABORADOR';
}

export interface LoginResponse {
  token: string;
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface Project {
  id: number;
  nome: string;
  descricao: string;
  dataInicio: string; // ISO date string YYYY-MM-DD
  dataTerminoPrevista: string; // ISO date string YYYY-MM-DD
  status: 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  gerenteId: number;
  gerenteNome?: string;
  gerente?: User;
}

export interface Team {
  id: number;
  nome: string;
  descricao: string;
  membros: User[];
  projetos: Project[];
}

export interface Task {
  id: number;
  titulo: string;
  descricao: string;
  prazo: string; // ISO date string YYYY-MM-DD
  status: 'A_INICIAR' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  responsavelId: number;
  responsavel?: User;
  projetoId: number;
  projeto?: Project;
}

export interface PerformanceReport {
  projetoId: number;
  projetoNome: string;
  totalTarefas: number;
  tarefasConcluidas: number;
  percentualConcluido: number;
}

export interface OccupationReport {
  colaboradorId: number;
  colaboradorNome: string;
  totalTarefasAtribuidas: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
}

// Helper to get auth header
function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('pm_auth_token');
  if (!token) return {};
  return { 'Authorization': `Basic ${token}` };
}

// Generic fetch wrapper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Erro na requisição: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignora erro ao tentar dar parse no JSON de erro
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  auth: {
    login: async (requestData: any): Promise<LoginResponse> => {
      const res = await request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      if (res.token) {
        localStorage.setItem('pm_auth_token', res.token);
        localStorage.setItem('pm_user', JSON.stringify({
          id: res.id,
          nome: res.nome,
          email: res.email,
          perfil: res.perfil,
        }));
      }
      return res;
    },
    logout: () => {
      localStorage.removeItem('pm_auth_token');
      localStorage.removeItem('pm_user');
    },
    register: (requestData: any): Promise<User> => {
      return request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
    },
    getCurrentUser: (): (Omit<LoginResponse, 'token'> | null) => {
      if (typeof window === 'undefined') return null;
      const userStr = localStorage.getItem('pm_user');
      if (!userStr) return null;
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  },

  // Usuarios
  usuarios: {
    listar: (): Promise<User[]> => request<User[]>('/usuarios'),
    obter: (id: number): Promise<User> => request<User>(`/usuarios/${id}`),
    criar: (data: any): Promise<User> => request<User>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    atualizar: (id: number, data: any): Promise<User> => request<User>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    remover: (id: number): Promise<void> => request<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    }),
  },

  // Projetos
  projetos: {
    listar: (params?: { gerenteId?: number; status?: string }): Promise<Project[]> => {
      const query = new URLSearchParams();
      if (params?.gerenteId) query.append('gerenteId', params.gerenteId.toString());
      if (params?.status) query.append('status', params.status);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request<Project[]>(`/projetos${queryString}`);
    },
    obter: (id: number): Promise<Project> => request<Project>(`/projetos/${id}`),
    criar: (data: any): Promise<Project> => request<Project>('/projetos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    atualizar: (id: number, data: any): Promise<Project> => request<Project>(`/projetos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    remover: (id: number): Promise<void> => request<void>(`/projetos/${id}`, {
      method: 'DELETE',
    }),
  },

  // Equipes
  equipes: {
    listar: (): Promise<Team[]> => request<Team[]>('/equipes'),
    obter: (id: number): Promise<Team> => request<Team>(`/equipes/${id}`),
    criar: (data: any): Promise<Team> => request<Team>('/equipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    atualizar: (id: number, data: any): Promise<Team> => request<Team>(`/equipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    remover: (id: number): Promise<void> => request<void>(`/equipes/${id}`, {
      method: 'DELETE',
    }),
    adicionarMembro: (teamId: number, memberId: number): Promise<Team> => request<Team>(`/equipes/${teamId}/membros/${memberId}`, {
      method: 'POST',
    }),
    removerMembro: (teamId: number, memberId: number): Promise<Team> => request<Team>(`/equipes/${teamId}/membros/${memberId}`, {
      method: 'DELETE',
    }),
    alocarProjeto: (teamId: number, projectId: number): Promise<Team> => request<Team>(`/equipes/${teamId}/projetos/${projectId}`, {
      method: 'POST',
    }),
    desalocarProjeto: (teamId: number, projectId: number): Promise<Team> => request<Team>(`/equipes/${teamId}/projetos/${projectId}`, {
      method: 'DELETE',
    }),
  },

  // Tarefas
  tarefas: {
    listar: (): Promise<Task[]> => request<Task[]>('/tarefas'),
    obter: (id: number): Promise<Task> => request<Task>(`/tarefas/${id}`),
    listarPorProjeto: (projectId: number): Promise<Task[]> => request<Task[]>(`/tarefas/projeto/${projectId}`),
    criar: (data: any): Promise<Task> => request<Task>('/tarefas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    atualizar: (id: number, data: any): Promise<Task> => request<Task>(`/tarefas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    remover: (id: number): Promise<void> => request<void>(`/tarefas/${id}`, {
      method: 'DELETE',
    }),
    atualizarStatus: (id: number, status: 'A_INICIAR' | 'EM_ANDAMENTO' | 'CONCLUIDO'): Promise<Task> => {
      // NOTE: status query param in URL
      return request<Task>(`/tarefas/${id}/status?status=${status}`, {
        method: 'PUT',
      });
    },
    atribuirResponsavel: (id: number, responsavelId: number): Promise<Task> => {
      return request<Task>(`/tarefas/${id}/responsavel/${responsavelId}`, {
        method: 'PUT',
      });
    },
  },

  // Relatorios
  relatorios: {
    desempenho: (): Promise<PerformanceReport[]> => request<PerformanceReport[]>('/relatorios/desempenho'),
    ocupacao: (): Promise<OccupationReport[]> => request<OccupationReport[]>('/relatorios/ocupacao'),
  }
};
