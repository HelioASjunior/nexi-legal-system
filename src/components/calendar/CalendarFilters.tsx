import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-react';
import {
  LegalEventType,
  LegalEventStatus,
  LegalUser,
  LegalClient,
  LegalProcess } from
'../../types';
import { Button } from '../Button';
import { Select } from '../Select';
export interface CalendarFiltersState {
  types: LegalEventType[];
  statuses: LegalEventStatus[];
  clientId: string;
  processId: string;
  responsibleId: string;
}
interface CalendarFiltersProps {
  filters: CalendarFiltersState;
  onFilterChange: (filters: CalendarFiltersState) => void;
  clients: LegalClient[];
  processes: LegalProcess[];
  users: LegalUser[];
}
const eventTypeLabels: Record<LegalEventType, string> = {
  prazo_processual: 'Prazo Processual',
  audiencia: 'Audiência',
  reuniao: 'Reunião',
  tarefa: 'Tarefa'
};
const eventTypeColors: Record<LegalEventType, string> = {
  prazo_processual: 'bg-red-500',
  audiencia: 'bg-purple-500',
  reuniao: 'bg-blue-500',
  tarefa: 'bg-orange-500'
};
const statusLabels: Record<LegalEventStatus, string> = {
  pendente: 'Pendente',
  concluido: 'Concluído',
  atrasado: 'Atrasado'
};
const statusColors: Record<LegalEventStatus, string> = {
  pendente: 'bg-amber-500',
  concluido: 'bg-green-500',
  atrasado: 'bg-red-500'
};
export function CalendarFilters({
  filters,
  onFilterChange,
  clients,
  processes,
  users
}: CalendarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeFilterCount =
  filters.types.length +
  filters.statuses.length + (
  filters.clientId ? 1 : 0) + (
  filters.processId ? 1 : 0) + (
  filters.responsibleId ? 1 : 0);
  const toggleType = (type: LegalEventType) => {
    const newTypes = filters.types.includes(type) ?
    filters.types.filter((t) => t !== type) :
    [...filters.types, type];
    onFilterChange({
      ...filters,
      types: newTypes
    });
  };
  const toggleStatus = (status: LegalEventStatus) => {
    const newStatuses = filters.statuses.includes(status) ?
    filters.statuses.filter((s) => s !== status) :
    [...filters.statuses, status];
    onFilterChange({
      ...filters,
      statuses: newStatuses
    });
  };
  const clearFilters = () => {
    onFilterChange({
      types: [],
      statuses: [],
      clientId: '',
      processId: '',
      responsibleId: ''
    });
  };
  const filteredProcesses = filters.clientId ?
  processes.filter((p) => p.client === filters.clientId) :
  processes;
  return (
    <div className="glass rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        
        <div className="flex items-center gap-3">
          <span className="font-medium text-text-primary">Filtros</span>
          {activeFilterCount > 0 &&
          <span className="px-2 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-medium">
              {activeFilterCount} ativo{activeFilterCount > 1 ? 's' : ''}
            </span>
          }
        </div>
        {isExpanded ?
        <ChevronUpIcon className="w-5 h-5 text-text-secondary" /> :

        <ChevronDownIcon className="w-5 h-5 text-text-secondary" />
        }
      </button>

      {isExpanded &&
      <div className="p-4 pt-0 space-y-4 border-t border-white/10">
          {/* Event Types */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tipo de Evento
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(eventTypeLabels) as LegalEventType[]).map(
              (type) =>
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                    transition-all duration-200 border
                    ${filters.types.includes(type) ? 'bg-white/10 border-white/20 text-text-primary' : 'border-white/10 text-text-secondary hover:bg-white/5'}
                  `}>
                
                    <span
                  className={`w-2 h-2 rounded-full ${eventTypeColors[type]}`} />
                
                    {eventTypeLabels[type]}
                  </button>

            )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusLabels) as LegalEventStatus[]).map(
              (status) =>
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                    transition-all duration-200 border
                    ${filters.statuses.includes(status) ? 'bg-white/10 border-white/20 text-text-primary' : 'border-white/10 text-text-secondary hover:bg-white/5'}
                  `}>
                
                    <span
                  className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                
                    {statusLabels[status]}
                  </button>

            )}
            </div>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
            label="Cliente"
            value={filters.clientId}
            onChange={(e) =>
            onFilterChange({
              ...filters,
              clientId: e.target.value,
              processId: ''
            })
            }
            options={[
            {
              value: '',
              label: 'Todos os clientes'
            },
            ...clients.map((c) => ({
              value: c.id,
              label: c.name
            }))]
            } />
          
            <Select
            label="Processo"
            value={filters.processId}
            onChange={(e) =>
            onFilterChange({
              ...filters,
              processId: e.target.value
            })
            }
            options={[
            {
              value: '',
              label: 'Todos os processos'
            },
            ...filteredProcesses.map((p) => ({
              value: p.id,
              label: p.number
            }))]
            } />
          
            <Select
            label="Responsável"
            value={filters.responsibleId}
            onChange={(e) =>
            onFilterChange({
              ...filters,
              responsibleId: e.target.value
            })
            }
            options={[
            {
              value: '',
              label: 'Todos os responsáveis'
            },
            ...users.map((u) => ({
              value: u.id,
              label: u.name
            }))]
            } />
          
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 &&
        <div className="flex justify-end pt-2">
              <Button
            variant="ghost"
            size="sm"
            icon={<XIcon className="w-4 h-4" />}
            onClick={clearFilters}>
            
                Limpar Filtros
              </Button>
            </div>
        }
        </div>
      }
    </div>);

}