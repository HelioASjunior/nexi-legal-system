import React, { useState } from 'react';
import {
  XIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  MessageSquareIcon,
  PhoneCallIcon,
  UsersIcon,
  FileTextIcon,
  PlusIcon,
  SendIcon,
  BriefcaseIcon } from
'lucide-react';
import {
  Attendance,
  AttendanceStatus,
  ClientRecord,
  AuthUser,
  AttendanceLogType } from
'../../types';
import {
  ATTENDANCE_STATUS_CONFIG,
  AREA_OF_LAW_CONFIG,
  LOG_TYPE_CONFIG } from
'../../data/attendanceData';
import { Button } from '../Button';
import { Select } from '../Select';
interface AttendanceDetailPanelProps {
  attendance: Attendance | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (attendance: Attendance) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: AttendanceStatus) => void;
  onAddLog: (
  attendanceId: string,
  log: {
    type: string;
    description: string;
  })
  => void;
  clients: ClientRecord[];
  users: AuthUser[];
  canEdit: boolean;
}
const logTypeIcons: Record<AttendanceLogType, React.ReactNode> = {
  ligacao: <PhoneCallIcon className="w-4 h-4" />,
  mensagem: <MessageSquareIcon className="w-4 h-4" />,
  reuniao: <UsersIcon className="w-4 h-4" />,
  observacao: <FileTextIcon className="w-4 h-4" />
};
export function AttendanceDetailPanel({
  attendance,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onAddLog,
  clients,
  users,
  canEdit
}: AttendanceDetailPanelProps) {
  const [newLogType, setNewLogType] = useState<AttendanceLogType>('observacao');
  const [newLogDescription, setNewLogDescription] = useState('');
  if (!isOpen || !attendance) return null;
  const client = clients.find((c) => c.id === attendance.clientId);
  const responsible = users.find((u) => u.id === attendance.responsibleUserId);
  const statusConfig = ATTENDANCE_STATUS_CONFIG[attendance.status];
  const handleAddLog = () => {
    if (!newLogDescription.trim()) return;
    onAddLog(attendance.id, {
      type: newLogType,
      description: newLogDescription
    });
    setNewLogDescription('');
  };
  const handleDelete = () => {
    onDelete(attendance.id);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose} />
      

      <div className="relative w-full max-w-lg h-full glass-strong border-l border-white/10 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-strong border-b border-white/10 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                
                {statusConfig.label}
              </span>
              <h2 className="text-xl font-semibold text-text-primary mt-2">
                {client?.name || 'Cliente'}
              </h2>
              <p className="text-sm text-text-secondary">
                {AREA_OF_LAW_CONFIG[attendance.areaOfLaw]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              
              <XIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Client Info */}
          {client &&
          <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Dados do Cliente
              </h3>
              <div className="glass rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {client.name}
                    </p>
                    <p className="text-sm text-text-secondary">{client.cpf}</p>
                  </div>
                </div>
                {client.phone &&
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <PhoneIcon className="w-4 h-4" />
                    {client.phone}
                  </div>
              }
                {client.email &&
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <MailIcon className="w-4 h-4" />
                    {client.email}
                  </div>
              }
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPinIcon className="w-4 h-4" />
                  {client.city}/{client.state}
                </div>
              </div>
            </div>
          }

          {/* Status Change */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Alterar Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([key, config]) =>
              <button
                key={key}
                onClick={() =>
                onStatusChange(attendance.id, key as AttendanceStatus)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${attendance.status === key ? `${config.bgColor} ${config.color} border-current` : 'bg-white/5 text-text-secondary border-white/10 hover:bg-white/10'}`}>
                
                  {config.label}
                </button>
              )}
            </div>
          </div>

          {/* Attendance Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Detalhes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-text-primary">
                <BriefcaseIcon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm">
                  {AREA_OF_LAW_CONFIG[attendance.areaOfLaw]}
                </span>
              </div>
              {responsible &&
              <div className="flex items-center gap-3 text-text-primary">
                  <UserIcon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm">
                    Responsável: {responsible.name}
                  </span>
                </div>
              }
              {attendance.estimatedValue &&
              <div className="flex items-center gap-3 text-text-primary">
                  <DollarSignIcon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm">
                    Valor: R${' '}
                    {attendance.estimatedValue.toLocaleString('pt-BR')}
                  </span>
                </div>
              }
              {attendance.probability &&
              <div className="flex items-center gap-3 text-text-primary">
                  <TrendingUpIcon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm">
                    Probabilidade: {attendance.probability}%
                  </span>
                </div>
              }
              {attendance.nextContactDate &&
              <div className="flex items-center gap-3 text-text-primary">
                  <CalendarIcon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm">
                    Próximo contato:{' '}
                    {new Date(attendance.nextContactDate).toLocaleDateString(
                    'pt-BR'
                  )}
                  </span>
                </div>
              }
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Descrição do Caso
            </h3>
            <p className="text-sm text-text-primary bg-white/5 rounded-lg p-3">
              {attendance.description}
            </p>
          </div>

          {/* Observations */}
          {attendance.observations &&
          <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Observações
              </h3>
              <p className="text-sm text-text-primary bg-white/5 rounded-lg p-3">
                {attendance.observations}
              </p>
            </div>
          }

          {/* Add Log */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Adicionar Interação
            </h3>
            <div className="space-y-3">
              <Select
                value={newLogType}
                onChange={(e) =>
                setNewLogType(e.target.value as AttendanceLogType)
                }
                options={Object.entries(LOG_TYPE_CONFIG).map(([k, v]) => ({
                  value: k,
                  label: v.label
                }))} />
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLogDescription}
                  onChange={(e) => setNewLogDescription(e.target.value)}
                  placeholder="Descreva a interação..."
                  className="flex-1 px-4 py-2 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLog()} />
                
                <Button
                  variant="primary"
                  icon={<SendIcon className="w-4 h-4" />}
                  onClick={handleAddLog}>
                  
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Logs History */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Histórico ({attendance.logs.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {attendance.logs.length === 0 ?
              <p className="text-sm text-text-secondary text-center py-4">
                  Nenhuma interação registrada
                </p> :

              [...attendance.logs].reverse().map((log) => {
                const logUser = users.find((u) => u.id === log.userId);
                return (
                  <div
                    key={log.id}
                    className="glass rounded-xl p-3 border border-white/5">
                    
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          {logTypeIcons[log.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-text-primary">
                              {LOG_TYPE_CONFIG[log.type]?.label}
                            </span>
                            <span className="text-xs text-text-secondary">
                              •
                            </span>
                            <span className="text-xs text-text-secondary">
                              {logUser?.name}
                            </span>
                          </div>
                          <p className="text-sm text-text-primary">
                            {log.description}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {new Date(log.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>);

              })
              }
            </div>
          </div>

          {/* Convert to Process */}
          <div className="pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              className="w-full"
              icon={<BriefcaseIcon className="w-4 h-4" />}>
              
              Converter em Processo
            </Button>
          </div>

          {/* Actions */}
          {canEdit &&
          <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
              variant="secondary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => onEdit(attendance)}
              className="flex-1">
              
                Editar
              </Button>
              <Button
              variant="danger"
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}>
              
                Excluir
              </Button>
            </div>
          }

          {/* Metadata */}
          <div className="text-xs text-text-secondary pt-4 border-t border-white/10 space-y-1">
            <div>
              Criado em:{' '}
              {new Date(attendance.createdAt).toLocaleString('pt-BR')}
            </div>
            <div>
              Atualizado em:{' '}
              {new Date(attendance.updatedAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </div>);

}