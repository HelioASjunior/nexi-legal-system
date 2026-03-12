import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  Client,
  ClientRecord,
  Attendance,
  LegalEvent,
  LegalClient,
  LegalProcess } from
'../types';
import { mockClientRecords } from '../data/clientRecords';
// localStorage keys
const STORAGE_KEYS = {
  financialClients: 'crm_financial_clients',
  clientRecords: 'crm_client_records',
  attendances: 'crm_attendances',
  legalEvents: 'crm_legal_events',
  legalClients: 'crm_legal_clients',
  legalProcesses: 'crm_legal_processes'
} as const;
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
// Generic localStorage hook
function useLocalStorage<T>(
key: string,
initialValue: T)
: [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {

      // localStorage not available or quota exceeded
    }}, [key, storedValue]);
  return [storedValue, setStoredValue];
}
interface DataProviderProps {
  children: ReactNode;
}
export function DataProvider({ children }: DataProviderProps) {
  const [financialClients, setFinancialClients] = useLocalStorage<Client[]>(
    STORAGE_KEYS.financialClients,
    []
  );
  const [clientRecords, setClientRecords] = useLocalStorage<ClientRecord[]>(
    STORAGE_KEYS.clientRecords,
    mockClientRecords
  );
  const [attendances, setAttendances] = useLocalStorage<Attendance[]>(
    STORAGE_KEYS.attendances,
    []
  );
  const [legalEvents, setLegalEvents] = useLocalStorage<LegalEvent[]>(
    STORAGE_KEYS.legalEvents,
    []
  );
  const [legalClients, setLegalClients] = useLocalStorage<LegalClient[]>(
    STORAGE_KEYS.legalClients,
    []
  );
  const [legalProcesses, setLegalProcesses] = useLocalStorage<LegalProcess[]>(
    STORAGE_KEYS.legalProcesses,
    []
  );
  useEffect(() => {
    if (clientRecords.length === 0 && mockClientRecords.length > 0) {
      setClientRecords(mockClientRecords);
    }
  }, [clientRecords.length, setClientRecords]);
  return (
    <DataContext.Provider
      value={{
        financialClients,
        setFinancialClients,
        clientRecords,
        setClientRecords,
        attendances,
        setAttendances,
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
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}