import { appEnv } from '../config/env';

async function importAesKey(secret: string): Promise<CryptoKey> {
  const normalized = secret.padEnd(32, '0').slice(0, 32);
  const keyData = new TextEncoder().encode(normalized);
  return crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptFinancialData(plainText: string): Promise<string> {
  if (!appEnv.sensitiveEncryptionKey) {
    throw new Error('VITE_SENSITIVE_ENCRYPTION_KEY não configurada');
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importAesKey(appEnv.sensitiveEncryptionKey);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plainText)
  );

  const out = new Uint8Array(iv.length + encrypted.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...out));
}

export async function decryptFinancialData(cipherText: string): Promise<string> {
  if (!appEnv.sensitiveEncryptionKey) {
    throw new Error('VITE_SENSITIVE_ENCRYPTION_KEY não configurada');
  }
  const bytes = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  const key = await importAesKey(appEnv.sensitiveEncryptionKey);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}

// Recomendacao para backend/banco: use libsodium ou AWS KMS/HSM com rotacao de chaves.
