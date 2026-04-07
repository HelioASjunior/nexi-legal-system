import {
  XIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  BuildingIcon,
  CalendarIcon,
  AlertTriangleIcon,
  FileTextIcon,
  ImageIcon,
  UsersIcon,
  TagIcon } from
'lucide-react';
import { LegalEvent, LegalEventType, LegalEventStatus } from '../../types';
// TODO: substituir por useData().legalClients / .legalProcesses para exibir dados reais
import {
  mockLegalClients,
  mockLegalProcesses } from
'../../data/legalMockData';
import { getAllUsers } from '../../data/authData';
import {
  isEventOverdue,
  isEventUrgent,
  formatDateBR } from
'../../utils/legalDeadlines';
import { Button } from '../Button';
import { useLanguage } from '../../context/LanguageContext';
interface EventDetailPanelProps {
  event: LegalEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: LegalEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: LegalEventStatus) => void;
  onLabelsChange?: (eventId: string, labels: LegalEventStatus[]) => void;
}
const typeLabels: Record<LegalEventType, string> = {
  prazo_processual: 'calendar.type.deadline',
  audiencia: 'calendar.type.hearing',
  reuniao: 'calendar.type.meeting',
  atendimento: 'calendar.type.attendance',
  tarefa: 'calendar.type.task'
};
const typeColors: Record<LegalEventType, string> = {
  prazo_processual: 'bg-red-500',
  audiencia: 'bg-purple-500',
  reuniao: 'bg-blue-500',
  atendimento: 'bg-cyan-500',
  tarefa: 'bg-orange-500'
};
const statusConfig: Record<
  LegalEventStatus,
  {
    label: string;
    color: string;
  }> =
{
  pendente: {
    label: 'common.pending',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  em_andamento: {
    label: 'calendar.status.inProgress',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  concluido: {
    label: 'common.completed',
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  aguardando_autorizacao: {
    label: 'calendar.status.waitingAuthorization',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  aguardando_documentacao: {
    label: 'calendar.status.waitingDocumentation',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  cartorio: {
    label: 'calendar.status.registry',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  aguardando_correcao: {
    label: 'calendar.status.waitingCorrection',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  },
  atrasado: {
    label: 'common.overdue',
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  }
};
const allStatuses: LegalEventStatus[] = [
'pendente',
'em_andamento',
'concluido',
'aguardando_autorizacao',
'aguardando_documentacao',
'cartorio',
'aguardando_correcao',
'atrasado'];

export function EventDetailPanel({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onLabelsChange
}: EventDetailPanelProps) {
  const { t } = useLanguage();
  if (!isOpen || !event) return null;
  const client = event.clientId ?
  mockLegalClients.find((c) => c.id === event.clientId) :
  null;
  const process = event.processId ?
  mockLegalProcesses.find((p) => p.id === event.processId) :
  null;
  const usersById = new Map(getAllUsers().map((u) => [u.id, u]));
  const responsibleIds = event.responsibleIds || [event.responsibleId];
  const responsibleUsers = responsibleIds.flatMap((id) => {
    const user = usersById.get(id);
    return user ? [{
      id: user.id,
      name: user.name,
      email: user.email
    }] : [];
  });
  // Get active labels (multi-select support)
  const activeLabels = event.labels || [event.status];
  const effectiveStatus: LegalEventStatus =
  event.status === 'concluido' ?
  'concluido' :
  isEventOverdue(event.dateEnd, event.status) ?
  'atrasado' :
  event.status;
  const overdue = effectiveStatus === 'atrasado';
  const urgent = isEventUrgent(event.dateEnd, event.status);
  const completed = event.status === 'concluido';
  const handleDelete = () => {
    if (confirm(t('calendar.confirmDelete') || 'Are you sure you want to delete this event?')) {
      onDelete(event.id);
      onClose();
    }
  };
  const handleLabelToggle = (labelStatus: LegalEventStatus) => {
    if (onLabelsChange) {
      const currentLabels = event.labels || [event.status];
      let newLabels: LegalEventStatus[];
      if (currentLabels.includes(labelStatus)) {
        // Remove label (but keep at least one)
        newLabels = currentLabels.filter((l) => l !== labelStatus);
        if (newLabels.length === 0) {
          newLabels = [labelStatus];
        }
      } else {
        // Add label
        newLabels = [...currentLabels, labelStatus];
      }
      onLabelsChange(event.id, newLabels);
      // Also update main status to first label
      if (newLabels[0] !== event.status) {
        onStatusChange(event.id, newLabels[0]);
      }
    } else {
      // Fallback to single status change
      onStatusChange(event.id, labelStatus);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose} />
      

      <div className="relative w-full max-w-md h-full glass-strong border-l border-white/10 overflow-y-auto animate-slide-in">
        <div className="sticky top-0 z-10 glass-strong border-b border-white/10 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${typeColors[event.type]}`} />
              
              <span className="text-sm text-text-secondary">
                {t(typeLabels[event.type])}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              
              <XIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          <h2
            className={`text-xl font-semibold text-text-primary mt-2 ${completed ? 'line-through opacity-70' : ''}`}>
            
            {event.title}
          </h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Active Labels Display */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              {t('calendar.activeLabels') || 'Active Labels'} ({activeLabels.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeLabels.map((label) => {
                const config = statusConfig[label];
                return (
                  <span
                    key={label}
                    className={`px-3 py-1 rounded-full text-sm border ${config.color}`}>
                    
                    {t(config.label)}
                  </span>);

              })}
            </div>
            {overdue && !completed &&
            <span className="flex items-center gap-1 text-sm text-red-400">
                <AlertTriangleIcon className="w-4 h-4" />
                {t('common.overdue')}
              </span>
            }
            {urgent && !overdue && !completed &&
            <span className="flex items-center gap-1 text-sm text-amber-400">
                <AlertTriangleIcon className="w-4 h-4" />
                Urgente
              </span>
            }
          </div>

          {/* Multi-Select Labels */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Gerenciar Etiquetas (clique para ativar/desativar)
            </h3>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map((s) => {
                const config = statusConfig[s];
                const isActive = activeLabels.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleLabelToggle(s)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${isActive ? config.color : 'bg-white/5 text-text-secondary border-white/10 hover:bg-white/10 opacity-60'}
                    `}>
                    
                    {isActive && <span className="mr-1">✓</span>}
                    {t(config.label)}
                  </button>);

              })}
            </div>
          </div>

          {/* Quick Actions */}
          {!completed &&
          <div className="flex gap-2">
              <Button
              variant="primary"
              size="sm"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={() => handleLabelToggle('concluido')}>
              
                Marcar como Concluído
              </Button>
            </div>
          }
          {completed &&
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleLabelToggle('pendente')}>
            
                {t('calendar.reopenEvent') || 'Reopen Event'}
            </Button>
          }

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">Datas</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-text-primary">
                <CalendarIcon className="w-5 h-5 text-text-secondary" />
                <div>
                  <div className="text-sm">
                    {event.dateStart === event.dateEnd ?
                    formatDateBR(event.dateStart) :
                    `${formatDateBR(event.dateStart)} até ${formatDateBR(event.dateEnd)}`}
                  </div>
                  {!event.allDay && event.timeStart &&
                  <div className="text-xs text-text-secondary">
                      {event.timeStart} - {event.timeEnd}
                    </div>
                  }
                  {event.allDay &&
                  <div className="text-xs text-text-secondary">
                      Dia inteiro
                    </div>
                  }
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <ClockIcon className="w-5 h-5" />
                <span>Alerta: {event.alertDaysBefore} dias úteis antes</span>
              </div>
            </div>
          </div>

          {/* Relations */}
          {(client || process || event.tribunal) &&
          <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Relacionamentos
              </h3>
              <div className="space-y-2">
                {client &&
              <div className="flex items-center gap-3 text-text-primary">
                    <UserIcon className="w-5 h-5 text-text-secondary" />
                    <div>
                      <div className="text-sm">{client.name}</div>
                      <div className="text-xs text-text-secondary">
                        {client.cpfCnpj}
                      </div>
                    </div>
                  </div>
              }
                {process &&
              <div className="flex items-center gap-3 text-text-primary">
                    <FolderIcon className="w-5 h-5 text-text-secondary" />
                    <div>
                      <div className="text-sm font-mono">{process.number}</div>
                      <div className="text-xs text-text-secondary">
                        {process.description}
                      </div>
                    </div>
                  </div>
              }
                {event.tribunal &&
              <div className="flex items-center gap-3 text-text-primary">
                    <BuildingIcon className="w-5 h-5 text-text-secondary" />
                    <span className="text-sm">{event.tribunal}</span>
                  </div>
              }
              </div>
            </div>
          }

          {/* Responsible Users */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Responsáveis ({responsibleUsers.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {responsibleUsers.map((user) =>
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                
                  <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent-blue">
                      {user.name.
                    split(' ').
                    map((n) => n[0]).
                    join('').
                    slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-text-primary">
                      {user.name}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {user.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observations */}
          {event.observations &&
          <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Observações
              </h3>
              <p className="text-sm text-text-primary bg-white/5 rounded-lg p-3">
                {event.observations}
              </p>
            </div>
          }

          {/* Attachments */}
          {event.attachments.length > 0 &&
          <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Anexos
              </h3>
              <div className="space-y-2">
                {event.attachments.map((att) =>
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                
                    {att.type === 'image' ?
                <ImageIcon className="w-5 h-5 text-text-secondary" /> :

                <FileTextIcon className="w-5 h-5 text-text-secondary" />
                }
                    <span className="text-sm text-text-primary truncate">
                      {att.name}
                    </span>
                  </a>
              )}
              </div>
            </div>
          }

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => onEdit(event)}
              className="flex-1">
              
              {t('common.edit')}
            </Button>
            <Button
              variant="danger"
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}>
              
              {t('common.delete')}
            </Button>
          </div>

          {/* Metadata */}
          <div className="text-xs text-text-secondary pt-4 border-t border-white/10 space-y-1">
            <div>
              Criado em: {new Date(event.createdAt).toLocaleString('pt-BR')}
            </div>
            <div>
              Atualizado em: {new Date(event.updatedAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </div>);

}