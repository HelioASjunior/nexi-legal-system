/**
 * CPF mask: 000.000.000-00
 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits.
  replace(/(\d{3})(\d)/, '$1.$2').
  replace(/(\d{3})(\d)/, '$1.$2').
  replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Phone mask: (00) 00000-0000 or (00) 0000-0000
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.
    replace(/(\d{2})(\d)/, '($1) $2').
    replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.
  replace(/(\d{2})(\d)/, '($1) $2').
  replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * CEP mask: 00000-000
 */
export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Validate CPF (Brazilian algorithm)
 */
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let remainder = 11 - sum % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  remainder = 11 - sum % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.charAt(10))) return false;

  return true;
}

/**
 * Remove mask characters
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}