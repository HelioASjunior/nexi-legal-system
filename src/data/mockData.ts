/**
 * Dados mock legados do módulo financeiro (ClientsPage original).
 * @deprecated Este arquivo é mantido apenas para compatibilidade com ClientsPage.tsx,
 * que foi substituído por NewClientsPage.tsx e não é mais renderizado pela aplicação.
 * Os dados reais trafegam pelo DataContext via SQLite.
 */
import { Client, CalendarNotice } from '../types';

export const mockClients: Client[] = [];

export const mockNotices: CalendarNotice[] = [];

export const chartData = {
  statusComposition: [],
  monthlyData: []
};