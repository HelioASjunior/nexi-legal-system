import { Holiday } from '../types';

/**
 * Brazilian national holidays for 2024-2026
 * Can be extended with state/municipal holidays
 */
export const NATIONAL_HOLIDAYS: Holiday[] = [
// 2024
{ date: '2024-01-01', name: 'Confraternização Universal' },
{ date: '2024-02-12', name: 'Carnaval' },
{ date: '2024-02-13', name: 'Carnaval' },
{ date: '2024-03-29', name: 'Sexta-feira Santa' },
{ date: '2024-04-21', name: 'Tiradentes' },
{ date: '2024-05-01', name: 'Dia do Trabalho' },
{ date: '2024-05-30', name: 'Corpus Christi' },
{ date: '2024-09-07', name: 'Independência do Brasil' },
{ date: '2024-10-12', name: 'Nossa Senhora Aparecida' },
{ date: '2024-11-02', name: 'Finados' },
{ date: '2024-11-15', name: 'Proclamação da República' },
{ date: '2024-11-20', name: 'Consciência Negra' },
{ date: '2024-12-25', name: 'Natal' },
// 2025
{ date: '2025-01-01', name: 'Confraternização Universal' },
{ date: '2025-03-03', name: 'Carnaval' },
{ date: '2025-03-04', name: 'Carnaval' },
{ date: '2025-04-18', name: 'Sexta-feira Santa' },
{ date: '2025-04-21', name: 'Tiradentes' },
{ date: '2025-05-01', name: 'Dia do Trabalho' },
{ date: '2025-06-19', name: 'Corpus Christi' },
{ date: '2025-09-07', name: 'Independência do Brasil' },
{ date: '2025-10-12', name: 'Nossa Senhora Aparecida' },
{ date: '2025-11-02', name: 'Finados' },
{ date: '2025-11-15', name: 'Proclamação da República' },
{ date: '2025-11-20', name: 'Consciência Negra' },
{ date: '2025-12-25', name: 'Natal' },
// 2026
{ date: '2026-01-01', name: 'Confraternização Universal' },
{ date: '2026-02-16', name: 'Carnaval' },
{ date: '2026-02-17', name: 'Carnaval' },
{ date: '2026-04-03', name: 'Sexta-feira Santa' },
{ date: '2026-04-21', name: 'Tiradentes' },
{ date: '2026-05-01', name: 'Dia do Trabalho' },
{ date: '2026-06-04', name: 'Corpus Christi' },
{ date: '2026-09-07', name: 'Independência do Brasil' },
{ date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
{ date: '2026-11-02', name: 'Finados' },
{ date: '2026-11-15', name: 'Proclamação da República' },
{ date: '2026-11-20', name: 'Consciência Negra' },
{ date: '2026-12-25', name: 'Natal' }];


/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(
date: Date,
holidays: Holiday[] = NATIONAL_HOLIDAYS)
: boolean {
  const dateStr = formatDateToISO(date);
  return holidays.some((h) => h.date === dateStr);
}

/**
 * Check if a date is a business day (not weekend, not holiday)
 */
export function isBusinessDay(
date: Date,
holidays: Holiday[] = NATIONAL_HOLIDAYS)
: boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

/**
 * Format a Date to YYYY-MM-DD string
 */
export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculate a deadline by adding N business days to a start date
 * Skips weekends and holidays
 */
export function calculateDeadline(
startDate: Date,
businessDays: number,
holidays: Holiday[] = NATIONAL_HOLIDAYS)
: Date {
  let count = 0;
  const result = new Date(startDate);

  while (count < businessDays) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result, holidays)) {
      count++;
    }
  }

  return result;
}

/**
 * Calculate the alert date (N days before the deadline, counting only business days)
 */
export function calculateAlertDate(
deadlineDate: Date,
alertDaysBefore: number,
holidays: Holiday[] = NATIONAL_HOLIDAYS)
: Date {
  let count = 0;
  const result = new Date(deadlineDate);

  while (count < alertDaysBefore) {
    result.setDate(result.getDate() - 1);
    if (isBusinessDay(result, holidays)) {
      count++;
    }
  }

  return result;
}

/**
 * Count business days between two dates
 */
export function countBusinessDays(
startDate: Date,
endDate: Date,
holidays: Holiday[] = NATIONAL_HOLIDAYS)
: number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    if (isBusinessDay(current, holidays)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Get the holiday name for a given date, if it is a holiday
 */
export function getHolidayName(
date: Date,
holidays: Holiday[] = NATIONAL_HOLIDAYS)
: string | null {
  const dateStr = formatDateToISO(date);
  const holiday = holidays.find((h) => h.date === dateStr);
  return holiday ? holiday.name : null;
}

/**
 * Check if an event is overdue
 */
export function isEventOverdue(dateEnd: string, status: string): boolean {
  if (status === 'concluido') return false;
  const endDate = new Date(dateEnd + 'T23:59:59');
  return new Date() > endDate;
}

/**
 * Check if an event is urgent (within N business days)
 */
export function isEventUrgent(
dateEnd: string,
status: string,
urgentThresholdDays: number = 3,
holidays: Holiday[] = NATIONAL_HOLIDAYS)
: boolean {
  if (status === 'concluido') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(dateEnd);
  endDate.setHours(0, 0, 0, 0);

  if (endDate < today) return false; // already overdue, not urgent

  const daysRemaining = countBusinessDays(today, endDate, holidays);
  return daysRemaining <= urgentThresholdDays;
}

/**
 * Format date to Brazilian format DD/MM/YYYY
 */
export function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR');
}

/**
 * Format time HH:MM
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}