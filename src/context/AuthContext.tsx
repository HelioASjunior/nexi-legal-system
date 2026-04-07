/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { AuthUser } from '../types';
import { authenticateUser, getUserById, hydrateUsersFromDatabase, resetUserHydration } from '../data/authData';
import { saveSession, getStoredSession, clearSession, hydrateAuthMetaFromDatabase } from '../utils/auth';
import { setApiAuthToken, logoutFromDatabase } from '../services/sqliteApi';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const bootstrap = async () => {
      // 1. Restaura token do sessionStorage ANTES de qualquer chamada à API,
      //    para que as chamadas seguintes sejam autenticadas.
      const session = getStoredSession();
      if (session) {
        setApiAuthToken(session.token);
      }

      // 2. Busca dados (usuários e estado) — já autenticados se token disponível.
      await hydrateUsersFromDatabase();
      await hydrateAuthMetaFromDatabase();

      // 3. Resolve usuário da sessão restaurada.
      const freshSession = getStoredSession();
      if (freshSession) {
        const storedUser = getUserById(freshSession.userId);
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Token válido localmente mas usuário não encontrado no DB — limpa.
          setApiAuthToken(null);
          await clearSession();
        }
      }

      setIsLoading(false);
    };
    void bootstrap();
  }, []);

  /**
   * Autentica o usuário via backend (bcrypt server-side).
   * Em caso de sucesso, persiste o token JWT e hidrata o cache de usuários.
   * @param email - E-mail do usuário
   * @param password - Senha em texto plano (transmitida via HTTPS; hash feito no servidor)
   * @returns `{ success: true }` ou `{ success: false, error: mensagem }`
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simula latência de rede mínima para feedback visual.
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = await authenticateUser(email, password);
    if ('error' in result) {
      setIsLoading(false);
      return { success: false, error: result.error };
    }

    setApiAuthToken(result.token);
    await saveSession(result.user.id, result.token);

    // Hidrata cache de usuários com o token recém-obtido.
    await hydrateUsersFromDatabase();

    setUser(result.user);
    setIsLoading(false);
    return { success: true };
  };

  /**
   * Encerra a sessão do usuário: invalida o token no servidor, limpa o estado local
   * e reseta o cache de usuários para forçar novo fetch no próximo login.
   */
  const logout = async (): Promise<void> => {
    // Invalida token no servidor antes de limpar localmente.
    await logoutFromDatabase();
    setApiAuthToken(null);
    await clearSession();
    resetUserHydration();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para consumir o contexto de autenticação.
 * Deve ser usado dentro de um `AuthProvider`.
 * @returns { user, isAuthenticated, isLoading, login, logout }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
