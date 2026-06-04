'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  UserCog, 
  TrendingUp, 
  LogOut, 
  Loader2,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
      setLoading(false);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    api.auth.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const role = currentUser?.perfil;
  const isColaborador = role === 'COLABORADOR';
  const isGerente = role === 'GERENTE';
  const isAdmin = role === 'ADMINISTRADOR';

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, show: true },
    { name: 'Projetos', href: '/projetos', icon: FolderKanban, show: true },
    { name: 'Equipes', href: '/equipes', icon: Users, show: true },
    { name: 'Usuários', href: '/usuarios', icon: UserCog, show: isAdmin },
    { name: 'Relatórios', href: '/relatorios', icon: TrendingUp, show: isAdmin || isGerente },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 pb-16 md:pb-0">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            ProjectManager
          </span>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
            <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-slate-200">{currentUser?.nome}</p>
              <p className="text-xs text-indigo-400 font-medium mt-0.5">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            if (!item.show) return null;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition duration-150 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* HEADER FOR MOBILE */}
      <header className="md:hidden flex items-center justify-between h-14 bg-slate-900 border-b border-slate-800 px-4 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            P
          </div>
          <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            ProjectManager
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Perfil: <span className="text-indigo-400 font-bold">{role}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BOTTOM NAV BAR FOR MOBILE FIRST */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-30 shadow-2xl">
        {navItems.map((item) => {
          if (!item.show) return null;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-14 py-1.5 rounded-lg transition ${
                isActive 
                  ? 'text-indigo-400' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-x-hidden p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
