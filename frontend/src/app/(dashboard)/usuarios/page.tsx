'use client';

import React, { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  X, 
  Check,
  ShieldAlert
} from 'lucide-react';

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    cargo: '',
    login: '',
    senha: '',
    perfil: 'COLABORADOR'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await api.usuarios.listar();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar usuários. Verifique suas permissões ou a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      cpf: '',
      email: '',
      cargo: '',
      login: '',
      senha: '',
      perfil: 'COLABORADOR'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      cpf: user.cpf,
      email: user.email,
      cargo: user.cargo || '',
      login: user.login,
      senha: '', // leave empty to not update or it will be filled if modified
      perfil: user.perfil
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nome, cpf, email, login, senha, perfil, cargo } = formData;

    if (!nome || !cpf || !email || !login || (!editingUser && !senha)) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      if (editingUser) {
        // For update, if senha is empty, do we retain it? The backend service expects the password to be set or BCrypt encoded
        // Let's pass the fields.
        await api.usuarios.atualizar(editingUser.id, {
          nome,
          cpf,
          email,
          cargo,
          login,
          senha: senha || undefined, // Send password only if updated
          perfil
        });
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        await api.usuarios.criar({
          nome,
          cpf,
          email,
          cargo,
          login,
          senha,
          perfil
        });
        setSuccess('Usuário criado com sucesso!');
      }
      setIsModalOpen(false);
      loadUsers();
      
      // Auto clear success toast
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao salvar usuário. Certifique-se de que CPF, E-mail ou Login não sejam duplicados.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.usuarios.remover(id);
      setSuccess('Usuário removido com sucesso!');
      setDeleteConfirmId(null);
      loadUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao remover usuário. Verifique se ele está vinculado a alguma equipe ou projeto.');
    }
  };

  // Auth guards
  const isAuthorized = currentUser?.perfil === 'ADMINISTRADOR';

  if (!loading && !isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
          <p className="text-slate-400 text-sm">
            Somente usuários com perfil de **Administrador** têm permissão para acessar esta página de gestão de usuários.
          </p>
        </div>
      </div>
    );
  }

  // Filtered Users list
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf.includes(searchTerm) ||
      (user.cargo && user.cargo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter ? user.perfil === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Gestão de Usuários</h1>
          <p className="text-slate-400 text-sm mt-1">Cadastre e configure os perfis e acessos dos colaboradores.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </button>
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

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/30 p-4 border border-slate-800 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, email, CPF ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 text-sm cursor-pointer"
        >
          <option value="">Todos os Perfis</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="GERENTE">Gerente</option>
          <option value="COLABORADOR">Colaborador</option>
        </select>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Card list for Mobile, Table for Desktop */}
          <div className="block md:hidden divide-y divide-slate-800">
            {filteredUsers.map(user => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{user.nome}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    user.perfil === 'ADMINISTRADOR' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    user.perfil === 'GERENTE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-800'
                  }`}>
                    {user.perfil}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/20 p-2 rounded-xl">
                  <div><span className="text-slate-600 block text-[10px] uppercase">CPF</span> {user.cpf}</div>
                  <div><span className="text-slate-600 block text-[10px] uppercase">Cargo</span> {user.cargo || 'N/A'}</div>
                  <div><span className="text-slate-600 block text-[10px] uppercase">Login</span> {user.login}</div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(user.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Confirm Delete on Mobile Card inline */}
                {deleteConfirmId === user.id && (
                  <div className="mt-2 p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2">
                    <p className="text-xs text-red-200">Tem certeza que deseja excluir este usuário?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhum usuário correspondente aos filtros.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Nome / Email</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">CPF</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Login</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-900/20 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{user.nome}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.perfil === 'ADMINISTRADOR' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        user.perfil === 'GERENTE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-850'
                      }`}>
                        {user.perfil}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{user.cpf}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{user.cargo || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">{user.login}</td>
                    <td className="px-6 py-4 text-right">
                      {deleteConfirmId === user.id ? (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-xs text-red-400 font-medium">Excluir?</span>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition cursor-pointer"
                            title="Editar Usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                      Nenhum usuário correspondente aos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="Apenas números (11 dígitos)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="exemplo@oracle.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    placeholder="Ex: Desenvolvedor Java, Designer"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Login / Usuário *
                  </label>
                  <input
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={handleInputChange}
                    placeholder="Ex: joao.silva"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                    required
                    disabled={!!editingUser} // No renaming login once created
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Perfil de Acesso *
                  </label>
                  <select
                    name="perfil"
                    value={formData.perfil}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none cursor-pointer"
                  >
                    <option value="COLABORADOR">Colaborador</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Senha {editingUser ? '(deixe em branco se não deseja alterar)' : '*'}
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder={editingUser ? 'Senha inalterada' : 'Defina a senha inicial'}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-slate-100 text-sm outline-none"
                  required={!editingUser}
                />
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
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
