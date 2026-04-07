import React, { useEffect, useMemo, useState } from 'react';
import { UploadIcon, TrashIcon, FileTextIcon } from 'lucide-react';
import {
  LegalEvent,
  LegalEventType,
  LegalEventStatus,
  Attachment } from
'../../types';
import { getAllUsers } from '../../data/authData';
import { useData } from '../../context/DataContext';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import { useLanguage } from '../../context/LanguageContext';
interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
  event: Omit<LegalEvent, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  })
  => void;
  editingEvent?: LegalEvent | null;
}
const eventTypeOptions = [
{
  value: 'prazo_processual',
  label: 'Prazo Processual'
},
{
  value: 'audiencia',
  label: 'Audiência'
},
{
  value: 'reuniao',
  label: 'Reunião'
},
{
  value: 'atendimento',
  label: 'Atendimento'
},
{
  value: 'tarefa',
  label: 'Tarefa'
}];

const statusOptions: {
  value: LegalEventStatus;
  label: string;
}[] = [
{
  value: 'pendente',
  label: 'Pendente'
},
{
  value: 'em_andamento',
  label: 'Em Andamento'
},
{
  value: 'concluido',
  label: 'Concluído'
},
{
  value: 'aguardando_autorizacao',
  label: 'Aguardando Autorização'
},
{
  value: 'aguardando_documentacao',
  label: 'Aguardando Documentação'
},
{
  value: 'cartorio',
  label: 'Cartório'
},
{
  value: 'aguardando_correcao',
  label: 'Aguardando Correção'
},
{
  value: 'atrasado',
  label: 'Atrasado'
}];

export function EventModal({
  isOpen,
  onClose,
  onSave,
  editingEvent
}: EventModalProps) {
  const { t } = useLanguage();
  const { clientRecords, legalProcesses } = useData();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LegalEventType>('tarefa');
  const [status, setStatus] = useState<LegalEventStatus>('pendente');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [processId, setProcessId] = useState('');
  const [processSearch, setProcessSearch] = useState('');
  const [showProcessSuggestions, setShowProcessSuggestions] = useState(false);
  const [tribunal, setTribunal] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['u1']);
  const [observations, setObservations] = useState('');
  const [alertDaysBefore, setAlertDaysBefore] = useState(3);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Show only active users registered in the system.
  const availableUsers = useMemo(() => {
    return getAllUsers().
    filter((u) => u.active).
    map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email
    }));
  }, [isOpen]);

  const normalizeResponsibleIds = (ids: string[]): string[] => {
    const validIds = Array.from(new Set(ids)).filter((id) =>
    availableUsers.some((user) => user.id === id)
    );

    if (validIds.length > 0) return validIds;
    return availableUsers.length > 0 ? [availableUsers[0].id] : [];
  };

  const availableClients = useMemo(() => {
    return clientRecords.filter((c) => !c.deletedAt && c.status === 'ativo');
  }, [clientRecords]);

  const availableProcesses = useMemo(() => {
    if (!clientId) return legalProcesses;
    return legalProcesses.filter((p) => p.client === clientId);
  }, [legalProcesses, clientId]);

  const getClientNameById = (id: string) => {
    return availableClients.find((c) => c.id === id)?.name || '';
  };

  const getProcessLabel = (process: { number: string; title?: string; description: string }) => {
    const titleOrDescription = process.title || process.description;
    if (!titleOrDescription) return process.number;
    return `${process.number} - ${titleOrDescription}`;
  };

  const processSuggestions = useMemo(() => {
    const query = processSearch.trim().toLowerCase();
    if (!query) return availableProcesses.slice(0, 10);
    return availableProcesses.filter((p) =>
    p.number.toLowerCase().includes(query) ||
    (p.title || '').toLowerCase().includes(query) ||
    (p.description || '').toLowerCase().includes(query)
    ).slice(0, 10);
  }, [availableProcesses, processSearch]);

  const clientSuggestions = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return availableClients.slice(0, 10);
    return availableClients.filter((c) =>
    c.name.toLowerCase().includes(query) ||
    c.cpf.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
    ).slice(0, 10);
  }, [availableClients, clientSearch]);

  const handleClientSearchChange = (value: string) => {
    const matchedClient = availableClients.find(
      (c) => c.name.toLowerCase() === value.trim().toLowerCase()
    );

    setClientSearch(value);
    setClientId(matchedClient?.id || '');
    setProcessId('');
    setProcessSearch('');
    setShowProcessSuggestions(false);

    if (!matchedClient) {
      setTribunal('');
    }
  };

  const handleClientSelect = (selectedClientId: string) => {
    const selectedClient = availableClients.find((c) => c.id === selectedClientId);
    if (!selectedClient) return;
    setClientId(selectedClient.id);
    setClientSearch(selectedClient.name);
    setProcessId('');
    setProcessSearch('');
    setShowClientSuggestions(false);
  };

  const handleProcessSearchChange = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const matchedProcess = availableProcesses.find((p) =>
    getProcessLabel(p).toLowerCase() === normalized
    );

    setProcessSearch(value);
    setProcessId(matchedProcess?.id || '');
    if (matchedProcess?.tribunal) {
      setTribunal(matchedProcess.tribunal);
    }
  };

  const handleProcessSelect = (selectedProcessId: string) => {
    const selectedProcess = availableProcesses.find((p) => p.id === selectedProcessId);
    if (!selectedProcess) return;
    setProcessId(selectedProcess.id);
    setProcessSearch(getProcessLabel(selectedProcess));
    if (selectedProcess.tribunal) {
      setTribunal(selectedProcess.tribunal);
    }
    setShowProcessSuggestions(false);
  };

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setType(editingEvent.type);
      setStatus(editingEvent.status);
      setDateStart(editingEvent.dateStart);
      setDateEnd(editingEvent.dateEnd);
      setAllDay(editingEvent.allDay);
      setTimeStart(editingEvent.timeStart || '');
      setTimeEnd(editingEvent.timeEnd || '');
      const nextClientId = editingEvent.clientId || '';
      const nextProcessId = editingEvent.processId || '';
      setClientId(nextClientId);
      setClientSearch(nextClientId ? getClientNameById(nextClientId) : '');
      setProcessId(nextProcessId);
      const process = legalProcesses.find((p) => p.id === nextProcessId);
      setProcessSearch(process ? getProcessLabel(process) : '');
      setTribunal(editingEvent.tribunal || '');
      const initialIds =
      editingEvent.responsibleIds ||
      (editingEvent.responsibleId ? [editingEvent.responsibleId] : []);
      setSelectedUserIds(
        normalizeResponsibleIds(initialIds)
      );
      setObservations(editingEvent.observations || '');
      setAlertDaysBefore(editingEvent.alertDaysBefore);
      setAttachments(editingEvent.attachments);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setType('tarefa');
      setStatus('pendente');
      setDateStart(today);
      setDateEnd(today);
      setAllDay(true);
      setTimeStart('');
      setTimeEnd('');
      setClientId('');
      setClientSearch('');
      setProcessId('');
      setProcessSearch('');
      setTribunal('');
      setSelectedUserIds(availableUsers.length > 0 ? [availableUsers[0].id] : []);
      setObservations('');
      setAlertDaysBefore(3);
      setAttachments([]);
    }
  }, [editingEvent, isOpen, availableUsers, legalProcesses, availableClients]);
  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        // Don't allow removing the last user
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (isImage || isPdf) {
        const attachment: Attachment = {
          id: `att-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: isImage ? 'image' : 'pdf',
          url: URL.createObjectURL(file)
        };
        setAttachments((prev) => [...prev, attachment]);
      }
    });
  };
  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };
  const handleSubmit = () => {
    if (!title.trim() || !dateStart || !dateEnd || selectedUserIds.length === 0)
    return;
    const eventData: Omit<LegalEvent, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    } = {
      id: editingEvent?.id,
      title,
      type,
      status,
      dateStart,
      dateEnd,
      allDay,
      timeStart: allDay ? undefined : timeStart || undefined,
      timeEnd: allDay ? undefined : timeEnd || undefined,
      clientId: clientId || undefined,
      processId: processId || undefined,
      tribunal: tribunal || undefined,
      responsibleId: selectedUserIds[0],
      responsibleIds: selectedUserIds,
      observations: observations || undefined,
      alertDaysBefore,
      attachments
    };
    onSave(eventData);
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? (t('common.edit') || 'Edit Event') : (t('calendar.newEvent') || 'New Event')}
      size="xl">
      
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            {t('calendar.basicInfo') || 'Basic Information'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={t('calendar.eventTitle') || 'Event title'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('calendar.eventTitle') || 'Event title'} />
              
            </div>
            <Select
              label={t('calendar.eventType') || 'Event Type'}
              value={type}
              onChange={(e) => setType(e.target.value as LegalEventType)}
              options={eventTypeOptions} />
            
            <Select
              label={t('calendar.status') || 'Status'}
              value={status}
              onChange={(e) => setStatus(e.target.value as LegalEventStatus)}
              options={statusOptions} />
            
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            {t('calendar.datesAndTimes') || 'Dates and Times'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('calendar.startDate') || 'Start Date'}
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)} />
            
            <Input
              label={t('calendar.endDate') || 'End Date'}
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)} />
            
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-blue focus:ring-accent-blue/30" />
            
            <span className="text-sm text-text-primary">{t('calendar.allDay') || 'All day'}</span>
          </label>

          {!allDay &&
          <div className="grid grid-cols-2 gap-4">
              <Input
              label={t('calendar.startTime') || 'Start time'}
              type="time"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)} />
            
              <Input
              label={t('calendar.endTime') || 'End time'}
              type="time"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)} />
            
            </div>
          }
        </div>

        {/* Relations */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            {t('calendar.relations') || 'Relations'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label={t('calendar.client') || 'Client'}
                value={clientSearch}
                onChange={(e) => handleClientSearchChange(e.target.value)}
                onFocus={() => setShowClientSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowClientSuggestions(false), 120);
                }}
                placeholder={t('calendar.selectClient') || 'Select a client'} />

              {showClientSuggestions && clientSuggestions.length > 0 &&
              <div className="absolute z-30 mt-2 w-full glass-strong rounded-xl border border-white/10 shadow-lg overflow-hidden">
                  {clientSuggestions.map((client) =>
                <button
                  key={client.id}
                  type="button"
                  className="w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleClientSelect(client.id);
                  }}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-text-primary truncate">{client.name}</span>
                        <span className="text-xs text-text-secondary">{client.cpf}</span>
                      </div>
                    </button>
                )}
                </div>
              }
            </div>

            <div className="relative">
              <Input
                label={t('calendar.process') || 'Process'}
                value={processSearch}
                onChange={(e) => handleProcessSearchChange(e.target.value)}
                onFocus={() => setShowProcessSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowProcessSuggestions(false), 120);
                }}
                placeholder={t('calendar.selectProcess') || 'Select a process'} />

              {showProcessSuggestions && processSuggestions.length > 0 &&
              <div className="absolute z-30 mt-2 w-full glass-strong rounded-xl border border-white/10 shadow-lg overflow-hidden">
                  {processSuggestions.map((process) =>
                <button
                  key={process.id}
                  type="button"
                  className="w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleProcessSelect(process.id);
                  }}>
                      <div className="text-sm text-text-primary truncate">{getProcessLabel(process)}</div>
                    </button>
                )}
                </div>
              }
            </div>
            
            <Input
              label={t('calendar.court') || 'Court'}
              value={tribunal}
              onChange={(e) => setTribunal(e.target.value)}
              placeholder={t('calendar.courtPlaceholder') || 'Ex: State Court, Labor Court'} />
            
          </div>
        </div>

        {/* Responsible Users (Multi-select) */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            {t('calendar.responsible') || 'Responsible'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableUsers.map((user) =>
            <label
              key={user.id}
              className={`
                  flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                  ${selectedUserIds.includes(user.id) ? 'bg-accent-blue/20 border border-accent-blue/30' : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.05]'}
                `}>
              
                <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => handleUserToggle(user.id)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-blue focus:ring-accent-blue/30" />
              
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent-blue">
                      {user.name.
                    split(' ').
                    map((n) => n[0]).
                    join('').
                    slice(0, 2)}
                    </span>
                  </div>
                  <span className="text-sm text-text-primary">{user.name}</span>
                </div>
              </label>
            )}
          </div>
          {selectedUserIds.length === 0 &&
          <p className="text-sm text-accent-red">
              {t('calendar.selectAtLeastOneResponsible') || 'Select at least one responsible user'}
            </p>
          }
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">{t('calendar.details') || 'Details'}</h4>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('calendar.observations') || 'Notes'}
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder={t('calendar.observationsPlaceholder') || 'Notes about the event...'}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
              rows={3} />
            
          </div>

          <Input
            label={t('calendar.alertDaysBefore') || 'Alert in advance (business days)'}
            type="number"
            min={0}
            max={30}
            value={alertDaysBefore.toString()}
            onChange={(e) => setAlertDaysBefore(parseInt(e.target.value) || 0)} />
          

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('calendar.attachments') || 'Attachments'}
            </label>
            <div className="space-y-2">
              {attachments.map((att) =>
              <div
                key={att.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                
                  <div className="flex items-center gap-2">
                    {att.type === 'image' ?
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-10 h-10 rounded object-cover" /> :


                  <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center">
                        <FileTextIcon className="w-5 h-5 text-red-400" />
                      </div>
                  }
                    <span className="text-sm text-text-primary truncate max-w-[200px]">
                      {att.name}
                    </span>
                  </div>
                  <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors">
                  
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-accent-blue/50 cursor-pointer transition-colors">
                <UploadIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-secondary">
                  {t('calendar.clickToAddFiles') || 'Click to add files'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden" />
                
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingEvent ? (t('common.save') || 'Save') : (t('calendar.createEvent') || 'Create Event')}
          </Button>
        </div>
      </div>
    </Modal>);

}