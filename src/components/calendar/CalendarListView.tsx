import React, { useMemo } from 'react';
import { LegalEvent, LegalEventType, LegalEventStatus } from '../../types';
import {
  isEventOverdue,
  isEventUrgent,
  formatDateBR } from
'../../utils/legalDeadlines';
import {
  mockLegalClients,
  mockLegalProcesses,
  mockLegalUsers } from
'../../data/legalMockData';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  FolderIcon } from
'lucide-react';
interface CalendarListViewProps {
  events: LegalEvent[];
  onEventClick: (event: LegalEvent) => void;
}
const typeColors: Record<
  LegalEventType,
  {
    bg: string;
    border: string;
    dot: string;
  }> =
{
  prazo_processual: {
    bg: 'bg-red-500/10',
    border: 'border-l-red-500',
    dot: 'bg-red-500'
  },
  audiencia: {
    bg: 'bg-purple-500/10',
    border: 'border-l-purple-500',
    dot: 'bg-purple-500'
  },
  reuniao: {
    bg: 'bg-blue-500/10',
    border: 'border-l-blue-500',
    dot: 'bg-blue-500'
  },
  tarefa: {
    bg: 'bg-orange-500/10',
    border: 'border-l-orange-500',
    dot: 'bg-orange-500'
  }
};
const typeLabels: Record<LegalEventType, string> = {
  prazo_processual: 'Prazo Processual',
  audiencia: 'Audiência',
  reuniao: 'Reunião',
  tarefa: 'Tarefa'
};
const statusConfig: Record<
  LegalEventStatus,
  {
    label: string;
    color: string;
  }> =
{
  pendente: {
    label: 'Pendente',
    color: 'bg-amber-500/20 text-amber-400'
  },
  concluido: {
    label: 'Concluído',
    color: 'bg-green-500/20 text-green-400'
  },
  atrasado: {
    label: 'Atrasado',
    color: 'bg-red-500/20 text-red-400'
  }
};
export function CalendarListView({
  events,
  onEventClick
}: CalendarListViewProps) {
  const groupedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
    const endOfNextWeek = new Date(endOfWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
    const groups: {
      label: string;
      events: LegalEvent[];
    }[] = [
    {
      label: 'Atrasados',
      events: []
    },
    {
      label: 'Hoje',
      events: []
    },
    {
      label: 'Amanhã',
      events: []
    },
    {
      label: 'Esta Semana',
      events: []
    },
    {
      label: 'Próxima Semana',
      events: []
    },
    {
      label: 'Mais Tarde',
      events: []
    }];

    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.dateEnd).getTime() - new Date(b.dateEnd).getTime()
    );
    sortedEvents.forEach((event) => {
      const eventDate = new Date(event.dateEnd);
      eventDate.setHours(0, 0, 0, 0);
      if (isEventOverdue(event.dateEnd, event.status)) {
        groups[0].events.push(event);
      } else if (eventDate.getTime() === today.getTime()) {
        groups[1].events.push(event);
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        groups[2].events.push(event);
      } else if (eventDate <= endOfWeek) {
        groups[3].events.push(event);
      } else if (eventDate <= endOfNextWeek) {
        groups[4].events.push(event);
      } else {
        groups[5].events.push(event);
      }
    });
    return groups.filter((g) => g.events.length > 0);
  }, [events]);
  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    return mockLegalClients.find((c) => c.id === clientId)?.name;
  };
  const getProcessNumber = (processId?: string) => {
    if (!processId) return null;
    return mockLegalProcesses.find((p) => p.id === processId)?.number;
  };
  const getUserName = (userId: string) => {
    return mockLegalUsers.find((u) => u.id === userId)?.name || 'Desconhecido';
  };
  const getEffectiveStatus = (event: LegalEvent): LegalEventStatus => {
    if (event.status === 'concluido') return 'concluido';
    if (isEventOverdue(event.dateEnd, event.status)) return 'atrasado';
    return event.status;
  };
  return (
    <div className="space-y-6">
      {groupedEvents.length === 0 ?
      <div className="glass rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-text-secondary">Nenhum evento encontrado</p>
        </div> :

      groupedEvents.map((group) =>
      <div key={group.label}>
            <h3
          className={`
              text-sm font-semibold mb-3 flex items-center gap-2
              ${group.label === 'Atrasados' ? 'text-red-400' : 'text-text-secondary'}
            `}>
          
              {group.label === 'Atrasados' &&
          <AlertTriangleIcon className="w-4 h-4" />
          }
              {group.label}
              <span className="text-xs font-normal">
                ({group.events.length})
              </span>
            </h3>

            <div className="space-y-3">
              {group.events.map((event) => {
            const colors = typeColors[event.type];
            const effectiveStatus = getEffectiveStatus(event);
            const status = statusConfig[effectiveStatus];
            const overdue = effectiveStatus === 'atrasado';
            const urgent = isEventUrgent(event.dateEnd, event.status);
            const completed = event.status === 'concluido';
            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`
                      w-full text-left glass rounded-xl border border-white/10
                      border-l-4 ${colors.border}
                      transition-all duration-200 hover:bg-white/5
                      ${overdue ? 'ring-1 ring-red-500/30' : ''}
                      ${completed ? 'opacity-60' : ''}
                    `}>
                
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Type and Status */}
                          <div className="flex items-center gap-2 mb-2">
                            <span
                          className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        
                            <span className="text-xs text-text-secondary">
                              {typeLabels[event.type]}
                            </span>
                            <span
                          className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                          
                              {status.label}
                            </span>
                            {urgent && !overdue && !completed &&
                        <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
                        }
                            {completed &&
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                        }
                          </div>

                          {/* Title */}
                          <h4
                        className={`
                            font-semibold text-text-primary mb-2
                            ${completed ? 'line-through' : ''}
                          `}>
                        
                            {event.title}
                          </h4>

                          {/* Details */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {formatDateBR(event.dateEnd)}
                              {!event.allDay &&
                          event.timeStart &&
                          ` às ${event.timeStart}`}
                            </span>
                            {event.clientId &&
                        <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                {getClientName(event.clientId)}
                              </span>
                        }
                            {event.processId &&
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                                <FolderIcon className="w-4 h-4" />
                                {getProcessNumber(event.processId)}
                              </span>
                        }
                          </div>
                        </div>

                        {/* Responsible */}
                        <div className="text-right">
                          <div className="text-xs text-text-secondary">
                            Responsável
                          </div>
                          <div className="text-sm text-text-primary">
                            {getUserName(event.responsibleId)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>);

          })}
            </div>
          </div>
      )
      }
    </div>);

}