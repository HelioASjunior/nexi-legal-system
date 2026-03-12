import React, { useEffect, useMemo, useState } from 'react';
import { UploadIcon, TrashIcon, FileTextIcon } from 'lucide-react';
import {
  LegalEvent,
  LegalEventType,
  LegalEventStatus,
  Attachment } from
'../../types';
import {
  mockLegalClients,
  mockLegalProcesses,
  mockLegalUsers } from
'../../data/legalMockData';
import { getAllUsers } from '../../data/authData';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
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
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LegalEventType>('tarefa');
  const [status, setStatus] = useState<LegalEventStatus>('pendente');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [clientId, setClientId] = useState('');
  const [processId, setProcessId] = useState('');
  const [tribunal, setTribunal] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['u1']);
  const [observations, setObservations] = useState('');
  const [alertDaysBefore, setAlertDaysBefore] = useState(3);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  // Get all available users (combine system users with legal users)
  const availableUsers = useMemo(() => {
    const authUsers = getAllUsers();
    // Map auth users to a format compatible with legal users
    const mappedAuthUsers = authUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email
    }));
    // Combine with mock legal users, avoiding duplicates by name
    const combined = [...mockLegalUsers];
    mappedAuthUsers.forEach((au) => {
      if (!combined.find((u) => u.name === au.name)) {
        combined.push({
          ...au,
          role: 'usuario' as const
        });
      }
    });
    return combined;
  }, []);
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
      setClientId(editingEvent.clientId || '');
      setProcessId(editingEvent.processId || '');
      setTribunal(editingEvent.tribunal || '');
      setSelectedUserIds(
        editingEvent.responsibleIds || [editingEvent.responsibleId]
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
      setProcessId('');
      setTribunal('');
      setSelectedUserIds(['u1']);
      setObservations('');
      setAlertDaysBefore(3);
      setAttachments([]);
    }
  }, [editingEvent, isOpen]);
  const filteredProcesses = useMemo(() => {
    if (!clientId) return mockLegalProcesses;
    return mockLegalProcesses.filter((p) => p.client === clientId);
  }, [clientId]);
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    setProcessId('');
    if (newClientId) {
      const process = mockLegalProcesses.find((p) => p.client === newClientId);
      if (process) {
        setTribunal(process.tribunal);
      }
    }
  };
  const handleProcessChange = (newProcessId: string) => {
    setProcessId(newProcessId);
    const process = mockLegalProcesses.find((p) => p.id === newProcessId);
    if (process) {
      setTribunal(process.tribunal);
    }
  };
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
      title={editingEvent ? 'Editar Evento' : 'Novo Evento'}
      size="xl">
      
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            Informações Básicas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do evento" />
              
            </div>
            <Select
              label="Tipo"
              value={type}
              onChange={(e) => setType(e.target.value as LegalEventType)}
              options={eventTypeOptions} />
            
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LegalEventStatus)}
              options={statusOptions} />
            
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            Datas e Horários
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data Início"
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)} />
            
            <Input
              label="Data Fim"
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
            
            <span className="text-sm text-text-primary">Dia inteiro</span>
          </label>

          {!allDay &&
          <div className="grid grid-cols-2 gap-4">
              <Input
              label="Hora Início"
              type="time"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)} />
            
              <Input
              label="Hora Fim"
              type="time"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)} />
            
            </div>
          }
        </div>

        {/* Relations */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            Relacionamentos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cliente"
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              options={[
              {
                value: '',
                label: 'Selecione um cliente'
              },
              ...mockLegalClients.map((c) => ({
                value: c.id,
                label: c.name
              }))]
              } />
            
            <Select
              label="Processo"
              value={processId}
              onChange={(e) => handleProcessChange(e.target.value)}
              options={[
              {
                value: '',
                label: 'Selecione um processo'
              },
              ...filteredProcesses.map((p) => ({
                value: p.id,
                label: p.number
              }))]
              } />
            
            <Input
              label="Tribunal"
              value={tribunal}
              onChange={(e) => setTribunal(e.target.value)}
              placeholder="Ex: TJSP, TRT-2" />
            
          </div>
        </div>

        {/* Responsible Users (Multi-select) */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">
            Responsáveis
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
              Selecione pelo menos um responsável
            </p>
          }
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">Detalhes</h4>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Observações
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações sobre o evento..."
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
              rows={3} />
            
          </div>

          <Input
            label="Alertar com antecedência (dias úteis)"
            type="number"
            min={0}
            max={30}
            value={alertDaysBefore.toString()}
            onChange={(e) => setAlertDaysBefore(parseInt(e.target.value) || 0)} />
          

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Anexos
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
                  Clique para adicionar arquivos
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
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
          </Button>
        </div>
      </div>
    </Modal>);

}