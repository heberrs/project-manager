'use client';

import React, { useEffect, useState } from 'react';
import { api, Project, Team, Task, User } from '@/lib/api';
import { 
  FolderKanban, 
  Users, 
  CheckSquare, 
  UserCog, 
  Calendar,
  AlertCircle,
  Plus,
  Loader2,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);

    async function loadDashboardData() {
      try {
        const [projectsData, teamsData, tasksData] = await Promise.all([
          api.projetos.listar(),
          api.equipes.listar(),
          api.tarefas.listar()
        ]);
        
        setProjects(projectsData);
        setTeams(teamsData);
        setTasks(tasksData);

        // Try listing users if authorized (ADMIN or GERENTE)
        if (user && user.perfil !== 'COLABORADOR') {
          const usersData = await api.usuarios.listar();
          setUsersCount(usersData.length);
        } else {
          setUsersCount(0);
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados do painel:', err);
        setError('Não foi possível carregar todas as informações do painel. Verifique se o backend está rodando.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-sm">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  // Calculate task counts
  const tasksPending = tasks.filter(t => t.status !== 'CONCLUIDO').length;
  const tasksCompleted = tasks.filter(t => t.status === 'CONCLUIDO').length;
  const taskProgress = tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-8">
      {/* Header / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Olá, {currentUser?.nome || 'Usuário'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Aqui está o resumo dos projetos e tarefas sob sua gestão.
          </p>
        </div>
        
        {currentUser?.perfil !== 'COLABORADOR' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Link 
              href="/projetos?new=true"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition duration-150"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projetos</p>
            <p className="text-3xl font-bold text-white">{projects.length}</p>
            <p className="text-[10px] text-slate-500">Ativos no sistema</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/10">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Tasks Progress Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tarefas</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">{tasks.length}</p>
              <p className="text-xs text-slate-400">({tasksPending} pendentes)</p>
            </div>
            {/* Simple progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${taskProgress}%` }} />
            </div>
            <p className="text-[10px] text-slate-500">{taskProgress}% de conclusão geral</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/10 ml-4 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Teams Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Equipes</p>
            <p className="text-3xl font-bold text-white">{teams.length}</p>
            <p className="text-[10px] text-slate-500">Equipes alocadas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/10">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Users Count Card (or Role Details for Colaborador) */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex items-center justify-between">
          {currentUser?.perfil !== 'COLABORADOR' ? (
            <>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Colaboradores</p>
                <p className="text-3xl font-bold text-white">{usersCount}</p>
                <p className="text-[10px] text-slate-500">Usuários cadastrados</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/10">
                <UserCog className="w-6 h-6" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seu Perfil</p>
                <p className="text-lg font-bold text-white truncate max-w-[150px]">{currentUser?.cargo || 'Colaborador'}</p>
                <p className="text-[10px] text-slate-500">Acesso Restrito</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10">
                <UserIcon className="w-6 h-6" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects list */}
        <div className="lg:col-span-2 bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              Projetos Recentes
            </h2>
            <Link href="/projetos" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => {
              const projectTasks = tasks.filter(t => t.projetoId === project.id);
              const completedTasks = projectTasks.filter(t => t.status === 'CONCLUIDO').length;
              const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

              return (
                <Link 
                  key={project.id}
                  href={`/projetos/${project.id}`}
                  className="block p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition duration-150"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm sm:text-base hover:text-indigo-400 transition">{project.nome}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{project.descricao}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      project.status === 'CONCLUIDO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      project.status === 'EM_ANDAMENTO' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      project.status === 'CANCELADO' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Previsto: {new Date(project.dataTerminoPrevista + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    <span className="font-semibold">{progress}% Concluído</span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-1 mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </Link>
              );
            })}

            {projects.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Nenhum projeto cadastrado no momento.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar panels (Teams list / Tasks assigned to me) */}
        <div className="space-y-6">
          {/* Teams panel */}
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Equipes
              </h2>
              <Link href="/equipes" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {teams.slice(0, 4).map((team) => (
                <Link
                  key={team.id}
                  href={`/equipes/${team.id}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition duration-150"
                >
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{team.nome}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{team.membros?.length || 0} membros</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>
              ))}

              {teams.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  Nenhuma equipe cadastrada.
                </div>
              )}
            </div>
          </div>

          {/* User Specific info / PWA installation banner */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/20 border border-indigo-500/20 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Aplicativo Mobile (PWA)</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Você pode instalar este sistema como um aplicativo nativo em seu smartphone ou computador. Acesse a barra de endereço do navegador e clique em "Adicionar à tela inicial" ou "Instalar".
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase">
              Pronto para Instalação
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
