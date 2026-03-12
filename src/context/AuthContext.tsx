import React, { useEffect, useState, createContext, useContext } from 'react';
import { AuthUser } from '../types';
import { authenticateUser, getUserById } from '../data/authData';
import { saveSession, getStoredSession, clearSession } from '../utils/auth';
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
  email: string,
  password: string)
  => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => void;
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
    const session = getStoredSession();
    if (session) {
      const storedUser = getUserById(session.userId);
      if (storedUser) {
        setUser(storedUser);
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);
  const login = async (
  email: string,
  password: string)
  : Promise<{
    success: boolean;
    error?: string;
  }> => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const result = authenticateUser(email, password);
    if ('error' in result) {
      setIsLoading(false);
      return {
        success: false,
        error: result.error
      };
    }
    saveSession(result.user.id, result.token);
    setUser(result.user);
    setIsLoading(false);
    return {
      success: true
    };
  };
  const logout = () => {
    clearSession();
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}>
      
      {children}
    </AuthContext.Provider>);

}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}