type RequiredEnv = {
  VITE_API_BASE_URL?: string;
  VITE_FINANCIAL_API_KEY?: string;
  VITE_FINANCIAL_CLIENT_ID?: string;
  VITE_VIA_CEP_API_BASE_URL?: string;
  VITE_SENSITIVE_ENCRYPTION_KEY?: string;
};

const env = import.meta.env as Record<string, string | boolean | undefined> &
RequiredEnv;

function getEnvVar(key: keyof RequiredEnv, fallback = ''): string {
  const value = env[key];
  if (!value) return fallback;
  return value;
}

export const appEnv = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', ''),
  financialApiKey: getEnvVar('VITE_FINANCIAL_API_KEY', ''),
  financialClientId: getEnvVar('VITE_FINANCIAL_CLIENT_ID', ''),
  viaCepBaseUrl: getEnvVar('VITE_VIA_CEP_API_BASE_URL', 'https://viacep.com.br/ws'),
  sensitiveEncryptionKey: getEnvVar('VITE_SENSITIVE_ENCRYPTION_KEY', '')
};

export function assertSensitiveEnv(): string[] {
  const missing: string[] = [];
  if (!appEnv.financialApiKey) missing.push('VITE_FINANCIAL_API_KEY');
  if (!appEnv.financialClientId) missing.push('VITE_FINANCIAL_CLIENT_ID');
  if (!appEnv.sensitiveEncryptionKey) missing.push('VITE_SENSITIVE_ENCRYPTION_KEY');
  return missing;
}
