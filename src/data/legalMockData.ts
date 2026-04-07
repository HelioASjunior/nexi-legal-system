/**
 * Dados mock do módulo jurídico (calendário, processos, clientes legais).
 *
 * `mockLegalUsers` — 4 usuários de demonstração usados em cenários de teste.
 *
 * `mockLegalClients` / `mockLegalProcesses` / `mockLegalEvents` — arrays vazios mantidos
 * para compatibilidade com componentes do calendário que ainda os referenciam
 * (CalendarDayView, CalendarListView, EventDetailPanel).
 * TODO: esses componentes devem migrar para `useData().legalClients` / `.legalProcesses`
 * para exibir dados reais persistidos no banco.
 */
import { LegalEvent, LegalUser, LegalClient, LegalProcess } from '../types';

export const mockLegalUsers: LegalUser[] = [
{
  id: 'u1',
  name: 'Dr. Ricardo Mendes',
  email: 'ricardo@escritorio.com',
  role: 'admin'
},
{
  id: 'u2',
  name: 'Dra. Camila Souza',
  email: 'camila@escritorio.com',
  role: 'usuario'
},
{
  id: 'u3',
  name: 'Dr. Fernando Lima',
  email: 'fernando@escritorio.com',
  role: 'usuario'
},
{
  id: 'u4',
  name: 'Dra. Juliana Costa',
  email: 'juliana@escritorio.com',
  role: 'admin'
}];


export const mockLegalClients: LegalClient[] = [];

export const mockLegalProcesses: LegalProcess[] = [];

export const mockLegalEvents: LegalEvent[] = [];