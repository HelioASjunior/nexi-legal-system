/**
 * Módulo de autenticação e controle de acesso baseado em papéis (RBAC).
 * Define as permissões de cada cargo, gerencia sessões via sessionStorage e
 * fornece funções para verificar permissões em tempo de execução.
 */
import { AppRole, Permission } from '../types';
import { fetchAppStateFromDatabase, syncAppStateToDatabase } from '../services/sqliteApi';

/**
 * Mapeamento padrão de papéis para suas permissões.
 * Este valor é a fonte de verdade inicial; pode ser sobrescrito pelo banco de dados
 * via `hydrateAuthMetaFromDatabase` e `saveCustomPermissions`.
 */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  administrador: [
  'dashboard.view',
  'clients.view',
  'clients.create',
  'clients.edit',
  'clients.delete',
  'atendimentos.view',
  'atendimentos.create',
  'atendimentos.edit',
  'atendimentos.delete',
  'financeiro.view',
  'financeiro.create',
  'financeiro.edit',
  'financeiro.delete',
  'calendar.view',
  'calendar.create',
  'calendar.edit',
  'calendar.delete',
  'reports.view',
  'reports.create',
  'admin.roles',
  'admin.users'],

  advogado_total: [
  'dashboard.view',
  'clients.view',
  'clients.create',
  'clients.edit',
  'clients.delete',
  'atendimentos.view',
  'atendimentos.create',
  'atendimentos.edit',
  'calendar.view',
  'calendar.create',
  'calendar.edit',
  'calendar.delete',
  'reports.view',
  'reports.create'],

  advogado_senior: [
  'dashboard.view',
  'clients.view',
  'clients.edit',
  'atendimentos.view',
  'atendimentos.edit',
  'calendar.view',
  'calendar.create',
  'calendar.edit',
  'reports.view'],

  advogado_junior: [
  'dashboard.view',
  'clients.view',
  'clients.edit',
  'atendimentos.view',
  'calendar.view',
  'calendar.create'],

  atendente: [
  'clients.view',
  'clients.create',
  'clients.edit',
  'atendimentos.view',
  'atendimentos.create',
  'atendimentos.edit']

};

export const ROLE_LABELS: Record<AppRole, string> = {
  administrador: 'Administrador',
  advogado_total: 'Advogado(a) Total Acesso',
  advogado_senior: 'Advogado(a) Sênior',
  advogado_junior: 'Advogado(a) Júnior',
  atendente: 'Atendente'
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  'dashboard.view': 'Visualizar Dashboard',
  'clients.view': 'Visualizar Clientes',
  'clients.create': 'Cadastrar Clientes',
  'clients.edit': 'Editar Clientes',
  'clients.delete': 'Excluir Clientes',
  'atendimentos.view': 'Visualizar Atendimentos',
  'atendimentos.create': 'Criar Atendimentos',
  'atendimentos.edit': 'Editar Atendimentos',
  'atendimentos.delete': 'Excluir Atendimentos',
  'financeiro.view': 'Visualizar Financeiro',
  'financeiro.create': 'Criar Financeiro',
  'financeiro.edit': 'Editar Financeiro',
  'financeiro.delete': 'Excluir Financeiro',
  'calendar.view': 'Visualizar Calendário',
  'calendar.create': 'Criar Eventos',
  'calendar.edit': 'Editar Eventos',
  'calendar.delete': 'Excluir Eventos',
  'reports.view': 'Visualizar Relatórios',
  'reports.create': 'Gerar Relatórios',
  'admin.roles': 'Gerenciar Cargos',
  'admin.users': 'Gerenciar Usuários'
};

let customPermissionsStore: Record<AppRole, Permission[]> = { ...ROLE_PERMISSIONS };
let authSessionStore: { userId: string; token: string; timestamp: number } | null = null;

// Chave usada no sessionStorage do browser (limpo ao fechar a aba).
const SESSION_STORAGE_KEY = 'crm_jur_session';

export async function hydrateAuthMetaFromDatabase(): Promise<void> {
  const state = await fetchAppStateFromDatabase();

  if (state.customPermissions && typeof state.customPermissions === 'object') {
    customPermissionsStore = state.customPermissions as Record<AppRole, Permission[]>;
  }

  // authSession no DB é mantido apenas como fallback legado;
  // a fonte primária é o sessionStorage (lido em getStoredSession).
}

export function getCustomPermissions(): Record<AppRole, Permission[]> {
  return customPermissionsStore;
}

export async function saveCustomPermissions(perms: Record<AppRole, Permission[]>): Promise<void> {
  customPermissionsStore = perms;
  await syncAppStateToDatabase({ customPermissions: customPermissionsStore });
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AppRole, permission: Permission): boolean {
  return getCustomPermissions()[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
role: AppRole,
permissions: Permission[])
: boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: AppRole): Permission[] {
  return getCustomPermissions()[role] || [];
}

const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Persiste sessão no sessionStorage (primário) e em memória.
 * sessionStorage é limpo quando a aba é fechada — não persiste entre abas.
 */
export async function saveSession(userId: string, token: string): Promise<void> {
  const session = { userId, token, timestamp: Date.now() };
  authSessionStore = session;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage indisponível (ex: iframe sandboxed) — prossegue sem.
  }
}

/**
 * Recupera sessão ativa. Lê primeiro o sessionStorage (sobrevive a F5),
 * depois a memória. Retorna null se expirada ou inexistente.
 */
export function getStoredSession(): { userId: string; token: string } | null {
  try {
    // Prioridade 1: memória (mais rápido)
    if (authSessionStore) {
      if (Date.now() - authSessionStore.timestamp > SESSION_TTL) {
        void clearSession();
        return null;
      }
      return { userId: authSessionStore.userId, token: authSessionStore.token };
    }

    // Prioridade 2: sessionStorage (sobrevive ao refresh da página)
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as { userId: string; token: string; timestamp: number };
      if (Date.now() - stored.timestamp < SESSION_TTL) {
        authSessionStore = stored; // promove para memória
        return { userId: stored.userId, token: stored.token };
      }
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Falha de parse ou sessionStorage bloqueado
  }
  return null;
}

/**
 * Remove a sessão local (memória + sessionStorage).
 * O token do servidor deve ser invalidado antes via POST /api/auth/logout.
 */
export async function clearSession(): Promise<void> {
  authSessionStore = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // sessionStorage indisponível
  }
}