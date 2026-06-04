'use client';

import React, { useEffect, useState } from 'react';
import { api, Team } from '@/lib/api';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  X, 
  AlertCircle,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function EquipesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Team Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      setLoading(true);
      const data = await api.equipes.listar();
      setTeams(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar equipes. Verifique se o backend está ativo.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingTeam(null);
    setFormData({ nome: '', descricao: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (team: Team, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingTeam(team);
    setFormData({
      nome: team.nome,
      descricao: team.descricao || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) {
      setFormError('O nome da equipe é obrigatório.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      if (editingTeam) {
        await api.equipes.atualizar(editingTeam.id, formData);
        setSuccess('Equipe atualizada com sucesso!');
      } else {
        await api.equipes.criar(formData);
        setSuccess('Equipe criada com sucesso!');
      }
      setIsModalOpen(false);
      loadTeams();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao salvar equipe.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await api.equipes.remover(id);
      setSuccess('Equipe removida com sucesso!');
      setDeleteConfirmId(null);
      loadTeams();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao remover equipe. Verifique se existem membros ou projetos alocados.');
    }
  };

  const hasWriteAccess = currentUser?.perfil === 'ADMINISTRADOR' || currentUser?.perfil === 'GERENTE';

  // Filtered teams
  const filteredTeams = teams.filter(team =>
    team.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.descricao && team.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Equipes de Trabalho</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as equipes de colaboradores e associe-as aos projetos.
          </p>
        </div>
        {hasWriteAccess && (
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Equipe
          </button>
        )}
      </div>

      {/* Toast Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-center gap-3 animate-fadeIn">
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

      {/* Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nome ou descrição de equipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/30 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              href={`/equipes/${team.id}`}
              className="group block relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 shadow-md hover:shadow-indigo-500/5 transition duration-200"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                {hasWriteAccess && (
                  <div className="flex gap-1 relative z-10">
                    <button
                      onClick={(e) => handleOpenEditModal(team, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      title="Editar Equipe"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirmId(team.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      title="Excluir Equipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-200 group-hover:text-indigo-400 transition truncate">
                {team.nome}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[2.5rem]">
                {team.descricao || 'Nenhuma descrição fornecida.'}
              </p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-500">
                <span>{team.membros?.length || 0} membros</span>
                <span>{team.projetos?.length || 0} projetos</span>
              </div>

              {/* Delete verification in card */}
              {deleteConfirmId === team.id && (
                <div className="absolute inset-0 bg-slate-900 border border-red-500/40 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 z-10 animate-fadeIn">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">Excluir equipe?</p>
                    <p className="text-xs text-slate-400 px-2">Essa ação irá desalocar projetos associados.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleDelete(team.id, e)}
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
          ))}

          {filteredTeams.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 text-sm">
              Nenhuma equipe encontrada para exibir.
            </div>
          )}
        </div>
      )}

      {/* FORM MODAL (Add/Edit Team) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingTeam ? 'Editar Equipe' : 'Criar Nova Equipe'}
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
                  Nome da Equipe *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Time de Design, Dev Backend"
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
                  placeholder="Detalhe o propósito ou foco do time..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-850/80 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
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
                  {editingTeam ? 'Salvar Alterações' : 'Criar Equipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
