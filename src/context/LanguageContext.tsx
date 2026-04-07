/**
 * Contexto global de internacionalização (i18n).
 * Suporta Português (pt) e Inglês (en). O idioma é persistido no localStorage
 * e aplicado via atributo `lang` no elemento raiz do documento.
 * Uso: `const { t } = useLanguage(); t('sidebar.dashboard')` → "Dashboard"
 * Fallback: se a chave não existir no idioma atual, retorna a versão em português;
 *           se também não existir em português, retorna a própria chave.
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from '../locales/en';
import { pt } from '../locales/pt';

export type Language = 'pt' | 'en';

type TranslationMap = typeof pt;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof TranslationMap | string) => string;
}

const LANGUAGE_STORAGE_KEY = 'crm_language';

const dictionaries: Record<Language, TranslationMap> = {
  pt,
  en,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'pt' || stored === 'en') {
        return stored;
      }
    } catch {
      // localStorage not available
    }

    return 'pt';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // localStorage not available
    }
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    const t = (key: keyof TranslationMap | string) => {
      const currentValue = dictionaries[language][key as keyof TranslationMap];
      if (currentValue) return currentValue;
      const fallbackValue = dictionaries.pt[key as keyof TranslationMap];
      return fallbackValue || key.toString();
    };

    return {
      language,
      setLanguage: setLanguageState,
      toggleLanguage: () => setLanguageState((current) => (current === 'pt' ? 'en' : 'pt')),
      t,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Hook para consumir o contexto de idioma.
 * Deve ser usado dentro de um `LanguageProvider`.
 * @returns { language, setLanguage, toggleLanguage, t }
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}