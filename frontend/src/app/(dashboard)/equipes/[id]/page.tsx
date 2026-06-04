'use client';

import React, { useEffect, useState, use } from 'react';
import { api, Team, User, Project } from '@/lib/api';
import { 
  Users, 
  ArrowLeft, 
  UserPlus, 
  FolderPlus, 
  UserMinus, 
  FolderMinus, 
  Loader2, 
  AlertCircle,
  Check,
  User as UserIcon,
  FolderKanban
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DetalhesEquipePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Resolve params promise
  const resolvedParams = use(params);
  const teamId = parseInt(resolvedParams.id, 10);

  const [team, setTeam] = useState<Team | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Selection states
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadTeamDetails();
  }, [teamId]);

  async function loadTeamDetails() {
    try {
      setLoading(true);
      const teamData = await api.equipes.obter(teamId);
      setTeam(teamData);

      const user = api.auth.getCurrentUser();
      
      // Admin/Gerente can manage members and projects, load selections
      if (user && user.perfil !== 'COLABORADOR') {
        const [usersData, projectsData] = await Promise.all([
          api.usuarios.listar(),
          api.projetos.listar()
        ]);
        setAllUsers(usersData);
        setAllProjects(projectsData);
      }
      
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar detalhes da equipe.');
    } finally {
      setLoading(false);
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    setActionLoading(true);
    setError(null);
    try {
      const updated = await api.equipes.adicionarMembro(teamId, parseInt(selectedUserId, 10));
      setTeam(updated);
      setSelectedUserId('');
      setSuccess('Membro adicionado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao adicionar membro.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await api.equipes.removerMembro(teamId, memberId);
      setTeam(updated);
      setSuccess('Membro removido com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao remover membro.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAllocateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    
    setActionLoading(true);
    setError(null);
    try {
      const updated = await api.equipes.alocarProjeto(teamId, parseInt(selectedProjectId, 10));
      setTeam(updated);
      setSelectedProjectId('');
      setSuccess('Projeto alocado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao alocar projeto.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDesallocateProject = async (projectId: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await api.equipes.desalocarProjeto(teamId, projectId);
      setTeam(updated);
      setSuccess('Projeto desalocado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao desalocar projeto.');
    } finally {
      setActionLoading(false);
    }
  };

  const hasWriteAccess = currentUser?.perfil === 'ADMINISTRADOR' || currentUser?.perfil === 'GERENTE';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-sm">Carregando detalhes da equipe...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Equipe Não Encontrada</h2>
        <Link href="/equipes" className="text-indigo-400 font-semibold inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Voltar para lista
        </Link>
      </div>
    );
  }

  // Filter out users already in team
  const availableUsers = allUsers.filter(
    u => !team.membros?.some(m => m.id === u.id)
  );

  // Filter out projects already allocated to team
  const availableProjects = allProjects.filter(
    p => !team.projetos?.some(proj => proj.id === p.id)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Back button */}
      <div>
        <Link 
          href="/equipes" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Equipes
        </Link>
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

      {/* Team Profile Header */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{team.nome}</h1>
            <p className="text-slate-400 text-sm mt-1">{team.descricao || 'Sem descrição.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 bg-slate-950/40 px-6 py-3 rounded-2xl border border-slate-800 relative z-10 shrink-0">
          <div>
            <span className="block text-[10px] text-slate-500 font-bold uppercase">Membros</span>
            <span className="text-lg font-bold text-slate-200">{team.membros?.length || 0}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="block text-[10px] text-slate-500 font-bold uppercase">Projetos Ativos</span>
            <span className="text-lg font-bold text-slate-200">{team.projetos?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Grid: Members & Projects Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Members Management Column */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            Membros da Equipe
          </h2>

          {/* Form to Add Member */}
          {hasWriteAccess && (
            <form onSubmit={handleAddMember} className="flex gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs focus:border-indigo-500 outline-none cursor-pointer"
                disabled={actionLoading}
              >
                <option value="">Selecione um colaborador para adicionar...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nome} ({user.cargo || user.perfil})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 active:scale-95 text-white text-xs font-semibold rounded-xl transition cursor-pointer shrink-0"
                disabled={!selectedUserId || actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
              </button>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {team.membros && team.membros.map(member => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {member.nome.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-200">{member.nome}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{member.cargo || member.perfil}</p>
                  </div>
                </div>

                {hasWriteAccess && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title="Remover da equipe"
                    disabled={actionLoading}
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {(!team.membros || team.membros.length === 0) && (
              <div className="text-center py-12 text-slate-500 text-sm">
                Nenhum membro cadastrado nesta equipe.
              </div>
            )}
          </div>
        </div>

        {/* Projects Management Column */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            Alocação em Projetos
          </h2>

          {/* Form to Allocate Project */}
          {hasWriteAccess && (
            <form onSubmit={handleAllocateProject} className="flex gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs focus:border-indigo-500 outline-none cursor-pointer"
                disabled={actionLoading}
              >
                <option value="">Selecione um projeto para alocar a equipe...</option>
                {availableProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.nome} (Status: {project.status.replace('_', ' ')})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 active:scale-95 text-white text-xs font-semibold rounded-xl transition cursor-pointer shrink-0"
                disabled={!selectedProjectId || actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Alocar'}
              </button>
            </form>
          )}

          {/* Projects List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {team.projetos && team.projetos.map(project => (
              <div 
                key={project.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <Link href={`/projetos/${project.id}`}>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-indigo-400 transition">{project.nome}</h4>
                    </Link>
                    <p className="text-[10px] text-slate-500 mt-0.5">Status: {project.status.replace('_', ' ')}</p>
                  </div>
                </div>

                {hasWriteAccess && (
                  <button
                    onClick={() => handleDesallocateProject(project.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title="Desalocar da equipe"
                    disabled={actionLoading}
                  >
                    <FolderMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {(!team.projetos || team.projetos.length === 0) && (
              <div className="text-center py-12 text-slate-500 text-sm">
                Nenhum projeto associado a esta equipe.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
