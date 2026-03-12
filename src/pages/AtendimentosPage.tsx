import React, { useMemo, useState } from 'react';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  LayoutGridIcon,
  ListIcon,
  CalendarIcon,
  UserIcon,
  XIcon,
  GripVerticalIcon,
  DollarSignIcon,
  ClockIcon,
  CheckCircleIcon } from
'lucide-react';
import { Attendance, AttendanceStatus, ClientRecord } from '../types';
import {
  ATTENDANCE_STATUS_CONFIG,
  AREA_OF_LAW_CONFIG } from
'../data/attendanceData';
import { getAllUsers } from '../data/authData';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { hasPermission } from '../utils/auth';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { AttendanceModal } from '../components/attendances/AttendanceModal';
import { AttendanceDetailPanel } from '../components/attendances/AttendanceDetailPanel';
type ViewMode = 'list' | 'kanban';
const KANBAN_COLUMNS: AttendanceStatus[] = [
'novo_contato',
'em_analise',
'aguardando_documentos',
'proposta_enviada',
'fechado',
'nao_fechado'];

export function AtendimentosPage() {
  const { user } = useAuth();
  const { attendances, setAttendances, clientRecords } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null
  );
  const [selectedAttendance, setSelectedAttendance] =
  useState<Attendance | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const users = useMemo(() => getAllUsers(), []);
  const canCreate = user ?
  hasPermission(user.role, 'atendimentos.create') :
  false;
  const canEdit = user ? hasPermission(user.role, 'atendimentos.edit') : false;
  const getClient = (clientId: string): ClientRecord | undefined => {
    return clientRecords.find((c) => c.id === clientId);
  };
  const filteredAttendances = useMemo(() => {
    return attendances.filter((att) => {
      if (att.deletedAt) return false;
      if (searchTerm) {
        const client = getClient(att.clientId);
        const search = searchTerm.toLowerCase();
        const matchesClient =
        client?.name.toLowerCase().includes(search) ||
        client?.cpf.includes(search) ||
        client?.phone?.includes(search);
        const matchesDesc = att.description.toLowerCase().includes(search);
        if (!matchesClient && !matchesDesc) return false;
      }
      if (filterStatus && att.status !== filterStatus) return false;
      if (filterResponsible && att.responsibleUserId !== filterResponsible)
      return false;
      return true;
    });
  }, [attendances, clientRecords, searchTerm, filterStatus, filterResponsible]);
  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const fechados = filteredAttendances.filter(
      (a) => a.status === 'fechado'
    ).length;
    const emAnalise = filteredAttendances.filter(
      (a) => a.status === 'em_analise'
    ).length;
    const valorTotal = filteredAttendances.reduce(
      (sum, a) => sum + (a.estimatedValue || 0),
      0
    );
    return {
      total,
      fechados,
      emAnalise,
      valorTotal
    };
  }, [filteredAttendances]);
  const handleSaveAttendance = (data: Partial<Attendance>) => {
    const now = new Date().toISOString();
    if (data.id) {
      setAttendances((prev) =>
      prev.map((a) =>
      a.id === data.id ?
      {
        ...a,
        ...data,
        updatedAt: now
      } :
      a
      )
      );
    } else {
      const newAttendance: Attendance = {
        ...data,
        id: `att-${Date.now()}`,
        logs: [],
        createdBy: user?.id || 'unknown',
        createdAt: now,
        updatedAt: now
      } as Attendance;
      setAttendances((prev) => [newAttendance, ...prev]);
    }
    setEditingAttendance(null);
  };
  const handleDeleteAttendance = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este atendimento?')) {
      const now = new Date().toISOString();
      setAttendances((prev) =>
      prev.map((a) =>
      a.id === id ?
      {
        ...a,
        deletedAt: now,
        updatedAt: now
      } :
      a
      )
      );
      setIsDetailPanelOpen(false);
      setSelectedAttendance(null);
    }
  };
  const handleStatusChange = (id: string, newStatus: AttendanceStatus) => {
    const now = new Date().toISOString();
    setAttendances((prev) =>
    prev.map((a) =>
    a.id === id ?
    {
      ...a,
      status: newStatus,
      updatedAt: now
    } :
    a
    )
    );
    if (selectedAttendance?.id === id) {
      setSelectedAttendance((prev) =>
      prev ?
      {
        ...prev,
        status: newStatus
      } :
      null
      );
    }
  };
  const handleAddLog = (
  attendanceId: string,
  log: {
    type: string;
    description: string;
  }) =>
  {
    const now = new Date().toISOString();
    const newLog = {
      id: `log-${Date.now()}`,
      attendanceId,
      userId: user?.id || 'unknown',
      type: log.type as any,
      description: log.description,
      createdAt: now
    };
    setAttendances((prev) =>
    prev.map((a) =>
    a.id === attendanceId ?
    {
      ...a,
      logs: [...a.logs, newLog],
      updatedAt: now
    } :
    a
    )
    );
    if (selectedAttendance?.id === attendanceId) {
      setSelectedAttendance((prev) =>
      prev ?
      {
        ...prev,
        logs: [...prev.logs, newLog]
      } :
      null
      );
    }
  };
  const handleDragStart = (e: React.DragEvent, attendanceId: string) => {
    e.dataTransfer.setData('attendanceId', attendanceId);
  };
  const handleDrop = (e: React.DragEvent, newStatus: AttendanceStatus) => {
    e.preventDefault();
    const attendanceId = e.dataTransfer.getData('attendanceId');
    if (attendanceId) handleStatusChange(attendanceId, newStatus);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterResponsible('');
  };
  const hasActiveFilters = searchTerm || filterStatus || filterResponsible;
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-1">
            Atendimentos
          </h1>
          <p className="text-[var(--text-secondary)]">
            Gestão de leads e oportunidades
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 glass rounded-xl border border-[var(--glass-border)]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              
              <ListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              
              <LayoutGridIcon className="w-5 h-5" />
            </button>
          </div>
          {canCreate &&
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => {
              setEditingAttendance(null);
              setIsModalOpen(true);
            }}>
            
              Novo Atendimento
            </Button>
          }
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in"
        style={{
          animationDelay: '50ms'
        }}>
        
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-blue)]/20">
              <UserIcon className="w-5 h-5 text-[var(--accent-blue)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.total}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Total</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <ClockIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">
                {stats.emAnalise}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Em Análise
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-green)]/20">
              <CheckCircleIcon className="w-5 h-5 text-[var(--accent-green)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--accent-green)]">
                {stats.fechados}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Fechados
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <DollarSignIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                R$ {(stats.valorTotal / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Valor Estimado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className="space-y-4 animate-fade-in"
        style={{
          animationDelay: '100ms'
        }}>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, CPF ou telefone..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-blue)]/50" />
            
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            icon={<FilterIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}>
            
            Filtros
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
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)] grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
            {
              value: '',
              label: 'Todos'
            },
            ...Object.entries(ATTENDANCE_STATUS_CONFIG).map(([k, v]) => ({
              value: k,
              label: v.label
            }))]
            } />
          
            <Select
            label="Responsável"
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
            options={[
            {
              value: '',
              label: 'Todos'
            },
            ...users.map((u) => ({
              value: u.id,
              label: u.name
            }))]
            } />
          
          </div>
        }
      </div>

      {/* List View */}
      {viewMode === 'list' &&
      <div
        className="glass rounded-2xl border border-[var(--glass-border)] overflow-hidden animate-fade-in"
        style={{
          animationDelay: '150ms'
        }}>
        
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Cliente
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Área
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Responsável
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Valor Est.
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    Próx. Contato
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendances.length === 0 ?
              <tr>
                    <td
                  colSpan={6}
                  className="p-8 text-center text-[var(--text-secondary)]">
                  
                      Nenhum atendimento encontrado
                    </td>
                  </tr> :

              filteredAttendances.map((att) => {
                const client = getClient(att.clientId);
                const responsible = users.find(
                  (u) => u.id === att.responsibleUserId
                );
                const statusConfig = ATTENDANCE_STATUS_CONFIG[att.status];
                return (
                  <tr
                    key={att.id}
                    onClick={() => {
                      setSelectedAttendance(att);
                      setIsDetailPanelOpen(true);
                    }}
                    className="border-b border-[var(--glass-border)]/50 hover:bg-[var(--glass-bg)] cursor-pointer transition-colors">
                    
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-[var(--accent-blue)]" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">
                                {client?.name || 'Cliente não encontrado'}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)]">
                                {client?.cpf}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[var(--text-primary)]">
                            {AREA_OF_LAW_CONFIG[att.areaOfLaw]}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[var(--text-secondary)]">
                            {responsible?.name || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[var(--text-primary)]">
                            {att.estimatedValue ?
                        `R$ ${att.estimatedValue.toLocaleString('pt-BR')}` :
                        '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[var(--text-secondary)]">
                            {att.nextContactDate ?
                        new Date(
                          att.nextContactDate
                        ).toLocaleDateString('pt-BR') :
                        '-'}
                          </span>
                        </td>
                      </tr>);

              })
              }
              </tbody>
            </table>
          </div>
        </div>
      }

      {/* Kanban View */}
      {viewMode === 'kanban' &&
      <div
        className="flex gap-4 overflow-x-auto pb-4 animate-fade-in"
        style={{
          animationDelay: '150ms'
        }}>
        
          {KANBAN_COLUMNS.map((status) => {
          const config = ATTENDANCE_STATUS_CONFIG[status];
          const columnAttendances = filteredAttendances.filter(
            (a) => a.status === status
          );
          return (
            <div
              key={status}
              className="flex-shrink-0 w-72 glass rounded-2xl border border-[var(--glass-border)] overflow-hidden"
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}>
              
                <div
                className={`p-4 border-b border-[var(--glass-border)] ${config.bgColor}`}>
                
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${config.color}`}>
                      {config.label}
                    </h3>
                    <span
                    className={`px-2 py-0.5 rounded-full text-xs ${config.bgColor} ${config.color}`}>
                    
                      {columnAttendances.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto">
                  {columnAttendances.map((att) => {
                  const client = getClient(att.clientId);
                  return (
                    <div
                      key={att.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, att.id)}
                      onClick={() => {
                        setSelectedAttendance(att);
                        setIsDetailPanelOpen(true);
                      }}
                      className="glass rounded-xl p-3 border border-[var(--glass-border)] cursor-pointer hover:bg-[var(--glass-bg)] transition-all">
                      
                        <div className="flex items-start gap-2 mb-2">
                          <GripVerticalIcon className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0 mt-0.5 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                              {client?.name}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                              {AREA_OF_LAW_CONFIG[att.areaOfLaw]}
                            </p>
                          </div>
                        </div>
                        {att.estimatedValue &&
                      <div className="flex items-center gap-1 text-xs text-[var(--accent-green)]">
                            <DollarSignIcon className="w-3 h-3" />
                            R$ {att.estimatedValue.toLocaleString('pt-BR')}
                          </div>
                      }
                        {att.nextContactDate &&
                      <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mt-1">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(att.nextContactDate).toLocaleDateString(
                          'pt-BR'
                        )}
                          </div>
                      }
                      </div>);

                })}
                </div>
              </div>);

        })}
        </div>
      }

      {/* Modals */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAttendance(null);
        }}
        onSave={handleSaveAttendance}
        editingAttendance={editingAttendance}
        clients={clientRecords}
        users={users} />
      
      <AttendanceDetailPanel
        attendance={selectedAttendance}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedAttendance(null);
        }}
        onEdit={(att) => {
          setEditingAttendance(att);
          setIsModalOpen(true);
          setIsDetailPanelOpen(false);
        }}
        onDelete={handleDeleteAttendance}
        onStatusChange={handleStatusChange}
        onAddLog={handleAddLog}
        clients={clientRecords}
        users={users}
        canEdit={canEdit} />
      
    </div>);

}