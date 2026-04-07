import { useMemo } from 'react';
import { LegalEvent, LegalEventType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  NATIONAL_HOLIDAYS,
  getHolidayName } from
'../../utils/legalDeadlines';
// TODO: substituir por useData().legalClients para exibir dados reais do banco
import { mockLegalClients } from '../../data/legalMockData';
interface CalendarDayViewProps {
  currentDate: Date;
  events: LegalEvent[];
  onEventClick: (event: LegalEvent) => void;
}
const HOURS = Array.from(
  {
    length: 14
  },
  (_, i) => i + 7
);
const typeColors: Record<LegalEventType, string> = {
  prazo_processual: 'bg-red-500/30 border-red-500/50 text-red-300',
  audiencia: 'bg-purple-500/30 border-purple-500/50 text-purple-300',
  reuniao: 'bg-blue-500/30 border-blue-500/50 text-blue-300',
  atendimento: 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300',
  tarefa: 'bg-orange-500/30 border-orange-500/50 text-orange-300'
};
const typeLabels: Record<LegalEventType, string> = {
  prazo_processual: 'calendar.type.deadline',
  audiencia: 'calendar.type.hearing',
  reuniao: 'calendar.type.meeting',
  atendimento: 'calendar.type.attendance',
  tarefa: 'calendar.type.task'
};
export function CalendarDayView({
  currentDate,
  events,
  onEventClick
}: CalendarDayViewProps) {
  const { t } = useLanguage();
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayEvents = useMemo(() => {
    return events.filter((e) => dateStr >= e.dateStart && dateStr <= e.dateEnd);
  }, [events, dateStr]);
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay && e.timeStart);
  const getEventPosition = (event: LegalEvent) => {
    if (!event.timeStart)
    return {
      top: 0,
      height: 60
    };
    const [startHour, startMin] = event.timeStart.split(':').map(Number);
    const [endHour, endMin] = (event.timeEnd || event.timeStart).
    split(':').
    map(Number);
    const startOffset = (startHour - 7) * 60 + startMin;
    const endOffset = (endHour - 7) * 60 + endMin;
    const duration = Math.max(endOffset - startOffset, 30);
    return {
      top: startOffset,
      height: duration
    };
  };
  const holidayName = getHolidayName(currentDate, NATIONAL_HOLIDAYS);
  const now = new Date();
  const isToday = currentDate.toDateString() === now.toDateString();
  const currentTimeOffset = (now.getHours() - 7) * 60 + now.getMinutes();
  const showCurrentTime =
  isToday && currentTimeOffset >= 0 && currentTimeOffset <= 13 * 60;
  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    const client = mockLegalClients.find((c) => c.id === clientId);
    return client?.name;
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Time Grid */}
      <div className="lg:col-span-2 glass rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {currentDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h3>
              {holidayName &&
              <span className="text-sm text-amber-400">{holidayName}</span>
              }
            </div>
            <span className="text-sm text-text-secondary">
                {dayEvents.length} {dayEvents.length === 1 ? (t('calendar.event') || 'event') : (t('calendar.events') || 'events')}
            </span>
          </div>
        </div>

        {/* All-day events */}
        {allDayEvents.length > 0 &&
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="text-xs text-text-secondary mb-2">{t('calendar.allDay') || 'All day'}</div>
            <div className="space-y-2">
              {allDayEvents.map((event) =>
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`
                    w-full text-left px-3 py-2 rounded-lg border
                    transition-all hover:opacity-80
                    ${typeColors[event.type]}
                    ${event.status === 'concluido' ? 'opacity-50 line-through' : ''}
                  `}>
              
                  <div className="font-medium">{event.title}</div>
                  {event.clientId &&
              <div className="text-xs opacity-80">
                      {getClientName(event.clientId)}
                    </div>
              }
                </button>
            )}
            </div>
          </div>
        }

        {/* Time grid */}
        <div
          className="relative"
          style={{
            height: '780px'
          }}>
          
          {/* Hour lines */}
          {HOURS.map((hour) =>
          <div key={hour} className="h-[60px] border-b border-white/5 flex">
              <div className="w-16 px-2 flex items-start justify-end border-r border-white/10">
                <span className="text-xs text-text-secondary -mt-2">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex-1" />
            </div>
          )}

          {/* Current time indicator */}
          {showCurrentTime &&
          <div
            className="absolute left-16 right-0 z-10 flex items-center"
            style={{
              top: `${currentTimeOffset}px`
            }}>
            
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          }

          {/* Timed events */}
          {timedEvents.map((event) => {
            const pos = getEventPosition(event);
            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`
                  absolute left-20 right-4 rounded-lg px-3 py-2 text-sm
                  border overflow-hidden transition-all hover:z-20 hover:shadow-lg
                  ${typeColors[event.type]}
                  ${event.status === 'concluido' ? 'opacity-50' : ''}
                `}
                style={{
                  top: `${pos.top}px`,
                  height: `${pos.height}px`,
                  minHeight: '40px'
                }}>
                
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-xs opacity-80">
                  {event.timeStart} - {event.timeEnd}
                </div>
                {pos.height > 60 && event.clientId &&
                <div className="text-xs opacity-70 mt-1">
                    {getClientName(event.clientId)}
                  </div>
                }
              </button>);

          })}
        </div>
      </div>

      {/* Event List Sidebar */}
      <div className="glass rounded-2xl border border-white/10 p-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('calendar.dayEvents') || 'Day Events'}
        </h3>

        {dayEvents.length === 0 ?
            <p className="text-text-secondary text-sm text-center py-8">
            {t('common.noEvent')}
          </p> :

        <div className="space-y-3">
            {dayEvents.
          sort((a, b) => {
            if (a.allDay && !b.allDay) return -1;
            if (!a.allDay && b.allDay) return 1;
            if (a.timeStart && b.timeStart)
            return a.timeStart.localeCompare(b.timeStart);
            return 0;
          }).
          map((event) =>
          <div
            key={event.id}
            onClick={() => onEventClick(event)}
            className={`
                    p-3 rounded-xl border cursor-pointer
                    transition-all hover:scale-[1.02]
                    ${typeColors[event.type]}
                    ${event.status === 'concluido' ? 'opacity-60' : ''}
                  `}>
            
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {typeLabels[event.type]}
                    </span>
                    {!event.allDay && event.timeStart &&
              <span className="text-xs opacity-80">
                        {event.timeStart}
                      </span>
              }
                  </div>
                  <div
              className={`font-medium ${event.status === 'concluido' ? 'line-through' : ''}`}>
              
                    {event.title}
                  </div>
                  {event.clientId &&
            <div className="text-xs opacity-70 mt-1">
                      {getClientName(event.clientId)}
                    </div>
            }
                </div>
          )}
          </div>
        }
      </div>
    </div>);

}