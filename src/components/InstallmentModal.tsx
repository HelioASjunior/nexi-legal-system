import React, { useEffect, useState } from 'react';
import { Installment, StatusType } from '../types';
import { Modal } from './Modal';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, installment: Installment) => void;
  clientId: string;
  installment?: Installment | null;
}
const statusOptions = [
{
  value: 'pendente',
  label: 'Pendente'
},
{
  value: 'pago',
  label: 'Pago'
},
{
  value: 'atrasado',
  label: 'Atrasado'
}];

export function InstallmentModal({
  isOpen,
  onClose,
  onSave,
  clientId,
  installment
}: InstallmentModalProps) {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<StatusType>('pendente');
  const [paidDate, setPaidDate] = useState('');
  useEffect(() => {
    if (installment) {
      setDescription(installment.description);
      setValue(installment.value.toString());
      setDueDate(installment.dueDate);
      setStatus(installment.status);
      setPaidDate(installment.paidDate || '');
    } else {
      setDescription('');
      setValue('');
      setDueDate('');
      setStatus('pendente');
      setPaidDate('');
    }
  }, [installment, isOpen]);
  const handleSubmit = () => {
    const updatedInstallment: Installment = {
      id: installment?.id || `new-${Date.now()}`,
      description,
      value: parseFloat(value) || 0,
      dueDate,
      status,
      paidDate:
      status === 'pago' ?
      paidDate || new Date().toISOString().split('T')[0] :
      undefined
    };
    onSave(clientId, updatedInstallment);
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={installment ? 'Editar Parcela' : 'Nova Parcela'}
      size="md">
      
      <div className="space-y-4">
        <Input
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Parcela 1/12 - Empréstimo" />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valor (R$)"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00" />
          
          <Input
            label="Vencimento"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)} />
          
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusType)}
            options={statusOptions} />
          
          {status === 'pago' &&
          <Input
            label="Data do Pagamento"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)} />

          }
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>);

}