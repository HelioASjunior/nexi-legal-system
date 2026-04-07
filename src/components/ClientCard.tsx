import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PhoneIcon,
  MailIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  MessageCircleIcon } from
'lucide-react';
import { Client, Installment, StatusType } from '../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { useLanguage } from '../context/LanguageContext';
interface ClientCardProps {
  client: Client;
  onPayInstallment: (clientId: string, installmentId: string) => void;
  onEditInstallment: (clientId: string, installment: Installment) => void;
  onDeleteInstallment: (clientId: string, installmentId: string) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onViewWhatsAppHistory: (client: Client) => void;
}
function getEffectiveStatus(installment: Installment): StatusType {
  if (installment.status === 'pago') return 'pago';
  const today = new Date();
  const dueDate = new Date(installment.dueDate);
  if (today > dueDate && installment.status === 'pendente') {
    return 'atrasado';
  }
  return installment.status;
}
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}
export function ClientCard({
  client,
  onPayInstallment,
  onEditInstallment,
  onDeleteInstallment,
  onEditClient,
  onDeleteClient,
  onViewWhatsAppHistory
}: ClientCardProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const installmentStats = client.installments.reduce(
    (acc, inst) => {
      const status = getEffectiveStatus(inst);
      acc[status]++;
      acc.total++;
      return acc;
    },
    {
      pago: 0,
      pendente: 0,
      atrasado: 0,
      total: 0
    }
  );
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden animate-fade-in">
      {/* Client Header */}
      <div
        className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-text-primary truncate">
                {client.name}
              </h3>
              {installmentStats.atrasado > 0 &&
              <StatusBadge status="atrasado" size="sm" />
              }
            </div>
            <p className="text-sm text-text-secondary mb-3">{client.cpfCnpj}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="w-4 h-4" />
                {client.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MailIcon className="w-4 h-4" />
                {client.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded-lg bg-accent-green/20 text-accent-green">
                {installmentStats.pago} {t('common.paid') || 'pagas'}
              </span>
              {installmentStats.atrasado > 0 &&
              <span className="px-2 py-1 rounded-lg bg-accent-red/20 text-accent-red">
                  {installmentStats.atrasado} {t('common.overdue') || 'atrasadas'}
                </span>
              }
              {installmentStats.pendente > 0 &&
              <span className="px-2 py-1 rounded-lg bg-accent-orange/20 text-accent-orange">
                  {installmentStats.pendente} {t('common.pending') || 'pendentes'}
                </span>
              }
            </div>

            {/* Expand Icon */}
            <div className="p-2 rounded-lg bg-white/5">
              {isExpanded ?
              <ChevronUpIcon className="w-5 h-5 text-text-secondary" /> :

              <ChevronDownIcon className="w-5 h-5 text-text-secondary" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded &&
      <div className="border-t border-white/10">
          {/* Client Actions */}
          <div className="p-4 bg-white/[0.02] flex flex-wrap gap-2">
            <Button
            variant="ghost"
            size="sm"
            icon={<MessageCircleIcon className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onViewWhatsAppHistory(client);
            }}>
            
              {t('clients.whatsappHistory') || 'Histórico WhatsApp'} ({client.whatsappHistory.length})
            </Button>
            <Button
            variant="ghost"
            size="sm"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onEditClient(client);
            }}>
            
              {t('common.edit')} {t('sidebar.clients')}
            </Button>
            <Button
            variant="danger"
            size="sm"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClient(client.id);
            }}>
            
              {t('common.delete')}
            </Button>
          </div>

          {/* Installments List */}
          <div className="p-4 space-y-3">
            <h4 className="text-sm font-medium text-text-secondary mb-3">
              {t('clients.installments') || 'Parcelas'}
            </h4>
            {client.installments.map((installment) => {
            const effectiveStatus = getEffectiveStatus(installment);
            return (
              <div
                key={installment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {installment.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-secondary">
                      <span className="font-semibold text-text-primary">
                        {formatCurrency(installment.value)}
                      </span>
                      <span>{t('clients.duePrefix') || 'Venc:'} {formatDate(installment.dueDate)}</span>
                      {installment.paidDate &&
                    <span className="text-accent-green">
                          {t('clients.paidPrefix') || 'Pago em:'} {formatDate(installment.paidDate)}
                        </span>
                    }
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={effectiveStatus} />
                    <div className="flex items-center gap-1">
                      {effectiveStatus !== 'pago' &&
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPayInstallment(client.id, installment.id);
                      }}
                      className="p-2 rounded-lg hover:bg-accent-green/20 text-text-secondary hover:text-accent-green transition-colors"
                      title={t('clients.markPaid') || 'Quitar'}>
                      
                          <CheckIcon className="w-4 h-4" />
                        </button>
                    }
                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditInstallment(client.id, installment);
                      }}
                      className="p-2 rounded-lg hover:bg-accent-blue/20 text-text-secondary hover:text-accent-blue transition-colors"
                      title={t('common.edit')}>
                      
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteInstallment(client.id, installment.id);
                      }}
                      className="p-2 rounded-lg hover:bg-accent-red/20 text-text-secondary hover:text-accent-red transition-colors"
                      title={t('common.delete')}>
                      
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>);

          })}
          </div>
        </div>
      }
    </div>);

}