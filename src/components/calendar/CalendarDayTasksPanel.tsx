import { useMemo } from 'react';
import { XIcon, CalendarIcon } from 'lucide-react';
import { LegalEvent, LegalEventType, LegalEventStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CalendarDayTasksPanelProps {
  isOpen: boolean;
  date: Date | null;
  events: LegalEvent[];
  onClose: () => void;
  onEventClick: (event: LegalEvent) => void;
}

const typeColors: Record<LegalEventType, string> = {
  prazo_processual: 'bg-red-500/20 text-red-300 border-red-500/40',
  audiencia: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  reuniao: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  atendimento: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  tarefa: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
};

const typeAccentBars: Record<LegalEventType, string> = {
  prazo_processual: 'bg-red-400',
  audiencia: 'bg-purple-400',
  reuniao: 'bg-blue-400',
  atendimento: 'bg-cyan-400',
  tarefa: 'bg-orange-400'
};

const typeLabels: Record<LegalEventType, string> = {
  prazo_processual: 'calendar.type.deadline',
  audiencia: 'calendar.type.hearing',
  reuniao: 'calendar.type.meeting',
  atendimento: 'calendar.type.attendance',
  tarefa: 'calendar.type.task'
};

const statusLabels: Record<LegalEventStatus, string> = {
  pendente: 'common.pending',
  em_andamento: 'calendar.status.inProgress',
  concluido: 'common.completed',
  aguardando_autorizacao: 'calendar.status.waitingAuthorization',
  aguardando_documentacao: 'calendar.status.waitingDocumentation',
  cartorio: 'calendar.status.registry',
  aguardando_correcao: 'calendar.status.waitingCorrection',
  atrasado: 'common.overdue'
};

const statusDots: Record<LegalEventStatus, string> = {
  pendente: 'bg-amber-400',
  em_andamento: 'bg-blue-400',
  concluido: 'bg-green-400',
  aguardando_autorizacao: 'bg-purple-400',
  aguardando_documentacao: 'bg-orange-400',
  cartorio: 'bg-cyan-400',
  aguardando_correcao: 'bg-pink-400',
  atrasado: 'bg-red-400'
};

export function CalendarDayTasksPanel({
  isOpen,
  date,
  events,
  onClose,
  onEventClick
}: CalendarDayTasksPanelProps) {
  const { t, language } = useLanguage();

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      if (a.timeStart && b.timeStart) return a.timeStart.localeCompare(b.timeStart);
      return a.title.localeCompare(b.title);
    });
  }, [events]);

  const allDayEvents = useMemo(() => {
    return sortedEvents.filter((event) => event.allDay);
  }, [sortedEvents]);

  const timedEvents = useMemo(() => {
    return sortedEvents.filter((event) => !event.allDay);
  }, [sortedEvents]);

  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg h-full glass-strong border-l border-white/10 overflow-y-auto animate-slide-in">
        <div className="sticky top-0 z-10 glass-strong border-b border-white/10 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-accent-blue" />
                {t('calendar.dayEvents')}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {sortedEvents.length} {sortedEvents.length === 1 ? t('calendar.event') : t('calendar.events')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <XIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-xs text-text-secondary">{t('calendar.events')}</div>
              <div className="text-lg font-semibold text-text-primary">{sortedEvents.length}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-xs text-text-secondary">{t('calendar.allDay')}</div>
              <div className="text-lg font-semibold text-text-primary">{allDayEvents.length}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-xs text-text-secondary">{t('calendar.hour')}</div>
              <div className="text-lg font-semibold text-text-primary">{timedEvents.length}</div>
            </div>
          </div>

          {sortedEvents.length === 0 && (
            <div className="text-sm text-text-secondary text-center py-10">
              {t('common.noEvent')}
            </div>
          )}

          {allDayEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {t('calendar.allDay')} ({allDayEvents.length})
              </h3>
              {allDayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="relative w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                >
                  <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-xl ${typeAccentBars[event.type]}`} />
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[event.type]}`}>
                      {t(typeLabels[event.type])}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full border border-white/20 text-text-secondary bg-white/[0.04] inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[event.status]}`} />
                      {t(statusLabels[event.status])}
                    </span>
                    <span className="text-xs text-text-secondary">{t('calendar.allDay')}</span>
                  </div>
                  <div className={`font-medium text-text-primary ${event.status === 'concluido' ? 'line-through opacity-70' : ''}`}>
                    {event.title}
                  </div>
                </button>
              ))}
            </div>
          )}

          {timedEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {t('calendar.hour')} ({timedEvents.length})
              </h3>
              {timedEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="relative w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                >
                  <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-xl ${typeAccentBars[event.type]}`} />
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[event.type]}`}>
                      {t(typeLabels[event.type])}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full border border-white/20 text-text-secondary bg-white/[0.04] inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[event.status]}`} />
                      {t(statusLabels[event.status])}
                    </span>
                    {event.timeStart && (
                      <span className="text-xs text-text-secondary">
                        {event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}
                      </span>
                    )}
                  </div>
                  <div className={`font-medium text-text-primary ${event.status === 'concluido' ? 'line-through opacity-70' : ''}`}>
                    {event.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
