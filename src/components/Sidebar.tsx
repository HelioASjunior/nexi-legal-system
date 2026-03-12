import React, { useState } from 'react';
import {
  LayoutDashboardIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  MenuIcon,
  XIcon,
  ScaleIcon,
  DollarSignIcon,
  ShieldIcon,
  LogOutIcon,
  UserIcon,
  HeadphonesIcon,
  SunIcon,
  MoonIcon } from
'lucide-react';
import { TabType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { hasPermission, ROLE_LABELS } from '../utils/auth';
interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}
export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboardIcon className="w-5 h-5" />,
    permission: 'dashboard.view'
  },
  {
    id: 'clients_new',
    label: 'Clientes',
    icon: <UsersIcon className="w-5 h-5" />,
    permission: 'clients.view'
  },
  {
    id: 'atendimentos',
    label: 'Atendimentos',
    icon: <HeadphonesIcon className="w-5 h-5" />,
    permission: 'atendimentos.view'
  },
  {
    id: 'calendar',
    label: 'Calendário',
    icon: <CalendarIcon className="w-5 h-5" />,
    permission: 'calendar.view'
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: <FileTextIcon className="w-5 h-5" />,
    permission: 'reports.view'
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: <DollarSignIcon className="w-5 h-5" />,
    permission: 'financeiro.view'
  },
  {
    id: 'admin_roles',
    label: 'Cargos',
    icon: <ShieldIcon className="w-5 h-5" />,
    permission: 'admin.roles'
  }];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission || !user) return true;
    return hasPermission(user.role, item.permission as any);
  });
  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
    setIsMobileOpen(false);
  };
  const handleLogout = () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      logout();
    }
  };
  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass glass-hover"
        aria-label="Toggle menu">
        
        {isMobileOpen ?
        <XIcon className="w-6 h-6 text-[var(--text-primary)]" /> :

        <MenuIcon className="w-6 h-6 text-[var(--text-primary)]" />
        }
      </button>

      {isMobileOpen &&
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-30"
        onClick={() => setIsMobileOpen(false)} />

      }

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 min-h-screen glass-strong border-r border-[var(--glass-border)]
          transform transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
        
        <div className="p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-blue)]/20 glow-blue">
              <ScaleIcon className="w-6 h-6 text-[var(--accent-blue)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                Sistema Jurídico
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Gestão de Escritório
              </p>
            </div>
          </div>
        </div>

        {user &&
        <div className="p-4 border-b border-[var(--glass-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-[var(--accent-blue)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
          </div>
        }

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 ease-out
                  ${isActive ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] glow-blue border border-[var(--accent-blue)]/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'}
                `}>
                
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>);

          })}
        </nav>

        <div className="p-4 border-t border-[var(--glass-border)] space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all duration-200">
            
            {theme === 'dark' ?
            <>
                <SunIcon className="w-5 h-5" />
                <span className="font-medium">Tema Claro</span>
              </> :

            <>
                <MoonIcon className="w-5 h-5" />
                <span className="font-medium">Tema Escuro</span>
              </>
            }
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-all duration-200">
            
            <LogOutIcon className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>

          <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
            v1.0.0 • © 2024
          </p>
        </div>
      </aside>
    </>);

}