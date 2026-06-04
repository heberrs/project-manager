'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, Project, User } from '@/lib/api';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  AlertCircle,
  Loader2,
  X,
  Check,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

function ProjetosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search & Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Project Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataTerminoPrevista: '',
    status: 'PLANEJADO',
    gerenteId: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete verify state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);
    loadProjectsAndManagers();
    
    // Check if redirecting from dashboard with new=true
    if (searchParams.get('new') === 'true') {
      handleOpenAddModal();
    }
  }, [searchParams]);

  async function loadProjectsAndManagers() {
    try {
      setLoading(true);
      const user = api.auth.getCurrentUser();
      
      let projectsData: Project[] = [];
      let usersData: User[] = [];

      if (user && user.perfil === 'COLABORADOR') {
        projectsData = await api.projetos.listar();
        
        // Coleta gerentes únicos a partir dos projetos carregados
        const uniqueManagersMap = new Map<number, User>();
        projectsData.forEach(p => {
          if (p.gerente) {
            uniqueManagersMap.set(p.gerente.id, p.gerente);
          }
        });
        setManagers(Array.from(uniqueManagersMap.values()));
      } else {
        const [pData, uData] = await Promise.all([
          api.projetos.listar(),
          api.usuarios.listar()
        ]);
        projectsData = pData;
        usersData = uData;

        // Filtra gerentes e administradores permitidos para gerenciar projetos
        const allowedManagers = usersData.filter(u => u.perfil === 'GERENTE' || u.perfil === 'ADMINISTRADOR');
        setManagers(allowedManagers);
      }

      setProjects(projectsData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar projetos. Verifique sua conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  // Reload filtered lists dynamically using API params (or client side if we prefer)
  // Let's reload using API filters whenever statusFilter or managerFilter changes
  useEffect(() => {
    async function filterProjects() {
      try {
        const params: any = {};
        if (managerFilter) params.gerenteId = parseInt(managerFilter, 10);
        if (statusFilter) params.status = statusFilter;
        
        const data = await api.projetos.listar(params);
        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    }
    
    if (currentUser) {
      filterProjects();
    }
  }, [statusFilter, managerFilter, currentUser]);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      nome: '',
      descricao: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataTerminoPrevista: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
      status: 'PLANEJADO',
      gerenteId: currentUser?.id ? currentUser.id.toString() : ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingProject(project);
    setFormData({
      nome: project.nome,
      descricao: project.descricao,
      dataInicio: project.dataInicio,
      dataTerminoPrevista: project.dataTerminoPrevista,
      status: project.status,
      gerenteId: project.gerenteId ? project.gerenteId.toString() : ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nome, descricao, dataInicio, dataTerminoPrevista, status, gerenteId } = formData;

    if (!nome || !dataInicio || !dataTerminoPrevista || !gerenteId) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const payload = {
      nome,
      descricao,
      dataInicio,
      dataTerminoPrevista,
      status,
      gerenteId: parseInt(gerenteId, 10)
    };

    try {
      if (editingProject) {
        await api.projetos.atualizar(editingProject.id, payload);
        setSuccess('Projeto atualizado com sucesso!');
      } else {
        await api.projetos.criar(payload);
        setSuccess('Projeto criado com sucesso!');
      }
      setIsModalOpen(false);
      loadProjectsAndManagers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao salvar projeto. Verifique as datas fornecidas.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await api.projetos.remover(id);
      setSuccess('Projeto removido com sucesso!');
      setDeleteConfirmId(null);
      loadProjectsAndManagers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao remover projeto. Certifique-se de que não haja tarefas ou equipes vinculadas.');
    }
  };

  const hasWriteAccess = currentUser?.perfil === 'ADMINISTRADOR' || currentUser?.perfil === 'GERENTE';

  // Client side search matching
  const searchedProjects = projects.filter(project =>
    project.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.descricao && project.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Projetos</h1>
          <p className="text-slate-400 text-sm mt-1">
            Planeje, acompanhe o andamento de projetos e distribua tarefas.
          </p>
        </div>
        {hasWriteAccess && (
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        )}
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/30 p-4 border border-slate-800 rounded-2xl">
        <div className="relative col-span-1 sm:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 text-sm cursor-pointer"
        >
          <option value="">Todos os Status</option>
          <option value="PLANEJADO">Planejado</option>
          <option value="EM_ANDAMENTO">Em Andamento</option>
          <option value="CONCLUIDO">Concluído</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <select
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 text-sm cursor-pointer"
        >
          <option value="">Todos os Gerentes</option>
          {managers.map(manager => (
            <option key={manager.id} value={manager.id}>{manager.nome}</option>
          ))}
        </select>
      </div>

      {/* Main Grid content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchedProjects.map((project) => {
            const manager = managers.find(m => m.id === project.gerenteId) || project.gerente;
            
            return (
              <Link
                key={project.id}
                href={`/projetos/${project.id}`}
                className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 shadow-md hover:shadow-indigo-500/5 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      project.status === 'CONCLUIDO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      project.status === 'EM_ANDAMENTO' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      project.status === 'CANCELADO' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    
                    {hasWriteAccess && (
                      <div className="flex gap-1 relative z-10">
                        <button
                          onClick={(e) => handleOpenEditModal(project, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title="Editar Projeto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteConfirmId(project.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title="Excluir Projeto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-slate-200 group-hover:text-indigo-400 transition truncate">
                    {project.nome}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3 min-h-[3.5rem] leading-relaxed">
                    {project.descricao || 'Sem descrição.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Termina em: {new Date(project.dataTerminoPrevista + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {manager && (
                    <div className="flex items-center gap-2 bg-slate-950/20 px-3 py-2 rounded-xl border border-slate-850/40">
                      <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Gerente</p>
                        <p className="text-xs text-slate-350 truncate">{manager.nome}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete validation panel overlay */}
                {deleteConfirmId === project.id && (
                  <div className="absolute inset-0 bg-slate-900 border border-red-500/40 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 z-10 animate-fadeIn">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-200">Excluir projeto?</p>
                      <p className="text-xs text-slate-400 px-4">Esta ação apagará permanentemente o projeto e todas as suas tarefas.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteConfirmId(null);
                        }}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}

          {searchedProjects.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 text-sm">
              Nenhum projeto encontrado.
            </div>
          )}
        </div>
      )}

      {/* FORM MODAL (Add / Edit Project) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingProject ? 'Editar Projeto' : 'Criar Novo Projeto'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Novo App Oracle Customer"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descreva os objetivos, limites e escopo..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Data de Término Prevista *
                  </label>
                  <input
                    type="date"
                    name="dataTerminoPrevista"
                    value={formData.dataTerminoPrevista}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Status do Projeto *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                  >
                    <option value="PLANEJADO">Planejado</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Gerente Responsável *
                  </label>
                  <select
                    name="gerenteId"
                    value={formData.gerenteId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                    required
                  >
                    <option value="">Selecione um gerente...</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>{manager.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                  disabled={formLoading}
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjetosPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <ProjetosContent />
    </Suspense>
  );
}
