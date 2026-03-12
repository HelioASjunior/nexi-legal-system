import React, { useEffect, useState, createContext, useContext } from 'react';
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
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {

      // localStorage not available
    }}, [theme]);
  const toggleTheme = () => {
    setThemeState((prev) => prev === 'dark' ? 'light' : 'dark');
  };
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
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}