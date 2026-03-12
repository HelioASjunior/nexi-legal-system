import React from 'react';
import {
  XIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  HeartIcon,
  FileTextIcon } from
'lucide-react';
import { ClientRecord } from '../../types';
import { Button } from '../Button';
interface ClientDetailPanelProps {
  client: ClientRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (client: ClientRecord) => void;
  onDelete?: (clientId: string) => void;
}
const maritalStatusLabels: Record<string, string> = {
  solteiro: 'Solteiro(a)',
  casado: 'Casado(a)',
  divorciado: 'Divorciado(a)',
  viuvo: 'Viúvo(a)',
  uniao_estavel: 'União Estável'
};
export function ClientDetailPanel({
  client,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: ClientDetailPanelProps) {
  if (!isOpen || !client) return null;
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };
  const handleDelete = () => {
    if (onDelete && confirm('Tem certeza que deseja desativar este cliente?')) {
      onDelete(client.id);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose} />
      

      {/* Panel */}
      <div className="relative w-full max-w-lg h-full glass-strong border-l border-white/10 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-strong border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {client.name}
                </h2>
                <span
                  className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${client.status === 'ativo' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}
                  `}>
                  
                  {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              
              <XIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Documents */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Documentos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-text-secondary mb-1">CPF</p>
                <p className="font-mono text-text-primary">{client.cpf}</p>
              </div>
              {client.rg &&
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-text-secondary mb-1">RG</p>
                  <p className="font-mono text-text-primary">{client.rg}</p>
                </div>
              }
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Dados Pessoais
            </h3>
            <div className="space-y-2">
              {client.birthDate &&
              <div className="flex items-center gap-3 text-text-primary">
                  <CalendarIcon className="w-5 h-5 text-text-secondary" />
                  <span>{formatDate(client.birthDate)}</span>
                </div>
              }
              {client.maritalStatus &&
              <div className="flex items-center gap-3 text-text-primary">
                  <HeartIcon className="w-5 h-5 text-text-secondary" />
                  <span>{maritalStatusLabels[client.maritalStatus]}</span>
                </div>
              }
              {client.profession &&
              <div className="flex items-center gap-3 text-text-primary">
                  <BriefcaseIcon className="w-5 h-5 text-text-secondary" />
                  <span>{client.profession}</span>
                </div>
              }
              {client.motherName &&
              <div className="flex items-center gap-3 text-text-primary">
                  <UserIcon className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-xs text-text-secondary">Nome da Mãe</p>
                    <p>{client.motherName}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">Contato</h3>
            <div className="space-y-2">
              {client.phone &&
              <div className="flex items-center gap-3 text-text-primary">
                  <PhoneIcon className="w-5 h-5 text-text-secondary" />
                  <span>{client.phone}</span>
                </div>
              }
              {client.whatsapp &&
              <a
                href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-accent-green hover:underline">
                
                  <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>{client.whatsapp}</span>
                </a>
              }
              {client.email &&
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-3 text-text-primary hover:text-accent-blue">
                
                  <MailIcon className="w-5 h-5 text-text-secondary" />
                  <span>{client.email}</span>
                </a>
              }
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">
              Endereço
            </h3>
            <div className="flex items-start gap-3 text-text-primary">
              <MapPinIcon className="w-5 h-5 text-text-secondary mt-0.5" />
              <div>
                <p>
                  {client.street}, {client.number}
                </p>
                {client.complement && <p>{client.complement}</p>}
                <p>{client.neighborhood}</p>
                <p>
                  {client.city} - {client.state}
                </p>
                {client.cep &&
                <p className="text-text-secondary">CEP: {client.cep}</p>
                }
              </div>
            </div>
          </div>

          {/* Observations */}
          {client.observations &&
          <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-secondary">
                Observações
              </h3>
              <div className="flex items-start gap-3">
                <FileTextIcon className="w-5 h-5 text-text-secondary mt-0.5" />
                <p className="text-text-primary">{client.observations}</p>
              </div>
            </div>
          }

          {/* Metadata */}
          <div className="pt-4 border-t border-white/10 text-xs text-text-secondary space-y-1">
            <p>
              Cadastrado em:{' '}
              {new Date(client.createdAt).toLocaleString('pt-BR')}
            </p>
            <p>
              Atualizado em:{' '}
              {new Date(client.updatedAt).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Actions */}
          {(onEdit || onDelete) &&
          <div className="flex gap-3 pt-4 border-t border-white/10">
              {onEdit &&
            <Button
              variant="secondary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => onEdit(client)}
              className="flex-1">
              
                  Editar
                </Button>
            }
              {onDelete && client.status === 'ativo' &&
            <Button
              variant="danger"
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}>
              
                  Desativar
                </Button>
            }
            </div>
          }
        </div>
      </div>
    </div>);

}