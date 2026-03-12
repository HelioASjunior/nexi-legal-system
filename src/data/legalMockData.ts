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