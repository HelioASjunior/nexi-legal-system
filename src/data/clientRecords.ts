/**
 * Registros de clientes de demonstração (seed data).
 * Usados como estado inicial do DataContext quando o banco de dados está vazio
 * ou quando não há registros de clientes persistidos.
 * Todos os dados são fictícios e anonimizados — não representam pessoas reais.
 */
import { ClientRecord } from '../types';

export const mockClientRecords: ClientRecord[] = [
  {
    id: 'demo-client-1',
    name: 'Cliente Demo Alfa',
    cpf: 'CPF-DEMO-0001',
    rg: 'RG-DEMO-0001',
    birthDate: '1990-01-10',
    maritalStatus: 'solteiro',
    profession: 'Profissional Liberal',
    phone: '550000000001',
    whatsapp: '550000000001',
    email: 'cliente.alfa@demo.local',
    motherName: 'Pessoa Demo A',
    cep: '00000-000',
    street: 'Rua Exemplo',
    number: '100',
    neighborhood: 'Centro',
    city: 'Cidade Demo',
    state: 'GO',
    observations: 'Registro de demonstracao anonimizado.',
    status: 'ativo',
    createdBy: 'seed-demo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'demo-client-2',
    name: 'Empresa Demo Beta LTDA',
    cpf: 'CNPJ-DEMO-0001',
    birthDate: '2005-06-15',
    phone: '550000000002',
    whatsapp: '550000000002',
    email: 'contato.beta@demo.local',
    street: 'Avenida Modelo',
    number: '245',
    neighborhood: 'Setor Norte',
    city: 'Cidade Demo',
    state: 'GO',
    observations: 'Dados ficticios para ambiente de demonstracao.',
    status: 'ativo',
    createdBy: 'seed-demo',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z'
  },
  {
    id: 'demo-client-3',
    name: 'Cliente Demo Gama',
    cpf: 'CPF-DEMO-0002',
    birthDate: '1988-09-22',
    maritalStatus: 'casado',
    profession: 'Analista',
    phone: '550000000003',
    whatsapp: '550000000003',
    email: 'cliente.gama@demo.local',
    street: 'Travessa Ficticia',
    number: '52',
    neighborhood: 'Bairro Sul',
    city: 'Cidade Demo',
    state: 'GO',
    status: 'ativo',
    createdBy: 'seed-demo',
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z'
  }
];