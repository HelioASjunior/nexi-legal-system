/**
 * Configuração de variáveis de ambiente do frontend (Vite).
 * Expõe apenas variáveis VITE_* públicas — nenhuma chave sensível deve existir aqui.
 * Credenciais e chaves criptográficas pertencem exclusivamente ao backend (.env do servidor).
 */

type RequiredEnv = {
  VITE_API_BASE_URL?: string;
  VITE_VIA_CEP_API_BASE_URL?: string;
};

const env = import.meta.env as Record<string, string | boolean | undefined> & RequiredEnv;

function getEnvVar(key: keyof RequiredEnv, fallback = ''): string {
  const value = env[key];
  if (!value) return fallback;
  return String(value);
}

export const appEnv = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', ''),
  viaCepBaseUrl: getEnvVar('VITE_VIA_CEP_API_BASE_URL', 'https://viacep.com.br/ws'),
};

/**
 * Valida variáveis obrigatórias de ambiente.
 * Credenciais financeiras e chaves criptográficas NÃO devem existir no frontend —
 * pertencem exclusivamente ao backend (.env do servidor).
 */
export function assertSensitiveEnv(): string[] {
  return []; // Nenhuma chave sensível deve estar no bundle do frontend.
}
