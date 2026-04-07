/**
 * Criptografia de dados financeiros.
 *
 * A criptografia real acontece no servidor (AES-256-GCM via SQLITE_DATA_KEY),
 * que é uma chave privada gerenciada pelo backend.
 *
 * As funções abaixo são pass-through — o frontend não deve criptografar
 * com chave estática pública (VITE_*), pois qualquer usuário pode inspecioná-la.
 * Todos os dados são transmitidos via HTTPS e criptografados em repouso pelo backend.
 */

export async function encryptFinancialData(plainText: string): Promise<string> {
  return plainText;
}

export async function decryptFinancialData(cipherText: string): Promise<string> {
  return cipherText;
}
