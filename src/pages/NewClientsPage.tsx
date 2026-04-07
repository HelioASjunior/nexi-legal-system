import React, { useMemo, useState, useRef } from 'react';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  XIcon,
  DownloadIcon,
  UploadIcon,
  FileTextIcon } from
'lucide-react';
import { ClientRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { hasPermission } from '../utils/auth';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import { ClientDetailPanel } from '../components/clients/ClientDetailPanel';
import * as XLSX from 'xlsx';
const ITEMS_PER_PAGE = 10;
const statusOptions = [
{
  value: '',
  label: 'Todos os status'
},
{
  value: 'ativo',
  label: 'Ativo'
},
{
  value: 'inativo',
  label: 'Inativo'
}];

const stateOptions = [
{
  value: '',
  label: 'Todos os estados'
},
{
  value: 'SP',
  label: 'São Paulo'
},
{
  value: 'RJ',
  label: 'Rio de Janeiro'
},
{
  value: 'MG',
  label: 'Minas Gerais'
},
{
  value: 'PR',
  label: 'Paraná'
},
{
  value: 'RS',
  label: 'Rio Grande do Sul'
},
{
  value: 'BA',
  label: 'Bahia'
},
{
  value: 'SC',
  label: 'Santa Catarina'
},
{
  value: 'GO',
  label: 'Goiás'
},
{
  value: 'PE',
  label: 'Pernambuco'
},
{
  value: 'CE',
  label: 'Ceará'
}];

type MaritalStatus = 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';

export function NewClientsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { clientRecords, setClientRecords } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterState, setFilterState] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(
    null
  );
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
  } | null>(null);
  const canCreate = user ? hasPermission(user.role, 'clients.create') : false;
  const canEdit = user ? hasPermission(user.role, 'clients.edit') : false;
  const canDelete = user ? hasPermission(user.role, 'clients.delete') : false;
  const normalizeText = (value: string) => {
    return value.
    normalize('NFD').
    replace(/[\u0300-\u036f]/g, '').
    toLowerCase().
    trim();
  };
  const parseMaritalStatus = (value: string): MaritalStatus | undefined => {
    const normalized = normalizeText(value);
    if (normalized === 'solteiro') return 'solteiro';
    if (normalized === 'casado') return 'casado';
    if (normalized === 'divorciado') return 'divorciado';
    if (normalized === 'viuvo') return 'viuvo';
    if (normalized === 'uniaoestavel') return 'uniao_estavel';
    return undefined;
  };
  const filteredClients = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const searchDigits = searchTerm.replace(/\D/g, '');
    return clientRecords.filter((client) => {
      if (client.deletedAt) return false;
      if (normalizedSearch || searchDigits) {
        const normalizedClientName = normalizeText(client.name);
        const matchesName = normalizedSearch ?
        normalizedClientName.includes(normalizedSearch) :
        false;
        const matchesCPF = searchDigits ?
        client.cpf.
        replace(/\D/g, '').
        includes(searchDigits) :
        false;
        if (!matchesName && !matchesCPF) return false;
      }
      if (filterStatus && client.status !== filterStatus) return false;
      if (filterState && client.state !== filterState) return false;
      return true;
    });
  }, [clientRecords, searchTerm, filterStatus, filterState]);
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterState('');
    setCurrentPage(1);
  };
  const hasActiveFilters = searchTerm || filterStatus || filterState;
  const handleSaveClient = (
  clientData: Omit<
    ClientRecord,
    'id' | 'createdAt' | 'updatedAt' | 'createdBy'> &
  {
    id?: string;
  }) =>
  {
    const now = new Date().toISOString();
    if (clientData.id) {
      setClientRecords((prev) =>
      prev.map((c) =>
      c.id === clientData.id ?
      {
        ...c,
        ...clientData,
        updatedAt: now
      } :
      c
      )
      );
    } else {
      const newClient: ClientRecord = {
        ...clientData,
        id: `cr-${Date.now()}`,
        createdBy: user?.id || 'unknown',
        createdAt: now,
        updatedAt: now
      } as ClientRecord;
      setClientRecords((prev) => [newClient, ...prev]);
    }
    setEditingClient(null);
  };
  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza que deseja desativar este cliente?')) {
      const now = new Date().toISOString();
      setClientRecords((prev) =>
      prev.map((c) =>
      c.id === clientId ?
      {
        ...c,
        status: 'inativo' as const,
        deletedAt: now,
        updatedAt: now
      } :
      c
      )
      );
      setIsDetailPanelOpen(false);
      setSelectedClient(null);
    }
  };
  const handleViewClient = (client: ClientRecord) => {
    setSelectedClient(client);
    setIsDetailPanelOpen(true);
  };
  const handleEditClient = (client: ClientRecord) => {
    setEditingClient(client);
    setIsFormModalOpen(true);
    setIsDetailPanelOpen(false);
  };
  const handleExportCSV = () => {
    const headers = [
    'name',
    'cpf',
    'rg',
    'birthDate',
    'maritalStatus',
    'profession',
    'phone',
    'whatsapp',
    'email',
    'motherName',
    'cep',
    'street',
    'number',
    'complement',
    'neighborhood',
    'city',
    'state',
    'observations'];

    const csvContent = [
    headers.join(','),
    ...filteredClients.map((c) =>
    headers.
    map((h) => {
      const value = c[h as keyof ClientRecord] || '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).
    join(',')
    )].
    join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleExportPDF = () => {
    const reportContent = `
================================================================================
                           RELATÓRIO DE CLIENTES
================================================================================
Data de Geração: ${new Date().toLocaleString('pt-BR')}
Total de Clientes: ${filteredClients.length}
================================================================================

${filteredClients.
    map(
      (c, i) => `
--- Cliente ${i + 1} ---
Nome: ${c.name}
CPF: ${c.cpf}
RG: ${c.rg || 'N/A'}
Telefone: ${c.phone || 'N/A'}
E-mail: ${c.email || 'N/A'}
Cidade/UF: ${c.city}/${c.state}
Status: ${c.status === 'ativo' ? 'Ativo' : 'Inativo'}
--------------------------------------------------------------------------------`
    ).
    join('\n')}
`;
    const blob = new Blob([reportContent], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const normalizeHeader = (value: string): string => {
    return value.
    normalize('NFD').
    replace(/[\u0300-\u036f]/g, '').
    toLowerCase().
    replace(/[^a-z0-9]/g, '');
  };
  const parseCSVRows = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => normalizeHeader(h.replace(/"/g, '').trim()));
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of lines[i]) {
        if (char === '"') inQuotes = !inQuotes;else
        if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.replace(/"/g, '') || '';
      });
      rows.push(row);
    }
    return rows;
  };
  const parseXLSXRows = async (file: File): Promise<Record<string, string>[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: ''
    });
    return rawRows.map((raw) => {
      const normalized: Record<string, string> = {};
      Object.entries(raw).forEach(([key, value]) => {
        normalized[normalizeHeader(String(key))] = String(value ?? '').trim();
      });
      return normalized;
    });
  };
  const getValueByAliases = (
  row: Record<string, string>,
  aliases: string[])
  : string => {
    for (const alias of aliases) {
      const value = row[alias];
      if (value && value.trim()) return value.trim();
    }
    return '';
  };
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const aliasMap: Record<string, string[]> = {
      name: ['name', 'nome', 'cliente', 'contato'],
      cpf: ['cpf', 'cpfcnpj', 'cpf_cnpj', 'documento', 'document'],
      rg: ['rg'],
      birthDate: ['birthdate', 'datanascimento', 'nascimento'],
      maritalStatus: ['maritalstatus', 'estadocivil'],
      profession: ['profession', 'profissao'],
      phone: ['phone', 'telefone', 'tel', 'celular'],
      whatsapp: ['whatsapp', 'zap'],
      email: ['email', 'e-mail'],
      motherName: ['mothername', 'nomedamae', 'mae'],
      cep: ['cep'],
      street: ['street', 'logradouro', 'endereco', 'rua'],
      number: ['number', 'numero'],
      complement: ['complement', 'complemento'],
      neighborhood: ['neighborhood', 'bairro'],
      city: ['city', 'cidade', 'municipio'],
      state: ['state', 'uf', 'estado'],
      observations: ['observations', 'observacao', 'observacoes']
    };
    try {
      let rows: Record<string, string>[] = [];
      if (extension === 'csv') {
        const text = await file.text();
        rows = parseCSVRows(text);
      } else if (extension === 'xlsx' || extension === 'xls') {
        rows = await parseXLSXRows(file);
      } else {
        setImportResult({
          success: 0,
          errors: 1
        });
        setTimeout(() => setImportResult(null), 5000);
        return;
      }
      if (rows.length === 0) {
        setImportResult({
          success: 0,
          errors: 0
        });
        return;
      }
      let success = 0;
      let errors = 0;
      const now = new Date().toISOString();
      const newClients: ClientRecord[] = [];
      rows.forEach((row, index) => {
        try {
          const name = getValueByAliases(row, aliasMap.name);
          if (!name) {
            errors++;
            return;
          }
          const phone = getValueByAliases(row, aliasMap.phone);
          const whatsapp =
          getValueByAliases(row, aliasMap.whatsapp) ||
          phone ||
          undefined;
          const state = (getValueByAliases(row, aliasMap.state) || 'NI').
          toUpperCase().
          slice(0, 2);
          const statusValue =
          getValueByAliases(row, ['status']) === 'inativo' ?
          'inativo' :
          'ativo';
          const maritalStatus = parseMaritalStatus(
            getValueByAliases(row, aliasMap.maritalStatus)
          );
          const newClient: ClientRecord = {
            id: `cr-import-${Date.now()}-${index}`,
            name,
            cpf: getValueByAliases(row, aliasMap.cpf),
            rg: getValueByAliases(row, aliasMap.rg) || undefined,
            birthDate: getValueByAliases(row, aliasMap.birthDate) || undefined,
            maritalStatus,
            profession: getValueByAliases(row, aliasMap.profession) || undefined,
            phone: phone || undefined,
            whatsapp,
            email: getValueByAliases(row, aliasMap.email) || undefined,
            motherName: getValueByAliases(row, aliasMap.motherName) || undefined,
            cep: getValueByAliases(row, aliasMap.cep) || undefined,
            street: getValueByAliases(row, aliasMap.street) || 'Não informado',
            number: getValueByAliases(row, aliasMap.number) || 'S/N',
            complement: getValueByAliases(row, aliasMap.complement) || undefined,
            neighborhood:
            getValueByAliases(row, aliasMap.neighborhood) || 'Não informado',
            city: getValueByAliases(row, aliasMap.city) || 'Não informado',
            state,
            observations: getValueByAliases(row, aliasMap.observations) || undefined,
            status: statusValue,
            createdBy: user?.id || 'import',
            createdAt: now,
            updatedAt: now
          };
          newClients.push(newClient);
          success++;
        } catch {
          errors++;
        }
      });
      setClientRecords((prev) => [...newClients, ...prev]);
      setImportResult({
        success,
        errors
      });
      setTimeout(() => setImportResult(null), 5000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-1">
            Clientes
          </h1>
          <p className="text-[var(--text-secondary)]">
            {filteredClients.length} cliente
            {filteredClients.length !== 1 ? 's' : ''} encontrado
            {filteredClients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              icon={<DownloadIcon className="w-4 h-4" />}
              onClick={handleExportCSV}>
              
              CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<FileTextIcon className="w-4 h-4" />}
              onClick={handleExportPDF}>
              
              PDF
            </Button>
            <label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportCSV}
                className="hidden" />
              
              <Button
                variant="secondary"
                size="sm"
                icon={<UploadIcon className="w-4 h-4" />}
                onClick={() => fileInputRef.current?.click()}>
                
                Importar
              </Button>
            </label>
          </div>
          {canCreate &&
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => {
              setEditingClient(null);
              setIsFormModalOpen(true);
            }}>
            
              Novo Cliente
            </Button>
          }
        </div>
      </div>

      {/* Import Result */}
      {importResult &&
      <div className="glass rounded-xl p-4 border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 animate-fade-in">
          <p className="text-sm text-[var(--text-primary)]">
            <span className="text-[var(--accent-green)] font-medium">
              {importResult.success}
            </span>{' '}
            cliente{importResult.success !== 1 ? 's' : ''} importado
            {importResult.success !== 1 ? 's' : ''} com sucesso
            {importResult.errors > 0 &&
          <span className="text-[var(--accent-red)] ml-2">
                • {importResult.errors} erro
                {importResult.errors !== 1 ? 's' : ''}
              </span>
          }
          </p>
        </div>
      }

      {/* Search and Filters */}
      <div
        className="space-y-4 animate-fade-in"
        style={{
          animationDelay: '50ms'
        }}>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('common.searchByNameOrCpf') || 'Search by name or CPF...'}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-blue)]/50" />
            
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            icon={<FilterIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}>
            
            {t('common.filters') || 'Filters'}
            {hasActiveFilters &&
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--accent-blue)] text-white text-xs">
                {[filterStatus, filterState].filter(Boolean).length}
              </span>
            }
          </Button>
          {hasActiveFilters &&
          <Button
            variant="ghost"
            icon={<XIcon className="w-4 h-4" />}
            onClick={clearFilters}>
            
              Limpar
            </Button>
          }
        </div>

        {showFilters &&
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)] grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={statusOptions} />
          
            <Select
            label="Estado"
            value={filterState}
            onChange={(e) => {
              setFilterState(e.target.value);
              setCurrentPage(1);
            }}
            options={stateOptions} />
          
          </div>
        }
      </div>

      {/* Clients Table */}
      <div
        className="glass rounded-2xl border border-[var(--glass-border)] overflow-hidden animate-fade-in"
        style={{
          animationDelay: '100ms'
        }}>
        
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--glass-border)]">
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                  Cliente
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                  CPF
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                  Contato
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                  Cidade/UF
                </th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                  Status
                </th>
                <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ?
              <tr>
                  <td
                  colSpan={6}
                  className="p-8 text-center text-[var(--text-secondary)]">
                  
                    {t('common.notFound')}
                  </td>
                </tr> :

              paginatedClients.map((client) =>
              <tr
                key={client.id}
                className="border-b border-[var(--glass-border)]/50 hover:bg-[var(--glass-bg)] transition-colors">
                
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-[var(--accent-blue)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {client.name}
                          </p>
                          {client.profession &&
                      <p className="text-xs text-[var(--text-secondary)]">
                              {client.profession}
                            </p>
                      }
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-[var(--text-primary)]">
                        {client.cpf}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {client.phone &&
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <PhoneIcon className="w-4 h-4" />
                            {client.phone}
                          </div>
                    }
                        {client.email &&
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <MailIcon className="w-4 h-4" />
                            <span className="truncate max-w-[150px]">
                              {client.email}
                            </span>
                          </div>
                    }
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <MapPinIcon className="w-4 h-4" />
                        {client.city}/{client.state}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${client.status === 'ativo' ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' : 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]'}`}>
                    
                        {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                      onClick={() => handleViewClient(client)}
                      className="p-2 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      title="Visualizar">
                      
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {canEdit &&
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-2 rounded-lg hover:bg-[var(--accent-blue)]/20 text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
                      title="Editar">
                      
                            <PencilIcon className="w-4 h-4" />
                          </button>
                    }
                        {canDelete && client.status === 'ativo' &&
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 rounded-lg hover:bg-[var(--accent-red)]/20 text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors"
                      title="Desativar">
                      
                            <TrashIcon className="w-4 h-4" />
                          </button>
                    }
                      </div>
                    </td>
                  </tr>
              )
              }
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-[var(--glass-border)]/50">
          {paginatedClients.length === 0 ?
          <div className="p-8 text-center text-[var(--text-secondary)]">
              {t('common.notFound')}
            </div> :

          paginatedClients.map((client) =>
          <div
            key={client.id}
            className="p-4 hover:bg-[var(--glass-bg)] transition-colors"
            onClick={() => handleViewClient(client)}>
            
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-[var(--accent-blue)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {client.name}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] font-mono">
                        {client.cpf}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {client.city}/{client.state}
                      </p>
                    </div>
                  </div>
                  <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'ativo' ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' : 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]'}`}>
                
                    {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
          )
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 &&
        <div className="flex items-center justify-between p-4 border-t border-[var(--glass-border)]">
            <p className="text-sm text-[var(--text-secondary)]">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)}{' '}
              de {filteredClients.length}
            </p>
            <div className="flex items-center gap-2">
              <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-sm text-[var(--text-primary)] px-3">
                {currentPage} / {totalPages}
              </span>
              <button
              onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        }
      </div>

      {/* Modals */}
      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        editingClient={editingClient} />
      
      <ClientDetailPanel
        client={selectedClient}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedClient(null);
        }}
        onEdit={canEdit ? handleEditClient : undefined}
        onDelete={canDelete ? handleDeleteClient : undefined} />
      
    </div>);

}