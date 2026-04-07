/**
 * Contexto global de tema visual (dark / light).
 * O tema escolhido é persistido no localStorage e aplicado como classe CSS
 * no elemento raiz do documento, ativando as variáveis CSS de cada paleta.
 */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'crm_theme';
interface ThemeProviderProps {
  children: ReactNode;
}
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {

      // localStorage not available
    }return 'dark';
  });
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage indisponível (ex: iframe sandboxed)
    }
  }, [theme]);
  /** Alterna entre dark e light. */
  const toggleTheme = () => {
    setThemeState((prev) => prev === 'dark' ? 'light' : 'dark');
  };

  /**
   * Define o tema explicitamente.
   * @param newTheme - 'dark' ou 'light'
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme
      }}>
      
      {children}
    </ThemeContext.Provider>);

}
/**
 * Hook para consumir o contexto de tema.
 * Deve ser usado dentro de um `ThemeProvider`.
 * @returns { theme, toggleTheme, setTheme }
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}