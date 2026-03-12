const SENSITIVE_KEYS = new Set([
  'cpf',
  'cnpj',
  'cpfcnpj',
  'email',
  'phone',
  'whatsapp',
  'cardnumber',
  'card_number',
  'balance',
  'saldo',
  'transactions',
  'password',
  'token'
]);

export function maskEmail(email?: string): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export function maskPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return phone;
  const prefix = digits.slice(0, 2);
  const suffix = digits.slice(-2);
  return `(${prefix}) *****-**${suffix}`;
}

export function maskDocument(document?: string): string {
  if (!document) return '';
  const digits = document.replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length);
  const suffix = digits.slice(-4);
  return `***.***.***-${suffix}`;
}

export function maskCardNumber(cardNumber?: string): string {
  if (!cardNumber) return '';
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 8) return '****';
  const first = digits.slice(0, 4);
  const last = digits.slice(-4);
  return `${first} **** **** ${last}`;
}

export function maskPersonName(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 2)}***`;
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 2)}*** ${last.slice(0, 1)}***`;
}

function shouldSanitizeKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

export function sanitizeApiPayload<T>(payload: T): T {
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeApiPayload(item)) as T;
  }
  if (payload && typeof payload === 'object') {
    const sanitized: Record<string, unknown> = {};
    Object.entries(payload as Record<string, unknown>).forEach(([k, v]) => {
      if (shouldSanitizeKey(k)) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = sanitizeApiPayload(v);
      }
    });
    return sanitized as T;
  }
  return payload;
}
