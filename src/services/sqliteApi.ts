/**
 * Camada de acesso à API SQLite do backend (Express/better-sqlite3).
 * Todas as chamadas autenticadas enviam o token Bearer obtido no login.
 * Em caso de falha de rede, as funções retornam valores neutros (arrays vazios, false)
 * para que o frontend possa funcionar em modo degradado sem travar.
 */
import {
  Attendance,
  AppRole,
  AuthUser,
  Client,
  ClientRecord,
  FinancialMovement,
  LegalClient,
  LegalEvent,
  LegalProcess,
  Permission,
} from '../types';

export interface PersistedAppState {
  financialClients: Client[];
  attendances: Attendance[];
  financialMovements: FinancialMovement[];
  legalEvents: LegalEvent[];
  legalClients: LegalClient[];
  legalProcesses: LegalProcess[];
  customPermissions: Record<AppRole, Permission[]>;
  authSession: {
    userId: string;
    token: string;
    timestamp: number;
  } | null;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
const REQUIRE_DATABASE = import.meta.env.VITE_REQUIRE_DATABASE !== 'false';
let apiAuthToken: string | null = null;

export function setApiAuthToken(token: string | null): void {
  apiAuthToken = token;
}

/**
 * Realiza uma requisição HTTP autenticada para a API interna.
 * Injeta automaticamente o token Bearer se disponível.
 * @param path - Rota relativa (ex: '/api/users')
 * @param init - Opções extras de fetch (method, body, etc.)
 * @returns Resposta tipada deserializada de JSON
 * @throws Error se a resposta HTTP não for 2xx
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(apiAuthToken ? { Authorization: `Bearer ${apiAuthToken}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Verifica se a API do banco de dados está acessível.
 * Lança erro se a variável VITE_REQUIRE_DATABASE não for 'false' e a API estiver offline.
 */
export async function ensureDatabaseApiAvailable(): Promise<void> {
  if (!REQUIRE_DATABASE) return;
  await request('/api/health');
}

/**
 * Retorna true se o banco de dados é obrigatório para a aplicação inicializar.
 * Controlado pela variável de ambiente VITE_REQUIRE_DATABASE.
 */
export function isDatabaseRequired(): boolean {
  return REQUIRE_DATABASE;
}

export async function fetchUsersFromDatabase(): Promise<AuthUser[]> {
  try {
    const data = await request<{ users: AuthUser[] }>('/api/users');
    return data.users || [];
  } catch {
    return [];
  }
}

export async function syncUsersToDatabase(
  users: Array<AuthUser & { password?: string; _k?: string }>,
  replace = true
): Promise<boolean> {
  try {
    await request('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify({ users, replace }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function authenticateWithDatabase(email: string, password: string): Promise<
  | { user: AuthUser; token: string }
  | { error: string }
> {
  try {
    const data = await request<{ user: AuthUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Falha de autenticação.' };
  }
}

export async function logoutFromDatabase(): Promise<void> {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignora falha de rede no logout — sessão local já será limpa.
  }
}

export async function createUserInDatabase(
  name: string,
  email: string,
  password: string,
  role: AppRole
): Promise<{ user: AuthUser } | { error: string }> {
  try {
    const data = await request<{ user: AuthUser }>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    return data;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao criar usuário.' };
  }
}

export async function resetUserPasswordInDatabase(userId: string, password: string): Promise<boolean> {
  try {
    await request(`/api/users/${encodeURIComponent(userId)}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchClientsFromDatabase(): Promise<ClientRecord[]> {
  try {
    const data = await request<{ clients: ClientRecord[] }>('/api/clients');
    return data.clients || [];
  } catch {
    return [];
  }
}

export async function syncClientsToDatabase(clients: ClientRecord[], replace = true): Promise<boolean> {
  try {
    await request('/api/clients/sync', {
      method: 'POST',
      body: JSON.stringify({ clients, replace }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchAppStateFromDatabase(): Promise<Partial<PersistedAppState>> {
  try {
    const data = await request<{ state: Partial<PersistedAppState> }>('/api/state');
    return data.state || {};
  } catch {
    return {};
  }
}

export async function syncAppStateToDatabase(state: Partial<PersistedAppState>): Promise<boolean> {
  try {
    await request('/api/state/sync', {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
    return true;
  } catch {
    return false;
  }
}
