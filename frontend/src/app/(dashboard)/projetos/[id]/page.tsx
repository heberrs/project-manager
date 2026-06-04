'use client';

import React, { useEffect, useState, use } from 'react';
import { api, Project, Team, Task, User } from '@/lib/api';
import { 
  FolderKanban, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  User as UserIcon, 
  Users, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Edit2, 
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon
} from 'lucide-react';
import Link from 'next/link';

export default function DetalhesProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolve params
  const resolvedParams = use(params);
  const projectId = parseInt(resolvedParams.id, 10);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Task form modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    titulo: '',
    descricao: '',
    prazo: '',
    status: 'A_INICIAR',
    responsavelId: ''
  });
  const [taskFormLoading, setTaskFormLoading] = useState(false);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);

  // Task delete confirm
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadProjectDetails();
  }, [projectId]);

  async function loadProjectDetails() {
    try {
      setLoading(true);
      const [projectData, tasksData, teamsData] = await Promise.all([
        api.projetos.obter(projectId),
        api.tarefas.listarPorProjeto(projectId),
        api.equipes.listar()
      ]);

      setProject(projectData);
      setTasks(tasksData);
      setAllTeams(teamsData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar detalhes do projeto. Verifique se o backend está ativo.');
    } finally {
      setLoading(false);
    }
  }

  // Filter teams allocated to this project
  const allocatedTeams = allTeams.filter(team => 
    team.projetos?.some(p => p.id === projectId)
  );

  // Gather possible responsibles (members of the allocated teams)
  const possibleResponsibles: User[] = [];
  allocatedTeams.forEach(team => {
    team.membros?.forEach(member => {
      if (!possibleResponsibles.some(r => r.id === member.id)) {
        possibleResponsibles.push(member);
      }
    });
  });

  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setTaskFormData({
      titulo: '',
      descricao: '',
      prazo: new Date().toISOString().split('T')[0],
      status: 'A_INICIAR',
      responsavelId: possibleResponsibles[0]?.id ? possibleResponsibles[0].id.toString() : ''
    });
    setTaskFormError(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      titulo: task.titulo,
      descricao: task.descricao || '',
      prazo: task.prazo,
      status: task.status,
      responsavelId: task.responsavelId ? task.responsavelId.toString() : ''
    });
    setTaskFormError(null);
    setIsTaskModalOpen(true);
  };

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { titulo, descricao, prazo, status, responsavelId } = taskFormData;

    if (!titulo || !prazo || !responsavelId) {
      setTaskFormError('Por favor, preencha todos os campos obrigatórios (Título, Prazo, Responsável).');
      return;
    }

    setTaskFormLoading(true);
    setTaskFormError(null);

    const payload = {
      titulo,
      descricao,
      prazo,
      status,
      responsavelId: parseInt(responsavelId, 10),
      projetoId: projectId
    };

    try {
      if (editingTask) {
        await api.tarefas.atualizar(editingTask.id, payload);
        setSuccess('Tarefa atualizada com sucesso!');
      } else {
        await api.tarefas.criar(payload);
        setSuccess('Tarefa criada com sucesso!');
      }
      setIsTaskModalOpen(false);
      loadProjectDetails();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setTaskFormError(err.message || 'Erro ao salvar tarefa.');
    } finally {
      setTaskFormLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: 'A_INICIAR' | 'EM_ANDAMENTO' | 'CONCLUIDO') => {
    try {
      await api.tarefas.atualizarStatus(taskId, newStatus);
      loadProjectDetails();
      setSuccess('Status da tarefa atualizado!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao atualizar status da tarefa.');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      await api.tarefas.remover(taskId);
      setSuccess('Tarefa excluída!');
      setDeleteTaskId(null);
      loadProjectDetails();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao excluir tarefa.');
    }
  };

  const hasWriteAccess = currentUser?.perfil === 'ADMINISTRADOR' || currentUser?.perfil === 'GERENTE';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-sm">Carregando quadro do projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Projeto Não Encontrado</h2>
        <Link href="/projetos" className="text-indigo-400 font-semibold inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Voltar para lista
        </Link>
      </div>
    );
  }

  // Group tasks by status
  const tasksAIniciar = tasks.filter(t => t.status === 'A_INICIAR');
  const tasksEmAndamento = tasks.filter(t => t.status === 'EM_ANDAMENTO');
  const tasksConcluidas = tasks.filter(t => t.status === 'CONCLUIDO');

  const renderTaskCard = (task: Task) => {
    const canEditTask = hasWriteAccess;
    const isAssignedToMe = currentUser && task.responsavelId === currentUser.id;
    const canChangeStatus = hasWriteAccess || isAssignedToMe;

    return (
      <div 
        key={task.id}
        className="group/card p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition relative shadow"
      >
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className="font-bold text-slate-200 text-xs sm:text-sm line-clamp-1">{task.titulo}</h4>
          
          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            {canEditTask && (
              <>
                <button
                  onClick={() => handleOpenEditTaskModal(task)}
                  className="p-1 text-slate-400 hover:text-indigo-400 rounded transition cursor-pointer"
                  title="Editar Tarefa"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setDeleteTaskId(task.id)}
                  className="p-1 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
                  title="Excluir Tarefa"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed mb-4">
          {task.descricao || 'Sem descrição.'}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-850/60">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-350">
            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-750 text-indigo-400 flex items-center justify-center text-[9px] font-bold">
              {task.responsavel?.nome.charAt(0) || 'U'}
            </div>
            <span className="truncate max-w-[80px]" title={task.responsavel?.nome}>
              {task.responsavel?.nome.split(' ')[0] || 'Sem Resp.'}
            </span>
          </div>

          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-650" />
            {new Date(task.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}
          </span>
        </div>

        {canChangeStatus && (
          <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-slate-850/40">
            {task.status !== 'A_INICIAR' && (
              <button
                onClick={() => handleTaskStatusChange(task.id, task.status === 'CONCLUIDO' ? 'EM_ANDAMENTO' : 'A_INICIAR')}
                className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-slate-950/40 rounded transition cursor-pointer flex items-center gap-0.5 text-[9px]"
              >
                <ArrowLeftIcon className="w-3 h-3" /> Voltar
              </button>
            )}
            {task.status !== 'CONCLUIDO' && (
              <button
                onClick={() => handleTaskStatusChange(task.id, task.status === 'A_INICIAR' ? 'EM_ANDAMENTO' : 'CONCLUIDO')}
                className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-950/40 rounded transition cursor-pointer flex items-center gap-0.5 text-[9px]"
              >
                Mover <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {deleteTaskId === task.id && (
          <div className="absolute inset-0 bg-slate-950/95 border border-red-500/20 rounded-xl p-3 flex flex-col justify-center items-center text-center space-y-2 z-10 animate-fadeIn">
            <p className="text-[11px] text-red-200">Excluir esta tarefa?</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleTaskDelete(task.id)}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Confirmar
              </button>
              <button
                onClick={() => setDeleteTaskId(null)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-350 text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEmptyColumnPlaceholder = () => {
    return (
      <div className="border border-dashed border-slate-800/40 rounded-xl py-8 text-center text-slate-600 text-xs">
        Nenhuma tarefa nesta etapa
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Back link */}
      <div>
        <Link 
          href="/projetos" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Projetos
        </Link>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Banner Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{project.nome}</h1>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                  project.status === 'CONCLUIDO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  project.status === 'EM_ANDAMENTO' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  project.status === 'CANCELADO' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-800'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">{project.descricao || 'Sem descrição.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
            <div>
              <span className="block text-[9px] text-slate-500 font-bold uppercase">Início</span>
              <span className="font-semibold text-slate-350">{new Date(project.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="block text-[9px] text-slate-500 font-bold uppercase">Prazo Final</span>
              <span className="font-semibold text-slate-350">{new Date(project.dataTerminoPrevista + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* List of allocated teams for context */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Equipes Alocadas:
          </span>
          {allocatedTeams.map(team => (
            <Link 
              key={team.id}
              href={`/equipes/${team.id}`}
              className="inline-flex items-center px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-indigo-400 hover:border-indigo-500/20 transition"
            >
              {team.nome}
            </Link>
          ))}
          {allocatedTeams.length === 0 && (
            <span className="text-xs text-slate-500 italic">
              Nenhuma equipe alocada a este projeto. Vincule uma equipe na página de <Link href="/equipes" className="text-indigo-400 hover:underline">Equipes</Link> para adicionar membros e criar tarefas.
            </span>
          )}
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Quadro de Acompanhamento (Kanban)</h2>
          {hasWriteAccess && (
            <button
              onClick={handleOpenAddTaskModal}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              disabled={possibleResponsibles.length === 0}
              title={possibleResponsibles.length === 0 ? "É necessário alocar uma equipe com membros ao projeto antes de cadastrar tarefas." : "Criar Tarefa"}
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </button>
          )}
        </div>

        {possibleResponsibles.length === 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-400" />
            <span>
              **Importante:** Para criar tarefas, você precisa primeiro alocar uma equipe que possua membros a este projeto. Vá em **Equipes**, selecione uma equipe e adicione colaboradores a ela e aloque o projeto.
            </span>
          </div>
        )}

        {/* 3-Column Kanban Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN: A INICIAR */}
          <div className="bg-slate-900/15 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                A Iniciar
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold">
                {tasksAIniciar.length}
              </span>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              {tasksAIniciar.map(task => renderTaskCard(task))}
              {tasksAIniciar.length === 0 && renderEmptyColumnPlaceholder()}
            </div>
          </div>

          {/* COLUMN: EM ANDAMENTO */}
          <div className="bg-slate-900/15 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                Em Andamento
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-blue-400 font-bold">
                {tasksEmAndamento.length}
              </span>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              {tasksEmAndamento.map(task => renderTaskCard(task))}
              {tasksEmAndamento.length === 0 && renderEmptyColumnPlaceholder()}
            </div>
          </div>

          {/* COLUMN: CONCLUIDO */}
          <div className="bg-slate-900/15 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Concluído
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-bold">
                {tasksConcluidas.length}
              </span>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              {tasksConcluidas.map(task => renderTaskCard(task))}
              {tasksConcluidas.length === 0 && renderEmptyColumnPlaceholder()}
            </div>
          </div>

        </div>
      </div>

      {/* TASK MODAL FORM (Create / Edit) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
              </h2>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {taskFormError && (
              <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{taskFormError}</span>
              </div>
            )}

            <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={taskFormData.titulo}
                  onChange={handleTaskInputChange}
                  placeholder="Ex: Criar DER, Implementar Login"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                  required
                  disabled={taskFormLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Descrição / Entregáveis
                </label>
                <textarea
                  name="descricao"
                  value={taskFormData.descricao}
                  onChange={handleTaskInputChange}
                  placeholder="Explique o que precisa ser entregue..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none resize-none"
                  disabled={taskFormLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Prazo de Entrega *
                  </label>
                  <input
                    type="date"
                    name="prazo"
                    value={taskFormData.prazo}
                    onChange={handleTaskInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                    required
                    disabled={taskFormLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Status Inicial *
                  </label>
                  <select
                    name="status"
                    value={taskFormData.status}
                    onChange={handleTaskInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                    disabled={taskFormLoading}
                  >
                    <option value="A_INICIAR">A Iniciar</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Responsável (Membro das Equipes Alocadas) *
                </label>
                <select
                  name="responsavelId"
                  value={taskFormData.responsavelId}
                  onChange={handleTaskInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                  required
                  disabled={taskFormLoading}
                >
                  <option value="">Selecione um responsável...</option>
                  {possibleResponsibles.map(r => (
                    <option key={r.id} value={r.id}>{r.nome} ({r.cargo || r.perfil})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800/80 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                  disabled={taskFormLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                  disabled={taskFormLoading}
                >
                  {taskFormLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
