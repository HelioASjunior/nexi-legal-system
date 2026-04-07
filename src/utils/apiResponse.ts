/**
 * Construtores de resposta padronizada para logs internos e comunicação entre módulos.
 * Todos os payloads são sanitizados via `sanitizeApiPayload` antes de serem retornados,
 * evitando exposição acidental de dados sensíveis em logs de console.
 */
import { sanitizeApiPayload } from './dataProtection';

/**
 * Constrói um envelope de resposta de sucesso sanitizado.
 * @param data - Dados a incluir na resposta (campos sensíveis serão redigidos)
 * @returns Objeto com ok: true, data sanitizado e timestamp de geração
 */
export function buildSafeApiResponse<T>(data: T) {
  return {
    ok: true,
    data: sanitizeApiPayload(data),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Constrói um envelope de resposta de erro padronizado.
 * @param message - Mensagem de erro legível pelo usuário
 * @param status - Código HTTP associado ao erro (padrão: 500)
 * @returns Objeto com ok: false, status, mensagem e timestamp
 */
export function buildSafeApiError(message: string, status = 500) {
  return {
    ok: false,
    status,
    error: message,
    generatedAt: new Date().toISOString()
  };
}
