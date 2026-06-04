'use client';

import React, { useEffect, useState } from 'react';
import { api, PerformanceReport, OccupationReport } from '@/lib/api';
import { 
  TrendingUp, 
  Users, 
  Loader2, 
  AlertCircle,
  ShieldAlert,
  Download,
  BarChart3,
  CheckCircle2,
  Clock,
  PieChart
} from 'lucide-react';

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState<'performance' | 'occupation'>('performance');
  const [perfReports, setPerfReports] = useState<PerformanceReport[]>([]);
  const [occupReports, setOccupReports] = useState<OccupationReport[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);
    
    if (user && user.perfil !== 'COLABORADOR') {
      loadReports();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      const [performanceData, occupationData] = await Promise.all([
        api.relatorios.desempenho(),
        api.relatorios.ocupacao()
      ]);
      setPerfReports(performanceData);
      setOccupReports(occupationData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar os relatórios de gestão. Verifique o servidor backend.');
    } finally {
      setLoading(false);
    }
  }

  // Auth check
  const isAuthorized = currentUser?.perfil === 'ADMINISTRADOR' || currentUser?.perfil === 'GERENTE';

  if (!loading && !isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
          <p className="text-slate-400 text-sm">
            Somente usuários com perfil de **Administrador** ou **Gerente** têm permissão para visualizar relatórios de desempenho e ocupação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Relatórios Gerenciais</h1>
          <p className="text-slate-400 text-sm mt-1">
            Métricas de desempenho de projetos e carga de trabalho de colaboradores.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition relative cursor-pointer ${
            activeTab === 'performance' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          Desempenho dos Projetos
        </button>
        <button
          onClick={() => setActiveTab('occupation')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition relative cursor-pointer ${
            activeTab === 'occupation' 
              ? 'text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-slate-500 hover:text-slate-350'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          Ocupação dos Colaboradores
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : activeTab === 'performance' ? (
        
        /* PERFORMANCE TAB CONTENT */
        <div className="space-y-6">
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              Taxa de Conclusão por Projeto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {perfReports.map(report => (
                <div 
                  key={report.projetoId}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-slate-200 text-sm sm:text-base">{report.projetoNome}</h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/10">
                      {Math.round(report.percentualConcluido)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${report.percentualConcluido}%` }} />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-850/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-650" />
                      Total de tarefas: **{report.totalTarefas}**
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluídas: **{report.tarefasConcluidas}**
                    </span>
                  </div>
                </div>
              ))}

              {perfReports.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 text-sm">
                  Nenhum projeto registrado com tarefas associadas.
                </div>
              )}
            </div>
          </div>
        </div>

      ) : (

        /* OCCUPATION TAB CONTENT */
        <div className="space-y-6">
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {/* Card list for Mobile, Table for Desktop */}
            <div className="block md:hidden divide-y divide-slate-800">
              {occupReports.map(report => (
                <div key={report.colaboradorId} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-200 text-sm">{report.colaboradorNome}</h3>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold">
                      ID: {report.colaboradorId}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded-xl text-center">
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase font-bold">Total</span> 
                      <span className="text-sm font-semibold text-slate-200">{report.totalTarefasAtribuidas}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase font-bold text-blue-400">Pendentes</span> 
                      <span className="text-sm font-semibold text-blue-400">{report.tarefasPendentes}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase font-bold text-emerald-400">Concluídas</span> 
                      <span className="text-sm font-semibold text-emerald-400">{report.tarefasConcluidas}</span>
                    </div>
                  </div>
                </div>
              ))}

              {occupReports.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Nenhum colaborador com tarefas cadastradas.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Nome do Colaborador</th>
                    <th className="px-6 py-4 text-center">Total de Tarefas</th>
                    <th className="px-6 py-4 text-center">Pendentes / Em Andamento</th>
                    <th className="px-6 py-4 text-center">Concluídas</th>
                    <th className="px-6 py-4">Status de Carga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {occupReports.map(report => {
                    const burden = report.tarefasPendentes;
                    const statusText = burden > 4 ? 'Sobrecarregado' : burden > 2 ? 'Moderado' : burden > 0 ? 'Leve' : 'Livre';
                    const statusClass = burden > 4 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                        burden > 2 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                        burden > 0 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';

                    return (
                      <tr key={report.colaboradorId} className="hover:bg-slate-900/20 transition">
                        <td className="px-6 py-4 font-semibold text-slate-200">{report.colaboradorNome}</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-slate-350">{report.totalTarefasAtribuidas}</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-blue-400">{report.tarefasPendentes}</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-emerald-400">{report.tarefasConcluidas}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {occupReports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                        Nenhum colaborador com tarefas cadastradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
