/**
 * Repositório de usuários do sistema em memória.
 * A fonte primária de dados é o banco SQLite via API REST; este módulo
 * mantém um cache local para evitar round-trips desnecessários.
 * Senhas NUNCA são armazenadas ou transmitidas pelo frontend — apenas hashes
 * são processados pelo backend via bcrypt.
 */
import { AuthUser, AppRole } from '../types';
import {
  authenticateWithDatabase,
  fetchUsersFromDatabase,
  syncUsersToDatabase,
  createUserInDatabase,
  resetUserPasswordInDatabase,
} from '../services/sqliteApi';

// Cache em memória de usuários (fonte primária: SQLite via API).
// Senhas NUNCA são armazenadas no frontend.
let runtimeUsers: AuthUser[] = [];
let usersHydratedFromDb = false;
let usersSyncTimer: number | null = null;

/**
 * Reseta o flag de hidratação para forçar novo fetch na próxima chamada.
 * Chamado no logout para garantir que o próximo login busque dados frescos.
 */
export function resetUserHydration(): void {
  usersHydratedFromDb = false;
  runtimeUsers = [];
}

function queueUsersSync() {
  if (typeof window === 'undefined') return;
  if (usersSyncTimer !== null) window.clearTimeout(usersSyncTimer);
  usersSyncTimer = window.setTimeout(() => {
    // Sync sem senhas — o backend preserva os hashes existentes.
    void syncUsersToDatabase(runtimeUsers, true);
  }, 350);
}

/**
 * Projeta um objeto de usuário removendo campos extras que possam ter vindo do banco.
 * Garante que apenas os campos definidos em AuthUser sejam retornados ao frontend.
 * @param user - Objeto de usuário bruto do cache
 * @returns AuthUser sem campos sensíveis extras
 */
function toAuthUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
}

/**
 * Retorna todos os usuários sem credenciais.
 */
export function getAllUsers(): AuthUser[] {
  return runtimeUsers.map(toAuthUser);
}

/**
 * Popula o cache de usuários a partir do banco de dados.
 * Re-executa se ainda não hidratado ou se o cache estiver vazio.
 */
export async function hydrateUsersFromDatabase(): Promise<void> {
  if (usersHydratedFromDb && runtimeUsers.length > 0) return;

  const usersFromDb = await fetchUsersFromDatabase();
  if (usersFromDb.length > 0) {
    runtimeUsers = usersFromDb;
    usersHydratedFromDb = true;
  }
  // Se retornou vazio (unauthenticated ou DB vazio), mantém flag false
  // para tentar novamente após login.
}

/**
 * Autentica o usuário via backend (bcrypt server-side).
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string } | { error: string }> {
  return authenticateWithDatabase(email, password);
}

/**
 * Busca usuário por ID no cache local (após autenticação).
 */
export function getUserById(userId: string): AuthUser | null {
  const user = runtimeUsers.find((u) => u.id === userId);
  if (!user || !user.active) return null;
  return toAuthUser(user);
}

/**
 * Cria novo usuário via backend (senha é hasheada server-side com bcrypt).
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: AppRole
): Promise<{ user: AuthUser } | { error: string }> {
  const result = await createUserInDatabase(name, email, password, role);
  if ('error' in result) return result;

  // Atualiza cache local sem armazenar senha.
  runtimeUsers.push(result.user);
  return result;
}

/**
 * Atualiza dados do usuário (sem senha) no cache local e enfileira sincronização com o banco.
 * Valida unicidade de e-mail antes de aplicar a alteração.
 * @param userId - ID do usuário a atualizar
 * @param data - Campos a atualizar (nome, e-mail e/ou cargo)
 * @returns O usuário atualizado ou um objeto de erro
 */
export function updateUser(
  userId: string,
  data: { name?: string; email?: string; role?: AppRole }
): { user: AuthUser } | { error: string } {
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return { error: 'Usuário não encontrado.' };

  const nextEmail = data.email?.toLowerCase();
  if (nextEmail && nextEmail !== runtimeUsers[idx].email.toLowerCase()) {
    // Garante que o novo e-mail não conflite com outro usuário existente.
    const existing = runtimeUsers.find((u) => u.email.toLowerCase() === nextEmail && u.id !== userId);
    if (existing) return { error: 'Já existe um usuário com este e-mail.' };
  }

  if (data.name) runtimeUsers[idx].name = data.name;
  if (data.email) runtimeUsers[idx].email = data.email;
  if (data.role) runtimeUsers[idx].role = data.role;

  queueUsersSync();
  return { user: toAuthUser(runtimeUsers[idx]) };
}

/**
 * Remove usuário.
 */
export function deleteUser(userId: string): boolean {
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  runtimeUsers.splice(idx, 1);
  queueUsersSync();
  return true;
}

/**
 * Atualiza role do usuário.
 */
export function updateUserRole(userId: string, newRole: AppRole): boolean {
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  runtimeUsers[idx].role = newRole;
  queueUsersSync();
  return true;
}

/**
 * Alterna status ativo/inativo.
 */
export function toggleUserActive(userId: string): boolean {
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  runtimeUsers[idx].active = !runtimeUsers[idx].active;
  queueUsersSync();
  return true;
}

/**
 * Redefine senha via backend (bcrypt server-side).
 */
export async function resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
  return resetUserPasswordInDatabase(userId, newPassword);
}
