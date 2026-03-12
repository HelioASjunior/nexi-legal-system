import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { Client, Installment, ClientRecord } from '../types';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
  client: Omit<Client, 'id' | 'whatsappHistory'> & {
    id?: string;
  })
  => void;
  client?: Client | null;
  existingClients?: ClientRecord[];
}
interface InstallmentForm {
  description: string;
  value: string;
  dueDate: string;
}
export function ClientModal({
  isOpen,
  onClose,
  onSave,
  client,
  existingClients
}: ClientModalProps) {
  const [name, setName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [installments, setInstallments] = useState<InstallmentForm[]>([]);
  const [generateRecurring, setGenerateRecurring] = useState(false);
  const [recurringCount, setRecurringCount] = useState('12');
  const [recurringInterval, setRecurringInterval] = useState('30');
  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Filter suggestions based on search query
  const suggestions = useMemo(() => {
    if (!existingClients || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return existingClients.
    filter(
      (c) =>
      c.name.toLowerCase().includes(query) ||
      c.cpf.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
    ).
    slice(0, 5);
  }, [existingClients, searchQuery]);
  useEffect(() => {
    if (client) {
      setName(client.name);
      setCpfCnpj(client.cpfCnpj);
      setPhone(client.phone);
      setEmail(client.email);
      setInstallments(
        client.installments.map((i) => ({
          description: i.description,
          value: i.value.toString(),
          dueDate: i.dueDate
        }))
      );
    } else {
      setName('');
      setCpfCnpj('');
      setPhone('');
      setEmail('');
      setInstallments([]);
    }
    setGenerateRecurring(false);
    setSearchQuery('');
    setShowSuggestions(false);
  }, [client, isOpen]);
  const handleSelectClient = (selectedClient: ClientRecord) => {
    setName(selectedClient.name);
    setCpfCnpj(selectedClient.cpf);
    setPhone(selectedClient.phone || '');
    setEmail(selectedClient.email || '');
    setSearchQuery('');
    setShowSuggestions(false);
  };
  const addInstallment = () => {
    setInstallments([
    ...installments,
    {
      description: '',
      value: '',
      dueDate: ''
    }]
    );
  };
  const removeInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };
  const updateInstallment = (
  index: number,
  field: keyof InstallmentForm,
  value: string) =>
  {
    const updated = [...installments];
    updated[index][field] = value;
    setInstallments(updated);
  };
  const generateRecurringInstallments = () => {
    if (!installments[0]?.value || !installments[0]?.dueDate) return;
    const count = parseInt(recurringCount) || 12;
    const interval = parseInt(recurringInterval) || 30;
    const baseValue = installments[0].value;
    const baseDate = new Date(installments[0].dueDate);
    const generated: InstallmentForm[] = [];
    for (let i = 0; i < count; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + i * interval);
      generated.push({
        description: `Parcela ${i + 1}/${count}`,
        value: baseValue,
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }
    setInstallments(generated);
    setGenerateRecurring(false);
  };
  const handleSubmit = () => {
    const clientData: Omit<Client, 'id' | 'whatsappHistory'> & {
      id?: string;
    } = {
      id: client?.id,
      name,
      cpfCnpj,
      phone,
      email,
      installments: installments.
      filter((i) => i.description && i.value && i.dueDate).
      map(
        (i, index) =>
        ({
          id:
          client?.installments[index]?.id || `new-${Date.now()}-${index}`,
          description: i.description,
          value: parseFloat(i.value) || 0,
          dueDate: i.dueDate,
          status: client?.installments[index]?.status || 'pendente'
        }) as Installment
      )
    };
    onSave(clientData);
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
      size="lg">
      
      <div className="space-y-6">
        {/* Client Search (only when existingClients is provided and not editing) */}
        {existingClients && existingClients.length > 0 && !client &&
        <div className="relative">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Buscar Cliente Existente
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Digite o nome ou CPF para buscar..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50" />
            
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 &&
          <div className="absolute z-10 w-full mt-2 glass-strong rounded-xl border border-white/10 shadow-lg overflow-hidden">
                {suggestions.map((s) =>
            <button
              key={s.id}
              onClick={() => handleSelectClient(s)}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0">
              
                    <p className="text-sm font-medium text-text-primary">
                      {s.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {s.cpf} • {s.phone || 'Sem telefone'}
                    </p>
                  </button>
            )}
              </div>
          }
          </div>
        }

        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo ou razão social" />
          
          <Input
            label="CPF/CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder="000.000.000-00" />
          
          <Input
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000" />
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com" />
          
        </div>

        {/* Installments Section */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">Parcelas</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGenerateRecurring(!generateRecurring)}>
                
                Gerar Recorrentes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={addInstallment}>
                
                Adicionar
              </Button>
            </div>
          </div>

          {/* Recurring Generator */}
          {generateRecurring &&
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <p className="text-sm text-text-secondary mb-3">
                Preencha a primeira parcela e configure a recorrência:
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-24">
                  <Input
                  label="Quantidade"
                  type="number"
                  value={recurringCount}
                  onChange={(e) => setRecurringCount(e.target.value)} />
                
                </div>
                <div className="w-32">
                  <Input
                  label="Intervalo (dias)"
                  type="number"
                  value={recurringInterval}
                  onChange={(e) => setRecurringInterval(e.target.value)} />
                
                </div>
                <Button
                variant="primary"
                size="sm"
                onClick={generateRecurringInstallments}>
                
                  Gerar
                </Button>
              </div>
            </div>
          }

          {/* Installments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {installments.length === 0 ?
            <p className="text-sm text-text-secondary text-center py-4">
                Nenhuma parcela adicionada
              </p> :

            installments.map((inst, index) =>
            <div
              key={index}
              className="flex items-end gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              
                  <div className="flex-1">
                    <Input
                  label={index === 0 ? 'Descrição' : undefined}
                  value={inst.description}
                  onChange={(e) =>
                  updateInstallment(index, 'description', e.target.value)
                  }
                  placeholder="Descrição da parcela" />
                
                  </div>
                  <div className="w-32">
                    <Input
                  label={index === 0 ? 'Valor (R$)' : undefined}
                  type="number"
                  value={inst.value}
                  onChange={(e) =>
                  updateInstallment(index, 'value', e.target.value)
                  }
                  placeholder="0,00" />
                
                  </div>
                  <div className="w-40">
                    <Input
                  label={index === 0 ? 'Vencimento' : undefined}
                  type="date"
                  value={inst.dueDate}
                  onChange={(e) =>
                  updateInstallment(index, 'dueDate', e.target.value)
                  } />
                
                  </div>
                  <button
                onClick={() => removeInstallment(index)}
                className="p-2 rounded-lg hover:bg-accent-red/20 text-text-secondary hover:text-accent-red transition-colors">
                
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
            )
            }
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {client ? 'Salvar Alterações' : 'Criar Cliente'}
          </Button>
        </div>
      </div>
    </Modal>);

}