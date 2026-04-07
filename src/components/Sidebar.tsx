import React, { useState } from 'react';
import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
  FileTextIcon,
  MenuIcon,
  XIcon,
  DollarSignIcon,
  ShieldIcon,
  LogOutIcon,
  UserIcon,
  HeadphonesIcon,
  SunIcon,
  MoonIcon } from
'lucide-react';
import { TabType, type Permission } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { hasPermission, ROLE_LABELS } from '../utils/auth';
import nexilogo from '../../assets/images/nexilogo.png';
import flagBr from '../../assets/images/flag-br.svg';
import flagUs from '../../assets/images/flag-us.svg';
interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  permission?: Permission;
}
export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: t('sidebar.dashboard'),
    icon: <LayoutDashboardIcon className="w-5 h-5" />,
    permission: 'dashboard.view'
  },
  {
    id: 'clients_new',
    label: t('sidebar.clients'),
    icon: <UsersIcon className="w-5 h-5" />,
    permission: 'clients.view'
  },
  {
    id: 'atendimentos',
    label: t('sidebar.attendances'),
    icon: <HeadphonesIcon className="w-5 h-5" />,
    permission: 'atendimentos.view'
  },
  {
    id: 'process_cases',
    label: t('sidebar.processCases'),
    icon: <BriefcaseIcon className="w-5 h-5" />,
    permission: 'clients.view'
  },
  {
    id: 'calendar',
    label: t('sidebar.calendar'),
    icon: <CalendarIcon className="w-5 h-5" />,
    permission: 'calendar.view'
  },
  {
    id: 'reports',
    label: t('sidebar.reports'),
    icon: <FileTextIcon className="w-5 h-5" />,
    permission: 'reports.view'
  },
  {
    id: 'financeiro',
    label: t('sidebar.financial'),
    icon: <DollarSignIcon className="w-5 h-5" />,
    permission: 'financeiro.view'
  },
  {
    id: 'admin_roles',
    label: t('sidebar.roles'),
    icon: <ShieldIcon className="w-5 h-5" />,
    permission: 'admin.roles'
  }];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission || !user) return true;
    return hasPermission(user.role, item.permission);
  });
  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
    setIsMobileOpen(false);
  };
  const handleLogout = () => {
    if (confirm(t('auth.logoutConfirm'))) {
      void logout();
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
            <img
              src={nexilogo}
              alt="Nexi Logo"
              className="w-20 h-20 object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('sidebar.brand')}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {t('sidebar.tagline')}
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setLanguage('pt')}
              className={`flex items-center justify-center rounded-full border px-3 py-2 text-sm transition-all ${language === 'pt' ? 'border-white/40 bg-white/15 text-white' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}
              aria-label={t('sidebar.language.pt')}>
              <img src={flagBr} alt="Brasil" className="h-4 w-4 rounded-sm object-cover" />
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex items-center justify-center rounded-full border px-3 py-2 text-sm transition-all ${language === 'en' ? 'border-white/40 bg-white/15 text-white' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}
              aria-label={t('sidebar.language.en')}>
              <img src={flagUs} alt="United States" className="h-4 w-4 rounded-sm object-cover" />
            </button>
          </div>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all duration-200">
            
            {theme === 'dark' ?
            <>
                <SunIcon className="w-5 h-5" />
                <span className="font-medium">{t('auth.theme.light')}</span>
              </> :

            <>
                <MoonIcon className="w-5 h-5" />
                <span className="font-medium">{t('auth.theme.dark')}</span>
              </>
            }
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-all duration-200">
            
            <LogOutIcon className="w-5 h-5" />
            <span className="font-medium">{t('auth.logout')}</span>
          </button>

          <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
            v1.0.0 • © 2026
          </p>
        </div>
      </aside>
    </>);

}