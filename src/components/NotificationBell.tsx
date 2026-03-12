import React, { useMemo, useState } from 'react';
import {
  BellIcon,
  XIcon,
  AlertTriangleIcon,
  CalendarIcon,
  ClockIcon } from
'lucide-react';
import { useData } from '../context/DataContext';
import { isEventOverdue } from '../utils/legalDeadlines';
export function NotificationBell() {
  const { legalEvents } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const items: {
      id: string;
      title: string;
      type: 'overdue' | 'upcoming' | 'today';
      date: string;
    }[] = [];
    legalEvents.forEach((event) => {
      if (event.status === 'concluido') return;
      const eventDate = new Date(event.dateEnd);
      eventDate.setHours(0, 0, 0, 0);
      if (isEventOverdue(event.dateEnd, event.status)) {
        items.push({
          id: event.id,
          title: event.title,
          type: 'overdue',
          date: event.dateEnd
        });
      } else if (eventDate.getTime() === today.getTime()) {
        items.push({
          id: event.id,
          title: event.title,
          type: 'today',
          date: event.dateEnd
        });
      } else if (eventDate > today && eventDate <= nextWeek) {
        items.push({
          id: event.id,
          title: event.title,
          type: 'upcoming',
          date: event.dateEnd
        });
      }
    });
    // Sort: overdue first, then today, then upcoming
    return items.sort((a, b) => {
      const order = {
        overdue: 0,
        today: 1,
        upcoming: 2
      };
      return order[a.type] - order[b.type];
    });
  }, [legalEvents]);
  const overdueCount = notifications.filter((n) => n.type === 'overdue').length;
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
        aria-label="Notificações">
        
        <BellIcon className="w-5 h-5 text-[var(--text-secondary)]" />
        {notifications.length > 0 &&
        <span
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center text-white ${overdueCount > 0 ? 'bg-[var(--accent-red)]' : 'bg-[var(--accent-blue)]'}`}>
          
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        }
      </button>

      {isOpen &&
      <>
          <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)} />
        
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto glass-strong rounded-xl border border-[var(--glass-border)] shadow-lg z-50">
            <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">
                Notificações
              </h3>
              <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-[var(--glass-bg)]">
              
                <XIcon className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>

            {notifications.length === 0 ?
          <div className="p-6 text-center">
                <BellIcon className="w-10 h-10 text-[var(--text-secondary)]/30 mx-auto mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">
                  Nenhuma notificação
                </p>
              </div> :

          <div className="divide-y divide-[var(--glass-border)]">
                {notifications.slice(0, 10).map((notification) =>
            <div
              key={notification.id}
              className="p-3 hover:bg-[var(--glass-bg)] transition-colors">
              
                    <div className="flex items-start gap-3">
                      <div
                  className={`p-1.5 rounded-lg ${notification.type === 'overdue' ? 'bg-[var(--accent-red)]/20' : notification.type === 'today' ? 'bg-[var(--accent-orange)]/20' : 'bg-[var(--accent-blue)]/20'}`}>
                  
                        {notification.type === 'overdue' ?
                  <AlertTriangleIcon className="w-4 h-4 text-[var(--accent-red)]" /> :
                  notification.type === 'today' ?
                  <ClockIcon className="w-4 h-4 text-[var(--accent-orange)]" /> :

                  <CalendarIcon className="w-4 h-4 text-[var(--accent-blue)]" />
                  }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {notification.title}
                        </p>
                        <p
                    className={`text-xs ${notification.type === 'overdue' ? 'text-[var(--accent-red)]' : notification.type === 'today' ? 'text-[var(--accent-orange)]' : 'text-[var(--text-secondary)]'}`}>
                    
                          {notification.type === 'overdue' && 'Atrasado • '}
                          {notification.type === 'today' && 'Hoje • '}
                          {new Date(notification.date).toLocaleDateString(
                      'pt-BR'
                    )}
                        </p>
                      </div>
                    </div>
                  </div>
            )}
              </div>
          }
          </div>
        </>
      }
    </div>);

}