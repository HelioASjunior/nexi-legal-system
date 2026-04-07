import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  ClientRecord,
  FinancialMovement,
  FinancialMovementClassification,
  FinancialMovementDirection,
  FinancialMovementStatus,
  FinancialMovementType,
} from '../../types';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
import { useLanguage } from '../../context/LanguageContext';

const classificationOptions: Array<{ value: FinancialMovementClassification | ''; label: string }> = [
  { value: '', label: 'Selecione a classificação' },
  { value: 'Adiantamento de despesas', label: 'Adiantamento de despesas' },
  { value: 'Aluguel', label: 'Aluguel' },
  { value: 'Anuidade OAB', label: 'Anuidade OAB' },
  { value: 'COFINS', label: 'COFINS' },
  { value: 'CSLL', label: 'CSLL' },
  { value: 'Capitalização sócios', label: 'Capitalização sócios' },
  { value: 'Condomínio', label: 'Condomínio' },
  { value: 'Contador', label: 'Contador' },
  { value: 'Despesa do cliente', label: 'Despesa do cliente' },
  { value: 'GPS - INSS', label: 'GPS - INSS' },
  { value: 'Honorários', label: 'Honorários' },
  { value: 'IPTU', label: 'IPTU' },
  { value: 'IRRF', label: 'IRRF' },
  { value: 'Impostos', label: 'Impostos' },
  { value: 'Limpeza', label: 'Limpeza' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'PIS', label: 'PIS' },
  { value: 'PróLabore', label: 'PróLabore' },
  { value: 'Rendimentos financeiros', label: 'Rendimentos financeiros' },
  { value: 'Salários', label: 'Salários' },
];

const movementTypeOptions: Array<{ value: FinancialMovementType; label: string }> = [
  { value: 'entrada_avulsa', label: 'Entrada avulsa' },
  { value: 'adiantamento_despesa', label: 'Adiantamento de despesa' },
  { value: 'honorario', label: 'Honorário' },
];

const accountOptions = [
  { value: '', label: 'Selecione a conta' },
  { value: 'Caixa', label: 'Caixa' },
  { value: 'Banco principal', label: 'Banco principal' },
  { value: 'Cartão / Maquininha', label: 'Cartão / Maquininha' },
  { value: 'Outro', label: 'Outro' },
];

interface FinancialMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movement: FinancialMovement) => void;
  clientRecords: ClientRecord[];
  movement?: FinancialMovement | null;
  preset?: {
    direction?: FinancialMovementDirection;
    status?: FinancialMovementStatus;
    movementType?: FinancialMovementType;
    classification?: FinancialMovementClassification;
    title?: string;
  } | null;
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function formatCurrencyInput(value: string): string {
  return value.replace(/[^\d,.]/g, '');
}

export function FinancialMovementModal({
  isOpen,
  onClose,
  onSave,
  clientRecords,
  movement,
  preset,
}: FinancialMovementModalProps) {
  const { t } = useLanguage();
  const [direction, setDirection] = useState<FinancialMovementDirection>(preset?.direction ?? 'entrada');
  const [status, setStatus] = useState<FinancialMovementStatus>(preset?.status ?? 'a_receber');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split('T')[0]);
  const [movementType, setMovementType] = useState<FinancialMovementType>(preset?.movementType ?? 'entrada_avulsa');
  const [receivedFrom, setReceivedFrom] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [classification, setClassification] = useState<FinancialMovementClassification | ''>(preset?.classification ?? '');
  const [account, setAccount] = useState('');
  const [installmentCount, setInstallmentCount] = useState('1');
  const [printReceipt, setPrintReceipt] = useState(false);

  const suggestedClients = useMemo(() => {
    if (!receivedFrom.trim()) return [];
    const query = normalizeText(receivedFrom);
    const digits = receivedFrom.replace(/\D/g, '');
    return clientRecords
      .filter((client) => {
        const nameMatch = normalizeText(client.name).includes(query);
        const cpfMatch = digits ? client.cpf.replace(/\D/g, '').includes(digits) : false;
        return nameMatch || cpfMatch;
      })
      .slice(0, 6);
  }, [clientRecords, receivedFrom]);

  const resetForm = useCallback(() => {
    if (movement) {
      setDirection(movement.direction);
      setStatus(movement.status);
      setReceivedAt(movement.receivedAt);
      setMovementType(movement.movementType);
      setReceivedFrom(movement.receivedFrom);
      setSelectedClientId(movement.clientId || '');
      setShowSuggestions(false);
      setDescription(movement.description);
      setAmount(movement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ','));
      setDocumentNumber(movement.documentNumber || '');
      setClassification(movement.classification);
      setAccount(movement.account);
      setInstallmentCount(String(movement.installmentCount || 1));
      setPrintReceipt(movement.printReceipt);
      return;
    }

    setDirection(preset?.direction ?? 'entrada');
    setStatus(preset?.status ?? 'a_receber');
    setReceivedAt(new Date().toISOString().split('T')[0]);
    setMovementType(preset?.movementType ?? 'entrada_avulsa');
    setReceivedFrom('');
    setSelectedClientId('');
    setShowSuggestions(false);
    setDescription('');
    setAmount('');
    setDocumentNumber('');
    setClassification(preset?.classification ?? '');
    setAccount('');
    setInstallmentCount('1');
    setPrintReceipt(false);
  }, [movement, preset]);

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectClient = (client: ClientRecord) => {
    setSelectedClientId(client.id);
    setReceivedFrom(client.name);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!receivedFrom.trim() || !description.trim() || !amount || !classification || !account) return;

    const now = new Date().toISOString();
    const parsedAmount = Number(amount.replace(/\./g, '').replace(',', '.')) || 0;
    const parcels = Math.max(1, parseInt(installmentCount, 10) || 1);

    onSave({
      id: movement?.id ?? `fin-${Date.now()}`,
      direction,
      status,
      receivedAt,
      movementType,
      receivedFrom: receivedFrom.trim(),
      clientId: selectedClientId || undefined,
      description: description.trim(),
      amount: parsedAmount,
      documentNumber: documentNumber.trim() || undefined,
      classification: classification as FinancialMovementClassification,
      account: account.trim(),
      repeatMonthly: parcels > 1,
      printReceipt,
      installmentCount: parcels,
      installmentIndex: 1,
      createdAt: movement?.createdAt ?? now,
      updatedAt: now,
    });

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={movement ? (t('financial.editEntry') || 'Editar lançamento financeiro') : (preset?.title ?? (t('financial.newEntry') || 'Novo lançamento financeiro'))}
      size="xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{t('financial.movement') || 'Movimentação'}</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-text-primary"><input type="radio" checked={direction === 'entrada'} onChange={() => setDirection('entrada')} />{t('financial.income') || 'Entrada'}</label>
              <label className="flex items-center gap-2 text-text-primary"><input type="radio" checked={direction === 'saida'} onChange={() => setDirection('saida')} />{t('financial.expense') || 'Saída'}</label>
            </div>
          </div>
          <Input label={t('financial.date') || 'Data*'} type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">{t('financial.status') || 'Situação'}</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-text-primary"><input type="radio" checked={status === 'a_receber'} onChange={() => setStatus('a_receber')} />{t('financial.toReceive') || 'A pagar / A receber'}</label>
            <label className="flex items-center gap-2 text-text-primary"><input type="radio" checked={status === 'recebida'} onChange={() => setStatus('recebida')} />{t('financial.received') || 'Pago / Recebido'}</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">{t('financial.type') || 'Tipo*'}</label>
          <div className="flex flex-wrap gap-4">
            {movementTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-text-primary">
                <input type="radio" checked={movementType === option.value} onChange={() => setMovementType(option.value)} />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="relative">
          <Input
            label={t('financial.counterparty') || 'Recebido de / Pago para*'}
            value={receivedFrom}
            onChange={(e) => {
              setReceivedFrom(e.target.value);
              setSelectedClientId('');
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={t('common.search')}
          />
          {showSuggestions && suggestedClients.length > 0 && (
            <div className="absolute z-30 mt-2 w-full glass-strong rounded-xl border border-white/10 shadow-lg overflow-hidden">
              {suggestedClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                  onClick={() => handleSelectClient(client)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-primary">{client.name}</span>
                    <span className="text-xs text-text-secondary">{client.cpf}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Input label={t('financial.description') || 'Descrição*'} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('financial.descriptionPlaceholder') || 'Digite a descrição'} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label={t('financial.amount') || 'Valor*'} value={amount} onChange={(e) => setAmount(formatCurrencyInput(e.target.value))} placeholder="0,00" />
          <Input label={t('financial.documentNumber') || 'Número do documento'} value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder={t('financial.documentPlaceholder') || 'Número da nota ou comprovante'} />
          <Input label={t('financial.installmentCount') || 'Quantidade de parcelas'} type="number" min="1" value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{t('financial.classification') || 'Classificação*'}</label>
            <select
              value={classification}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setClassification(e.target.value as FinancialMovementClassification)}
              className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-text-primary bg-transparent focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all duration-200 cursor-pointer"
            >
              {classificationOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-dark-surface text-text-primary">{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{t('financial.account') || 'Conta*'}</label>
            <select
              value={account}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setAccount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-text-primary bg-transparent focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all duration-200 cursor-pointer"
            >
              {accountOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-dark-surface text-text-primary">{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-text-primary">
          <input type="checkbox" checked={printReceipt} onChange={(e) => setPrintReceipt(e.target.checked)} />
          {t('financial.printReceipt') || 'Imprimir recibo ao salvar'}
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSubmit}>{t('financial.saveEntry') || 'Salvar lançamento'}</Button>
        </div>
      </div>
    </Modal>
  );
}
