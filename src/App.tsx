import { useEffect, useState } from 'react';
import { TabType } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { hasPermission } from './utils/auth';
import { Sidebar } from './components/Sidebar';
import { NotificationBell } from './components/NotificationBell';
import { LoginPage } from './pages/LoginPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewClientsPage } from './pages/NewClientsPage';
import { AtendimentosPage } from './pages/AtendimentosPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminRolesPage } from './pages/AdminRolesPage';
import { assertSensitiveEnv } from './config/env';
function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  useEffect(() => {
    const missing = assertSensitiveEnv();
    if (missing.length > 0) {
      console.warn('[SECURITY] Variaveis sensiveis ausentes:', missing.join(', '));
    }
  }, []);
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[var(--dark-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--accent-blue)]/30 border-t-[var(--accent-blue)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </div>);

  }
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  const checkTabPermission = (tab: TabType): boolean => {
    if (!user) return false;
    const permissionMap: Record<TabType, string> = {
      dashboard: 'dashboard.view',
      clients_new: 'clients.view',
      atendimentos: 'atendimentos.view',
      financeiro: 'financeiro.view',
      calendar: 'calendar.view',
      reports: 'reports.view',
      admin_roles: 'admin.roles'
    };
    const permission = permissionMap[tab];
    return permission ? hasPermission(user.role, permission as any) : true;
  };
  const renderPage = () => {
    if (!checkTabPermission(activeTab)) {
      return <AccessDeniedPage onGoBack={() => setActiveTab('dashboard')} />;
    }
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'clients_new':
        return <NewClientsPage />;
      case 'atendimentos':
        return <AtendimentosPage />;
      case 'financeiro':
        return <FinanceiroPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'reports':
        return <ReportsPage />;
      case 'admin_roles':
        return <AdminRolesPage />;
      default:
        return <DashboardPage />;
    }
  };
  return (
    <div className="flex min-h-screen bg-[var(--dark-bg)]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-h-screen overflow-auto lg:ml-0">
        <div className="lg:hidden h-16" />
        <div className="sticky top-0 z-20 glass border-b border-[var(--glass-border)]">
          <div className="flex items-center justify-end px-6 py-3">
            <NotificationBell />
          </div>
        </div>
        {renderPage()}
      </main>
    </div>);

}
export function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>);

}