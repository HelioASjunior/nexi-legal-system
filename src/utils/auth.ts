import { AppRole, Permission } from '../types';

/**
 * Role hierarchy and permission definitions
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

const CUSTOM_PERMISSIONS_KEY = 'crm_custom_permissions';

export function getCustomPermissions(): Record<AppRole, Permission[]> {
  try {
    const stored = localStorage.getItem(CUSTOM_PERMISSIONS_KEY);
    if (stored) {
      return JSON.parse(stored) as Record<AppRole, Permission[]>;
    }
  } catch {
    // ignore
  }
  return { ...ROLE_PERMISSIONS };
}

export function saveCustomPermissions(perms: Record<AppRole, Permission[]>): void {
  localStorage.setItem(CUSTOM_PERMISSIONS_KEY, JSON.stringify(perms));
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

/**
 * Session storage key
 */
const AUTH_STORAGE_KEY = 'crm_auth_session';

/**
 * Save auth session to localStorage
 */
export function saveSession(userId: string, token: string): void {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ userId, token, timestamp: Date.now() })
  );
}

/**
 * Get stored session
 */
export function getStoredSession(): {userId: string;token: string;} | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // Session expires after 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      clearSession();
      return null;
    }
    return { userId: parsed.userId, token: parsed.token };
  } catch {
    return null;
  }
}

/**
 * Clear auth session
 */
export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}