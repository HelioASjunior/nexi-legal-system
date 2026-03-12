import { AuthUser, AppRole } from '../types';

// Passwords are encoded to avoid plaintext exposure in source code
// In production, use bcrypt/argon2 server-side
const _d = (s: string): string => {
  try {
    return atob(s);
  } catch {
    return '';
  }
};

interface StoredUser extends AuthUser {
  _k: string; // encoded credential
}

const initialUsers: StoredUser[] = [
{
  id: 'user-1',
  name: 'Dr. Ricardo Mendes',
  email: 'Admin',
  role: 'administrador',
  active: true,
  _k: 'eGlub3FzMTg=',
  createdAt: '2024-01-01'
},
{
  id: 'user-2',
  name: 'Dra. Camila Souza',
  email: 'camila@escritorio.com',
  role: 'advogado_total',
  active: true,
  _k: 'Y2FtaWxhMTIz',
  createdAt: '2024-01-15'
},
{
  id: 'user-3',
  name: 'Dr. Fernando Lima',
  email: 'fernando@escritorio.com',
  role: 'advogado_senior',
  active: true,
  _k: 'ZmVybmFuZG8xMjM=',
  createdAt: '2024-02-01'
},
{
  id: 'user-4',
  name: 'Dra. Juliana Costa',
  email: 'juliana@escritorio.com',
  role: 'advogado_junior',
  active: true,
  _k: 'anVsaWFuYTEyMw==',
  createdAt: '2024-02-15'
},
{
  id: 'user-5',
  name: 'Ana Beatriz Santos',
  email: 'ana@escritorio.com',
  role: 'atendente',
  active: true,
  _k: 'YW5hMTIz',
  createdAt: '2024-03-01'
},
{
  id: 'user-6',
  name: 'Carlos Pereira',
  email: 'carlos@escritorio.com',
  role: 'atendente',
  active: false,
  _k: 'Y2FybG9zMTIz',
  createdAt: '2024-03-15'
}];


// Runtime user store (allows adding users at runtime)
const USERS_STORAGE_KEY = 'crm_users_store';

function loadUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {

    /* ignore */}
  return [...initialUsers];
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Initialize on first load
let runtimeUsers: StoredUser[] = loadUsers();

/**
 * Get all users (without credentials)
 */
export function getAllUsers(): AuthUser[] {
  runtimeUsers = loadUsers();
  return runtimeUsers.map(({ _k, ...user }) => user);
}

/**
 * Authenticate user with email/login and password
 */
export function authenticateUser(
email: string,
password: string)
: {user: AuthUser;token: string;} | {error: string;} {
  runtimeUsers = loadUsers();
  const user = runtimeUsers.find(
    (u) =>
    u.email.toLowerCase() === email.toLowerCase() ||
    u.name.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return { error: 'Usuário não encontrado. Verifique suas credenciais.' };
  }

  if (!user.active) {
    return { error: 'Usuário inativo. Entre em contato com o administrador.' };
  }

  if (_d(user._k) !== password) {
    return { error: 'Senha incorreta. Tente novamente.' };
  }

  const token = `mock-jwt-${user.id}-${Date.now()}`;
  const { _k, ...userData } = user;
  return { user: userData, token };
}

/**
 * Get user by ID (for session restoration)
 */
export function getUserById(userId: string): AuthUser | null {
  runtimeUsers = loadUsers();
  const user = runtimeUsers.find((u) => u.id === userId);
  if (!user || !user.active) return null;
  const { _k, ...userData } = user;
  return userData;
}

/**
 * Create a new user (admin only)
 */
export function createUser(
name: string,
email: string,
password: string,
role: AppRole)
: {user: AuthUser;} | {error: string;} {
  runtimeUsers = loadUsers();

  // Check for duplicate email
  const existing = runtimeUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return { error: 'Já existe um usuário com este e-mail.' };
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    active: true,
    _k: btoa(password),
    createdAt: new Date().toISOString().split('T')[0]
  };

  runtimeUsers.push(newUser);
  saveUsers(runtimeUsers);

  const { _k, ...userData } = newUser;
  return { user: userData };
}

/**
 * Update user data (admin only)
 */
export function updateUser(
userId: string,
data: {name?: string;email?: string;role?: AppRole;})
: {user: AuthUser;} | {error: string;} {
  runtimeUsers = loadUsers();
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { error: 'Usuário não encontrado.' };
  }

  // Check for duplicate email if email is being changed
  if (
  data.email &&
  data.email.toLowerCase() !== runtimeUsers[idx].email.toLowerCase())
  {
    const existing = runtimeUsers.find(
      (u) =>
      u.email.toLowerCase() === data.email!.toLowerCase() && u.id !== userId
    );
    if (existing) {
      return { error: 'Já existe um usuário com este e-mail.' };
    }
  }

  if (data.name) runtimeUsers[idx].name = data.name;
  if (data.email) runtimeUsers[idx].email = data.email;
  if (data.role) runtimeUsers[idx].role = data.role;

  saveUsers(runtimeUsers);

  const { _k, ...userData } = runtimeUsers[idx];
  return { user: userData };
}

/**
 * Delete user (admin only)
 */
export function deleteUser(userId: string): boolean {
  runtimeUsers = loadUsers();
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  runtimeUsers.splice(idx, 1);
  saveUsers(runtimeUsers);
  return true;
}

/**
 * Update user role
 */
export function updateUserRole(userId: string, newRole: AppRole): boolean {
  runtimeUsers = loadUsers();
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  runtimeUsers[idx].role = newRole;
  saveUsers(runtimeUsers);
  return true;
}

/**
 * Toggle user active status
 */
export function toggleUserActive(userId: string): boolean {
  runtimeUsers = loadUsers();
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  runtimeUsers[idx].active = !runtimeUsers[idx].active;
  saveUsers(runtimeUsers);
  return true;
}

/**
 * Reset password (admin)
 */
export function resetUserPassword(
userId: string,
newPassword: string)
: boolean {
  runtimeUsers = loadUsers();
  const idx = runtimeUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  runtimeUsers[idx]._k = btoa(newPassword);
  saveUsers(runtimeUsers);
  return true;
}