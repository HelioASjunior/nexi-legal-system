import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalculatorIcon,
  SearchIcon,
  CalendarIcon,
  ListIcon,
  LayoutGridIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  UsersIcon,
  ChevronDownIcon } from
'lucide-react';
import { LegalEvent, LegalEventStatus, CalendarViewMode } from '../types';
import { mockLegalUsers } from '../data/legalMockData';
import { isEventOverdue } from '../utils/legalDeadlines';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/Button';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarDayView } from '../components/calendar/CalendarDayView';
import { CalendarListView } from '../components/calendar/CalendarListView';
import {
  CalendarFilters,
  CalendarFiltersState } from
'../components/calendar/CalendarFilters';
import { EventModal } from '../components/calendar/EventModal';
import { EventDetailPanel } from '../components/calendar/EventDetailPanel';
import { DeadlineCalculator } from '../components/calendar/DeadlineCalculator';
import { getAllUsers } from '../data/authData';
const MONTHS = [
'Janeiro',
'Fevereiro',
'Março',
'Abril',
'Maio',
'Junho',
'Julho',
'Agosto',
'Setembro',
'Outubro',
'Novembro',
'Dezembro'];

const viewModeConfig: {
  id: CalendarViewMode;
  label: string;
  icon: React.ReactNode;
}[] = [
{
  id: 'month',
  label: 'Mensal',
  icon: <LayoutGridIcon className="w-4 h-4" />
},
{
  id: 'week',
  label: 'Semanal',
  icon: <CalendarIcon className="w-4 h-4" />
},
{
  id: 'day',
  label: 'Diário',
  icon: <ClockIcon className="w-4 h-4" />
},
{
  id: 'list',
  label: 'Lista',
  icon: <ListIcon className="w-4 h-4" />
}];

export function CalendarPage() {
  const { user } = useAuth();
  const { legalEvents, setLegalEvents, legalClients, legalProcesses } =
  useData();
  const systemUsers = useMemo(() => getAllUsers(), []);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userFilter, setUserFilter] = useState<'mine' | 'all' | string>('mine');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showUserDropdown) return;
    const handleOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showUserDropdown]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CalendarFiltersState>({
    types: [],
    statuses: [],
    clientId: '',
    processId: '',
    responsibleId: ''
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LegalEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<LegalEvent | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const currentLegalUserId = useMemo(() => {
    if (!user) return null;
    const legalUser = mockLegalUsers.find((lu) => lu.name === user.name);
    return legalUser?.id || user.id;
  }, [user]);
  const selectedUserName = useMemo(() => {
    if (userFilter === 'mine') return 'Meus Eventos';
    if (userFilter === 'all') return 'Todos os Eventos';
    const selectedUser = systemUsers.find((u) => u.id === userFilter);
    return selectedUser?.name || 'Funcionário';
  }, [userFilter, systemUsers]);
  const filteredEvents = useMemo(() => {
    return legalEvents.filter((event) => {
      // User filter
      if (userFilter === 'mine' && currentLegalUserId) {
        const eventUserIds = event.responsibleIds || [event.responsibleId];
        if (!eventUserIds.includes(currentLegalUserId)) return false;
      } else if (userFilter !== 'all' && userFilter !== 'mine') {
        // Specific user filter
        const eventUserIds = event.responsibleIds || [event.responsibleId];
        if (!eventUserIds.includes(userFilter)) return false;
      }
      if (
      searchTerm &&
      !event.title.toLowerCase().includes(searchTerm.toLowerCase()))

      return false;
      if (filters.types.length > 0 && !filters.types.includes(event.type))
      return false;
      if (filters.statuses.length > 0) {
        const effectiveStatus =
        event.status === 'concluido' ?
        'concluido' :
        isEventOverdue(event.dateEnd, event.status) ?
        'atrasado' :
        event.status;
        if (!filters.statuses.includes(effectiveStatus)) return false;
      }
      if (filters.clientId && event.clientId !== filters.clientId) return false;
      if (filters.processId && event.processId !== filters.processId)
      return false;
      if (
      filters.responsibleId &&
      event.responsibleId !== filters.responsibleId)

      return false;
      return true;
    });
  }, [legalEvents, searchTerm, filters, userFilter, currentLegalUserId]);
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
    let pendentes = 0,
      atrasados = 0,
      concluidos = 0,
      thisWeek = 0;
    filteredEvents.forEach((event) => {
      if (event.status === 'concluido') concluidos++;else
      if (isEventOverdue(event.dateEnd, event.status)) atrasados++;else
      pendentes++;
      const eventDate = new Date(event.dateEnd);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate >= today && eventDate <= endOfWeek) thisWeek++;
    });
    return {
      pendentes,
      atrasados,
      concluidos,
      thisWeek
    };
  }, [filteredEvents]);
  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month')
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));else
      if (viewMode === 'week')
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));else
      if (viewMode === 'day')
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  const getPeriodLabel = () => {
    if (viewMode === 'month')
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${MONTHS[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
    }
    if (viewMode === 'day')
    return currentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return 'Agenda';
  };
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setCurrentDate(date);
      setViewMode('day');
    }
  };
  const handleEventClick = (event: LegalEvent) => {
    setSelectedEvent(event);
    setIsDetailPanelOpen(true);
  };
  const handleSaveEvent = (
  eventData: Omit<LegalEvent, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  }) =>
  {
    const now = new Date().toISOString();
    if (eventData.id) {
      setLegalEvents((prev) =>
      prev.map((e) =>
      e.id === eventData.id ?
      {
        ...e,
        ...eventData,
        updatedAt: now
      } :
      e
      )
      );
    } else {
      const newEvent: LegalEvent = {
        ...eventData,
        id: `le-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      } as LegalEvent;
      setLegalEvents((prev) => [...prev, newEvent]);
    }
    setEditingEvent(null);
  };
  const handleDeleteEvent = (eventId: string) => {
    setLegalEvents((prev) => prev.filter((e) => e.id !== eventId));
    setIsDetailPanelOpen(false);
    setSelectedEvent(null);
  };
  const handleStatusChange = (eventId: string, status: LegalEventStatus) => {
    setLegalEvents((prev) =>
    prev.map((e) =>
    e.id === eventId ?
    {
      ...e,
      status,
      updatedAt: new Date().toISOString()
    } :
    e
    )
    );
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) =>
      prev ?
      {
        ...prev,
        status
      } :
      null
      );
    }
  };
  const handleLabelsChange = (eventId: string, labels: LegalEventStatus[]) => {
    setLegalEvents((prev) =>
    prev.map((e) =>
    e.id === eventId ?
    {
      ...e,
      labels,
      status: labels[0],
      updatedAt: new Date().toISOString()
    } :
    e
    )
    );
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) =>
      prev ?
      {
        ...prev,
        labels,
        status: labels[0]
      } :
      null
      );
    }
  };
  const handleEditEvent = (event: LegalEvent) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
    setIsDetailPanelOpen(false);
  };
  const handleCreateEventFromCalculator = (
  eventData: Omit<LegalEvent, 'id' | 'createdAt' | 'updatedAt'>) =>
  {
    const now = new Date().toISOString();
    const newEvent: LegalEvent = {
      ...eventData,
      id: `le-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    } as LegalEvent;
    setLegalEvents((prev) => [...prev, newEvent]);
  };
  const handleEventDrop = (eventId: string, newDate: Date) => {
    const now = new Date().toISOString();
    setLegalEvents((prev) =>
    prev.map((e) => {
      if (e.id !== eventId) return e;
      const oldStart = new Date(e.dateStart);
      const oldEnd = new Date(e.dateEnd);
      const durationMs = oldEnd.getTime() - oldStart.getTime();
      const newStart = new Date(newDate);
      const newEnd = new Date(newStart.getTime() + durationMs);
      return {
        ...e,
        dateStart: newStart.toISOString().split('T')[0],
        dateEnd: newEnd.toISOString().split('T')[0],
        updatedAt: now
      };
    })
    );
  };
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-1">
            Calendário Jurídico
          </h1>
          <p className="text-[var(--text-secondary)]">
            Gerencie prazos, audiências, reuniões e tarefas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<CalculatorIcon className="w-5 h-5" />}
            onClick={() => setIsCalculatorOpen(true)}>
            
            Calcular Prazo
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => {
              setEditingEvent(null);
              setIsEventModalOpen(true);
            }}>
            
            Novo Evento
          </Button>
        </div>
      </div>

      {/* User Filter with Dropdown */}
      <div
        className="flex items-center gap-2 animate-fade-in relative z-30"
        style={{
          animationDelay: '25ms'
        }}>
        
        <span className="text-sm text-[var(--text-secondary)]">
          Visualizar:
        </span>
        <div className="flex items-center gap-1 p-1 glass rounded-xl border border-[var(--glass-border)]">
          <button
            onClick={() => setUserFilter('mine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${userFilter === 'mine' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'}`}>
            
            <UserIcon className="w-4 h-4" />
            Meus Eventos
          </button>
          <button
            onClick={() => setUserFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${userFilter === 'all' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'}`}>
            
            <UsersIcon className="w-4 h-4" />
            Todos
          </button>

          {/* Per-employee dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${userFilter !== 'mine' && userFilter !== 'all' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'}`}>
              
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {userFilter !== 'mine' && userFilter !== 'all' ?
                selectedUserName :
                'Funcionário'}
              </span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showUserDropdown &&
            <>
                <div className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto glass-strong rounded-xl border border-[var(--glass-border)] shadow-lg z-50">
                  {systemUsers.
                filter((u) => u.active).
                map((u) =>
                <button
                  key={u.id}
                  onClick={() => {
                    setUserFilter(u.id);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--glass-bg)] transition-colors ${userFilter === u.id ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]' : 'text-[var(--text-primary)]'}`}>
                  
                        {u.name}
                      </button>
                )}
                </div>
            </>
            }
          </div>
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
            <div className="p-2 rounded-lg bg-amber-500/20">
              <ClockIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.pendentes}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Pendentes
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangleIcon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {stats.atrasados}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Atrasados
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {stats.concluidos}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Concluídos
              </div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.thisWeek}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Esta Semana
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in"
        style={{
          animationDelay: '100ms'
        }}>
        
        <div className="flex items-center gap-1 p-1 glass rounded-xl border border-[var(--glass-border)]">
          {viewModeConfig.map((mode) =>
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === mode.id ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'}`}>
            
              {mode.icon}
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigatePeriod('prev')}
              className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors">
              
              <ChevronLeftIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <span className="text-[var(--text-primary)] font-medium min-w-[200px] text-center">
              {getPeriodLabel()}
            </span>
            <button
              onClick={() => navigatePeriod('next')}
              className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors">
              
              <ChevronRightIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        <div className="relative w-full lg:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-blue)]/50" />
          
        </div>
      </div>

      {/* Filters */}
      <div
        className="animate-fade-in"
        style={{
          animationDelay: '150ms'
        }}>
        
        <CalendarFilters
          filters={filters}
          onFilterChange={setFilters}
          clients={legalClients}
          processes={legalProcesses}
          users={mockLegalUsers} />
        
      </div>

      {/* Calendar Views */}
      <div
        className="animate-fade-in"
        style={{
          animationDelay: '200ms'
        }}>
        
        {viewMode === 'month' &&
        <CalendarMonthView
          currentDate={currentDate}
          events={filteredEvents}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          selectedDate={selectedDate} />

        }
        {viewMode === 'week' &&
        <CalendarWeekView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={handleEventClick} />

        }
        {viewMode === 'day' &&
        <CalendarDayView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={handleEventClick} />

        }
        {viewMode === 'list' &&
        <CalendarListView
          events={filteredEvents}
          onEventClick={handleEventClick} />

        }
      </div>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent} />
      
      <EventDetailPanel
        event={selectedEvent}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onStatusChange={handleStatusChange}
        onLabelsChange={handleLabelsChange} />
      
      <DeadlineCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onCreateEvent={handleCreateEventFromCalculator} />
      
    </div>);

}