import { useCallback, useEffect, useState } from 'react';
import { TabType, type Permission } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';
import { hasPermission } from './utils/auth';
import { Sidebar } from './components/Sidebar';
import { NotificationBell } from './components/NotificationBell';
import { LoginPage } from './pages/LoginPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewClientsPage } from './pages/NewClientsPage';
import { AtendimentosPage } from './pages/AtendimentosPage';
import { ProcessosCasosPage } from './pages/ProcessosCasosPage.tsx';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminRolesPage } from './pages/AdminRolesPage';
import { assertSensitiveEnv } from './config/env';
import {
  ensureDatabaseApiAvailable,
  isDatabaseRequired,
} from './services/sqliteApi';
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
    const permissionMap: Record<TabType, Permission> = {
      dashboard: 'dashboard.view',
      clients_new: 'clients.view',
      atendimentos: 'atendimentos.view',
      process_cases: 'clients.view',
      financeiro: 'financeiro.view',
      calendar: 'calendar.view',
      reports: 'reports.view',
      admin_roles: 'admin.roles'
    };
    const permission = permissionMap[tab];
    return permission ? hasPermission(user.role, permission) : true;
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
      case 'process_cases':
        return <ProcessosCasosPage />;
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
  const [dbCheckState, setDbCheckState] = useState<'checking' | 'ready' | 'error'>('checking');
  const [dbCheckMessage, setDbCheckMessage] = useState('');

  const verifyDatabase = useCallback(async () => {
    if (!isDatabaseRequired()) {
      setDbCheckState('ready');
      setDbCheckMessage('');
      return;
    }

    setDbCheckState('checking');
    setDbCheckMessage('');

    try {
      await ensureDatabaseApiAvailable();
      setDbCheckState('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao conectar na API.';
      setDbCheckMessage(message);
      setDbCheckState('error');
    }
  }, []);

  useEffect(() => {
    void verifyDatabase();
  }, [verifyDatabase]);

  if (dbCheckState === 'checking') {
    return (
      <div className="min-h-screen w-full bg-[var(--dark-bg)] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-12 h-12 border-4 border-[var(--accent-blue)]/30 border-t-[var(--accent-blue)] rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Verificando conexao com o banco de dados...
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            A aplicacao so inicia quando a API (SQLite) estiver ativa.
          </p>
        </div>
      </div>
    );
  }

  if (dbCheckState === 'error') {
    return (
      <div className="min-h-screen w-full bg-[var(--dark-bg)] flex items-center justify-center">
        <div className="w-full max-w-lg px-6 py-8 rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] shadow-xl">
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Banco de dados obrigatorio nao disponivel
          </h1>
          <p className="text-[var(--text-secondary)] mb-2">
            Inicie API + frontend com o comando:
          </p>
          <p className="font-mono text-sm text-[var(--accent-blue)] mb-4">npm run dev:full</p>
          <p className="text-sm text-[var(--warning)] mb-5">Detalhe: {dbCheckMessage}</p>
          <button
            type="button"
            onClick={() => void verifyDatabase()}
            className="px-4 py-2 rounded-lg bg-[var(--accent-blue)] text-white font-medium hover:opacity-90 transition-opacity">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>);

}