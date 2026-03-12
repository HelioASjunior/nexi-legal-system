import React, { useMemo } from 'react';
import { LegalEvent, LegalEventType } from '../../types';
import { NATIONAL_HOLIDAYS, getHolidayName } from '../../utils/legalDeadlines';
interface CalendarWeekViewProps {
  currentDate: Date;
  events: LegalEvent[];
  onEventClick: (event: LegalEvent) => void;
}
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from(
  {
    length: 14
  },
  (_, i) => i + 7
); // 7:00 to 20:00
const typeColors: Record<LegalEventType, string> = {
  prazo_processual: 'bg-red-500/30 border-red-500/50 text-red-300',
  audiencia: 'bg-purple-500/30 border-purple-500/50 text-purple-300',
  reuniao: 'bg-blue-500/30 border-blue-500/50 text-blue-300',
  tarefa: 'bg-orange-500/30 border-orange-500/50 text-orange-300'
};
export function CalendarWeekView({
  currentDate,
  events,
  onEventClick
}: CalendarWeekViewProps) {
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    return Array.from(
      {
        length: 7
      },
      (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
      }
    );
  }, [currentDate]);
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => {
      return dateStr >= e.dateStart && dateStr <= e.dateEnd;
    });
  };
  const getAllDayEvents = (date: Date) => {
    return getEventsForDate(date).filter((e) => e.allDay);
  };
  const getTimedEvents = (date: Date) => {
    return getEventsForDate(date).filter((e) => !e.allDay && e.timeStart);
  };
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const now = new Date();
  const currentTimeOffset = (now.getHours() - 7) * 60 + now.getMinutes();
  const showCurrentTime = currentTimeOffset >= 0 && currentTimeOffset <= 13 * 60;
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-white/10">
        <div className="p-3 text-center text-sm font-medium text-text-secondary border-r border-white/10">
          Hora
        </div>
        {weekDays.map((date, index) => {
          const holidayName = getHolidayName(date, NATIONAL_HOLIDAYS);
          return (
            <div
              key={index}
              className={`
                p-3 text-center border-r border-white/5 last:border-r-0
                ${isToday(date) ? 'bg-accent-blue/10' : ''}
              `}>
              
              <div className="text-sm font-medium text-text-secondary">
                {WEEKDAYS[index]}
              </div>
              <div
                className={`text-lg font-semibold ${isToday(date) ? 'text-accent-blue' : 'text-text-primary'}`}>
                
                {date.getDate()}
              </div>
              {holidayName &&
              <div className="text-[10px] text-amber-400 truncate">
                  {holidayName.split(' ')[0]}
                </div>
              }
            </div>);

        })}
      </div>

      {/* All-day events row */}
      <div className="grid grid-cols-8 border-b border-white/10 min-h-[60px]">
        <div className="p-2 text-xs text-text-secondary border-r border-white/10 flex items-center justify-center">
          Dia todo
        </div>
        {weekDays.map((date, index) => {
          const allDayEvents = getAllDayEvents(date);
          return (
            <div
              key={index}
              className="p-1 border-r border-white/5 last:border-r-0 space-y-1">
              
              {allDayEvents.slice(0, 2).map((event) =>
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`
                    w-full text-left px-2 py-1 rounded text-xs truncate
                    border transition-all hover:opacity-80
                    ${typeColors[event.type]}
                    ${event.status === 'concluido' ? 'opacity-50 line-through' : ''}
                  `}>
                
                  {event.title}
                </button>
              )}
              {allDayEvents.length > 2 &&
              <div className="text-[10px] text-text-secondary text-center">
                  +{allDayEvents.length - 2}
                </div>
              }
            </div>);

        })}
      </div>

      {/* Time grid */}
      <div
        className="grid grid-cols-8 relative"
        style={{
          height: '780px'
        }}>
        
        {/* Time labels */}
        <div className="border-r border-white/10">
          {HOURS.map((hour) =>
          <div
            key={hour}
            className="h-[60px] border-b border-white/5 px-2 flex items-start justify-end">
            
              <span className="text-xs text-text-secondary -mt-2">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          )}
        </div>

        {/* Day columns */}
        {weekDays.map((date, dayIndex) => {
          const timedEvents = getTimedEvents(date);
          return (
            <div
              key={dayIndex}
              className={`
                relative border-r border-white/5 last:border-r-0
                ${isToday(date) ? 'bg-accent-blue/5' : ''}
              `}>
              
              {/* Hour lines */}
              {HOURS.map((hour) =>
              <div key={hour} className="h-[60px] border-b border-white/5" />
              )}

              {/* Current time indicator */}
              {isToday(date) && showCurrentTime &&
              <div
                className="absolute left-0 right-0 z-10 flex items-center"
                style={{
                  top: `${currentTimeOffset}px`
                }}>
                
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="flex-1 h-0.5 bg-red-500" />
                </div>
              }

              {/* Events */}
              {timedEvents.map((event) => {
                const pos = getEventPosition(event);
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`
                      absolute left-1 right-1 rounded-lg px-2 py-1 text-xs
                      border overflow-hidden transition-all hover:z-20 hover:shadow-lg
                      ${typeColors[event.type]}
                      ${event.status === 'concluido' ? 'opacity-50' : ''}
                    `}
                    style={{
                      top: `${pos.top}px`,
                      height: `${pos.height}px`,
                      minHeight: '24px'
                    }}>
                    
                    <div className="font-medium truncate">{event.title}</div>
                    {pos.height > 40 &&
                    <div className="text-[10px] opacity-80">
                        {event.timeStart} - {event.timeEnd}
                      </div>
                    }
                  </button>);

              })}
            </div>);

        })}
      </div>
    </div>);

}