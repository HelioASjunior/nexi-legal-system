import React, { useMemo, useState } from 'react';
import { CalendarIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
import { LegalEvent } from '../../types';
import {
  calculateDeadline,
  calculateAlertDate,
  NATIONAL_HOLIDAYS,
  formatDateToISO,
  getHolidayName } from
'../../utils/legalDeadlines';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
interface DeadlineCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (
  event: Omit<LegalEvent, 'id' | 'createdAt' | 'updatedAt'>)
  => void;
}
export function DeadlineCalculator({
  isOpen,
  onClose,
  onCreateEvent
}: DeadlineCalculatorProps) {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [businessDays, setBusinessDays] = useState(15);
  const [alertDaysBefore, setAlertDaysBefore] = useState(3);
  const [title, setTitle] = useState('');
  const calculation = useMemo(() => {
    if (!startDate || businessDays <= 0) return null;
    const start = new Date(startDate + 'T12:00:00');
    const deadline = calculateDeadline(start, businessDays, NATIONAL_HOLIDAYS);
    const alertDate = calculateAlertDate(
      deadline,
      alertDaysBefore,
      NATIONAL_HOLIDAYS
    );
    // Find holidays in the range
    const holidaysInRange: {
      date: string;
      name: string;
    }[] = [];
    const current = new Date(start);
    while (current <= deadline) {
      const holidayName = getHolidayName(current, NATIONAL_HOLIDAYS);
      if (holidayName) {
        holidaysInRange.push({
          date: formatDateToISO(current),
          name: holidayName
        });
      }
      current.setDate(current.getDate() + 1);
    }
    // Count calendar days
    const calendarDays = Math.ceil(
      (deadline.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      startDate: formatDateToISO(start),
      deadline: formatDateToISO(deadline),
      alertDate: formatDateToISO(alertDate),
      calendarDays,
      businessDays,
      holidaysInRange
    };
  }, [startDate, businessDays, alertDaysBefore]);
  const handleCreateEvent = () => {
    if (!calculation || !title.trim()) return;
    const event: Omit<LegalEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      type: 'prazo_processual',
      dateStart: calculation.startDate,
      dateEnd: calculation.deadline,
      allDay: true,
      responsibleId: 'u1',
      status: 'pendente',
      alertDaysBefore,
      attachments: [],
      observations: `Prazo calculado: ${businessDays} dias úteis a partir de ${new Date(calculation.startDate).toLocaleDateString('pt-BR')}`
    };
    onCreateEvent(event);
    onClose();
    setTitle('');
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calculadora de Prazos"
      size="md">
      
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)} />
            
            <Input
              label="Dias Úteis"
              type="number"
              min={1}
              max={365}
              value={businessDays.toString()}
              onChange={(e) => setBusinessDays(parseInt(e.target.value) || 0)} />
            
          </div>
          <Input
            label="Alertar com antecedência (dias úteis)"
            type="number"
            min={0}
            max={30}
            value={alertDaysBefore.toString()}
            onChange={(e) => setAlertDaysBefore(parseInt(e.target.value) || 0)} />
          
        </div>

        {/* Result Section */}
        {calculation &&
        <div className="space-y-4">
            <div className="glass-strong rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-text-secondary">
                Resultado do Cálculo
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-xs text-text-secondary mb-1">
                    Data do Prazo
                  </div>
                  <div className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {new Date(
                    calculation.deadline + 'T12:00:00'
                  ).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-xs text-text-secondary mb-1">
                    Data do Alerta
                  </div>
                  <div className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5" />
                    {new Date(
                    calculation.alertDate + 'T12:00:00'
                  ).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span>Dias corridos: {calculation.calendarDays}</span>
                <span>•</span>
                <span>Dias úteis: {calculation.businessDays}</span>
              </div>

              {calculation.holidaysInRange.length > 0 &&
            <div className="pt-3 border-t border-white/10">
                  <div className="text-xs text-text-secondary mb-2">
                    Feriados no período ({calculation.holidaysInRange.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {calculation.holidaysInRange.map((h) =>
                <span
                  key={h.date}
                  className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                  
                        {new Date(h.date + 'T12:00:00').toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: 'short'
                    }
                  )}{' '}
                        - {h.name}
                      </span>
                )}
                  </div>
                </div>
            }
            </div>

            {/* Create Event Section */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-text-secondary">
                Criar Evento a partir do Cálculo
              </h4>
              <Input
              label="Título do Prazo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Contestação - Processo nº..." />
            
              <Button
              variant="primary"
              onClick={handleCreateEvent}
              disabled={!title.trim()}
              icon={<CheckCircleIcon className="w-4 h-4" />}
              className="w-full">
              
                Criar Evento de Prazo
              </Button>
            </div>
          </div>
        }

        {/* Info */}
        <div className="text-xs text-text-secondary bg-white/5 rounded-lg p-3">
          <strong>Nota:</strong> O cálculo considera apenas dias úteis,
          excluindo sábados, domingos e feriados nacionais. Para prazos
          específicos de tribunais, verifique o calendário oficial.
        </div>
      </div>
    </Modal>);

}