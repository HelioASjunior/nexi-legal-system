/**
 * Contexto global de dados da aplicação.
 * Centraliza e sincroniza todos os estados mutáveis: clientes, atendimentos,
 * movimentos financeiros, eventos do calendário e processos jurídicos.
 *
 * Fluxo de dados:
 *   1. Ao autenticar, hidrata o estado a partir do SQLite via API REST.
 *   2. Qualquer alteração de estado aciona um debounce de 400ms que persiste
 *      os novos valores de volta ao banco de dados.
 *   3. Clientes são gerenciados por endpoint dedicado (`/api/clients`);
 *      os demais dados trafegam pelo endpoint de estado geral (`/api/state`).
 */
/* eslint-disable react-refresh/only-export-components */
import {
  useEffect,
  useState,
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useAuth } from './AuthContext';
import {
  Client,
  ClientRecord,
  Attendance,
  LegalEvent,
  LegalClient,
  LegalProcess,
  FinancialMovement } from
'../types';
import { mockClientRecords } from '../data/clientRecords';
import {
  fetchAppStateFromDatabase,
  fetchClientsFromDatabase,
  syncAppStateToDatabase,
  syncClientsToDatabase,
} from '../services/sqliteApi';
interface DataContextType {
  // Financial Clients (Financeiro page)
  financialClients: Client[];
  setFinancialClients: Dispatch<SetStateAction<Client[]>>;
  // Client Records (Clientes page)
  clientRecords: ClientRecord[];
  setClientRecords: Dispatch<SetStateAction<ClientRecord[]>>;
  // Attendances (Atendimentos page)
  attendances: Attendance[];
  setAttendances: Dispatch<SetStateAction<Attendance[]>>;
  // Financial movements (Financeiro page)
  financialMovements: FinancialMovement[];
  setFinancialMovements: Dispatch<SetStateAction<FinancialMovement[]>>;
  // Legal Events (Calendar)
  legalEvents: LegalEvent[];
  setLegalEvents: Dispatch<SetStateAction<LegalEvent[]>>;
  // Legal Clients
  legalClients: LegalClient[];
  setLegalClients: Dispatch<SetStateAction<LegalClient[]>>;
  // Legal Processes
  legalProcesses: LegalProcess[];
  setLegalProcesses: Dispatch<SetStateAction<LegalProcess[]>>;
}
const DataContext = createContext<DataContextType | undefined>(undefined);
interface DataProviderProps {
  children: ReactNode;
}
export function DataProvider({ children }: DataProviderProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [financialClients, setFinancialClients] = useState<Client[]>([]);
  const [clientRecords, setClientRecords] = useState<ClientRecord[]>(mockClientRecords);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [financialMovements, setFinancialMovements] = useState<FinancialMovement[]>([]);
  const [legalEvents, setLegalEvents] = useState<LegalEvent[]>([]);
  const [legalClients, setLegalClients] = useState<LegalClient[]>([]);
  const [legalProcesses, setLegalProcesses] = useState<LegalProcess[]>([]);
  const [stateHydratedFromDb, setStateHydratedFromDb] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setStateHydratedFromDb(false);
      return;
    }

    const hydrateFromDatabase = async () => {
      const stateFromDb = await fetchAppStateFromDatabase();
      const hasStateFromDb = Object.keys(stateFromDb).length > 0;

      if (Array.isArray(stateFromDb.financialClients)) {
        setFinancialClients(stateFromDb.financialClients);
      }
      if (Array.isArray(stateFromDb.attendances)) {
        setAttendances(stateFromDb.attendances);
      }
      if (Array.isArray(stateFromDb.financialMovements)) {
        setFinancialMovements(stateFromDb.financialMovements);
      }
      if (Array.isArray(stateFromDb.legalEvents)) {
        setLegalEvents(stateFromDb.legalEvents);
      }
      if (Array.isArray(stateFromDb.legalClients)) {
        setLegalClients(stateFromDb.legalClients);
      }
      if (Array.isArray(stateFromDb.legalProcesses)) {
        setLegalProcesses(stateFromDb.legalProcesses);
      }

      const clientsFromDb = await fetchClientsFromDatabase();
      if (clientsFromDb.length > 0) {
        setClientRecords(clientsFromDb);
      } else if (clientRecords.length > 0) {
        await syncClientsToDatabase(clientRecords, true);
      }

      if (!hasStateFromDb) {
        await syncAppStateToDatabase({
          financialClients,
          attendances,
          financialMovements,
          legalEvents,
          legalClients,
          legalProcesses,
        });
      }

      setStateHydratedFromDb(true);
    };

    void hydrateFromDatabase();
  }, [isAuthenticated, isLoading]);
  useEffect(() => {
    if (clientRecords.length === 0 && mockClientRecords.length > 0) {
      setClientRecords(mockClientRecords);
    }
  }, [clientRecords.length, setClientRecords]);

  useEffect(() => {
    if (!isAuthenticated || !stateHydratedFromDb) return;
    const timer = window.setTimeout(() => {
      void syncClientsToDatabase(clientRecords, true);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [clientRecords, stateHydratedFromDb, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !stateHydratedFromDb) return;
    const timer = window.setTimeout(() => {
      void syncAppStateToDatabase({
        financialClients,
        attendances,
        financialMovements,
        legalEvents,
        legalClients,
        legalProcesses,
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [
    financialClients,
    attendances,
    financialMovements,
    legalEvents,
    legalClients,
    legalProcesses,
    stateHydratedFromDb,
    isAuthenticated,
  ]);
  return (
    <DataContext.Provider
      value={{
        financialClients,
        setFinancialClients,
        clientRecords,
        setClientRecords,
        attendances,
        setAttendances,
        financialMovements,
        setFinancialMovements,
        legalEvents,
        setLegalEvents,
        legalClients,
        setLegalClients,
        legalProcesses,
        setLegalProcesses
      }}>
      
      {children}
    </DataContext.Provider>);

}
/**
 * Hook para consumir o contexto de dados da aplicação.
 * Deve ser usado dentro de um `DataProvider`.
 * @returns Todos os estados e setters: clientRecords, attendances, financialMovements, etc.
 */
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}