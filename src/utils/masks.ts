/**
 * Funções de máscara e validação de campos de formulário brasileiros.
 * Usadas em inputs controlados para formatar CPF, telefone e CEP em tempo real.
 */

/**
 * Aplica máscara de CPF: 000.000.000-00
 * @param value - String de entrada (pode conter ou não dígitos)
 * @returns CPF formatado com pontos e hífen
 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits.
  replace(/(\d{3})(\d)/, '$1.$2').
  replace(/(\d{3})(\d)/, '$1.$2').
  replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Aplica máscara de telefone brasileiro: (00) 00000-0000 (celular) ou (00) 0000-0000 (fixo).
 * Detecta automaticamente o formato com base no comprimento dos dígitos.
 * @param value - String de entrada
 * @returns Telefone formatado
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
 * Aplica máscara de CEP: 00000-000
 * @param value - String de entrada
 * @returns CEP formatado
 */
export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Valida um CPF usando o algoritmo oficial da Receita Federal (dois dígitos verificadores).
 * Rejeita sequências trivialmente inválidas como "111.111.111-11".
 * @param cpf - CPF com ou sem máscara
 * @returns true se o CPF for matematicamente válido
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
 * Remove todos os caracteres não-numéricos de uma string mascarada.
 * Útil para persistir apenas os dígitos após o usuário preencher o campo.
 * @param value - String mascarada
 * @returns Apenas os dígitos da string
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}