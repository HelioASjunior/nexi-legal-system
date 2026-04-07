import React, { useMemo, useState } from 'react';
import { LegalEvent } from '../../types';
import { NATIONAL_HOLIDAYS, getHolidayName } from '../../utils/legalDeadlines';
import { EventCard } from './EventCard';
import { useLanguage } from '../../context/LanguageContext';
interface CalendarMonthViewProps {
  currentDate: Date;
  events: LegalEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: LegalEvent) => void;
  onEventDrop?: (eventId: string, newDate: Date) => void;
  selectedDate: Date | null;
}
const WEEKDAY_KEYS = [
  'calendar.weekday.sun',
  'calendar.weekday.mon',
  'calendar.weekday.tue',
  'calendar.weekday.wed',
  'calendar.weekday.thu',
  'calendar.weekday.fri',
  'calendar.weekday.sat',
];
export function CalendarMonthView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
  onEventDrop,
  selectedDate
}: CalendarMonthViewProps) {
  const { t } = useLanguage();
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays: {
      day: number;
      isCurrentMonth: boolean;
      date: Date;
    }[] = [];
    for (let i = startingDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      prevMonthDays.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month - 1, day)
      });
    }
    const currentMonthDays: {
      day: number;
      isCurrentMonth: boolean;
      date: Date;
    }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - totalDays % 7;
    const nextMonthDays: {
      day: number;
      isCurrentMonth: boolean;
      date: Date;
    }[] = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [year, month]);
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => {
      return dateStr >= e.dateStart && dateStr <= e.dateEnd;
    });
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) =>
  selectedDate?.toDateString() === date.toDateString();
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };
  const handleDragStart = (e: React.DragEvent, event: LegalEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('eventId', event.id);
    e.dataTransfer.setData('eventDateStart', event.dateStart);
    e.dataTransfer.setData('eventDateEnd', event.dateEnd);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const dateStr = date.toISOString().split('T')[0];
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };
  const handleDragLeave = () => {
    setDragOverDate(null);
  };
  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    setDragOverDate(null);
    const eventId = e.dataTransfer.getData('eventId');
    if (!eventId || !onEventDrop) return;
    onEventDrop(eventId, targetDate);
  };
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-white/10">
        {WEEKDAY_KEYS.map((dayKey, index) =>
        <div
          key={dayKey}
          className={`p-3 text-center text-sm font-medium ${index === 0 || index === 6 ? 'text-text-secondary/70 bg-white/[0.02]' : 'text-text-secondary'}`}>
          
            {t(dayKey)}
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayInfo, index) => {
          const dayEvents = getEventsForDate(dayInfo.date);
          const holidayName = getHolidayName(dayInfo.date, NATIONAL_HOLIDAYS);
          const dateStr = dayInfo.date.toISOString().split('T')[0];
          const isDragTarget = dragOverDate === dateStr;
          return (
            <div
              key={index}
              onDragOver={(e) => handleDragOver(e, dayInfo.date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dayInfo.date)}
              className={`
                min-h-28 p-2 border-b border-r border-white/5 cursor-pointer
                transition-all duration-200
                ${!dayInfo.isCurrentMonth ? 'opacity-40' : ''}
                ${isWeekend(dayInfo.date) ? 'bg-white/[0.02]' : ''}
                ${isSelected(dayInfo.date) ? 'bg-accent-blue/10' : 'hover:bg-white/5'}
                ${isDragTarget ? 'bg-accent-blue/20 ring-2 ring-accent-blue/40 ring-inset' : ''}
              `}>
              
              <div className="flex items-start justify-between mb-1">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onDayClick(dayInfo.date);
                  }}
                  className={`
                    inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                    cursor-pointer hover:bg-white/10
                    ${isToday(dayInfo.date) ? 'bg-accent-blue text-white font-semibold' : 'text-text-primary'}
                    ${isSelected(dayInfo.date) && !isToday(dayInfo.date) ? 'ring-2 ring-accent-blue/50' : ''}
                  `}>
                  
                  {dayInfo.day}
                </span>
                {holidayName &&
                <span
                  className="text-[10px] text-amber-400 truncate max-w-[60px]"
                  title={holidayName}>
                  
                    {holidayName.split(' ')[0]}
                  </span>
                }
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) =>
                <div
                  key={event.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, event)}
                  className="cursor-grab active:cursor-grabbing">
                  
                    <EventCard
                    event={event}
                    onClick={() => onEventClick(event)}
                    compact />
                  
                  </div>
                )}
                {dayEvents.length > 3 &&
                <div className="text-xs text-text-secondary pl-1">
                    +{dayEvents.length - 3} {t('common.more') || 'more'}
                  </div>
                }
              </div>
            </div>);

        })}
      </div>
    </div>);

}