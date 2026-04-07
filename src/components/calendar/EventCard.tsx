import { AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
import { LegalEvent, LegalEventType } from '../../types';
import { isEventOverdue, isEventUrgent } from '../../utils/legalDeadlines';
interface EventCardProps {
  event: LegalEvent;
  onClick: () => void;
  compact?: boolean;
}
const typeColors: Record<
  LegalEventType,
  {
    bg: string;
    text: string;
    border: string;
  }> =
{
  prazo_processual: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30'
  },
  audiencia: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30'
  },
  reuniao: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30'
  },
  atendimento: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30'
  },
  tarefa: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30'
  }
};
export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  const colors = typeColors[event.type];
  const overdue = isEventOverdue(event.dateEnd, event.status);
  const urgent = isEventUrgent(event.dateEnd, event.status);
  const completed = event.status === 'concluido';
  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`
          w-full text-left px-1.5 py-0.5 rounded text-xs truncate
          transition-all duration-200 hover:opacity-80
          ${colors.bg} ${colors.text}
          ${completed ? 'opacity-50 line-through' : ''}
          ${overdue ? 'ring-1 ring-red-500/50' : ''}
        `}>
        
        <span className="flex items-center gap-1">
          {overdue && !completed &&
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          }
          {urgent && !overdue && !completed &&
          <AlertTriangleIcon className="w-3 h-3 text-amber-400 flex-shrink-0" />
          }
          {completed &&
          <CheckCircleIcon className="w-3 h-3 text-green-400 flex-shrink-0" />
          }
          <span className="truncate">{event.title}</span>
        </span>
      </button>);

  }
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-xl border transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg
        ${colors.bg} ${colors.border}
        ${completed ? 'opacity-60' : ''}
        ${overdue ? 'ring-2 ring-red-500/50 glow-red' : ''}
      `}>
      
      <div className="flex items-start gap-2">
        <div
          className={`w-1 h-full min-h-[40px] rounded-full ${colors.text.replace('text-', 'bg-')}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {overdue && !completed &&
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            }
            {urgent && !overdue && !completed &&
            <AlertTriangleIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
            }
            {completed &&
            <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
            }
            <span
              className={`font-medium ${colors.text} ${completed ? 'line-through' : ''} truncate`}>
              
              {event.title}
            </span>
          </div>
          {!event.allDay && event.timeStart &&
          <p className="text-xs text-text-secondary">
              {event.timeStart} - {event.timeEnd}
            </p>
          }
        </div>
      </div>
    </button>);

}