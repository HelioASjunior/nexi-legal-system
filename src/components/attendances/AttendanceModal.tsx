import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, UserIcon, PlusIcon } from 'lucide-react';
import {
  Attendance,
  ClientRecord,
  AuthUser,
  AreaOfLaw,
  AttendanceStatus } from
'../../types';
import {
  AREA_OF_LAW_CONFIG,
  ATTENDANCE_STATUS_CONFIG } from
'../../data/attendanceData';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import { ClientFormModal } from '../clients/ClientFormModal';
interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Attendance>) => void;
  editingAttendance?: Attendance | null;
  clients: ClientRecord[];
  users: AuthUser[];
}
export function AttendanceModal({
  isOpen,
  onClose,
  onSave,
  editingAttendance,
  clients,
  users
}: AttendanceModalProps) {
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [areaOfLaw, setAreaOfLaw] = useState<AreaOfLaw>('civil');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [probability, setProbability] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('novo_contato');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [nextContactDate, setNextContactDate] = useState('');
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId]
  );
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim())
    return clients.filter((c) => c.status === 'ativo').slice(0, 5);
    const search = clientSearch.toLowerCase();
    return clients.
    filter(
      (c) =>
      c.status === 'ativo' && (
      c.name.toLowerCase().includes(search) ||
      c.cpf.includes(search) ||
      c.phone?.includes(search))
    ).
    slice(0, 5);
  }, [clients, clientSearch]);
  useEffect(() => {
    if (editingAttendance) {
      setClientId(editingAttendance.clientId);
      setAreaOfLaw(editingAttendance.areaOfLaw);
      setDescription(editingAttendance.description);
      setOrigin(editingAttendance.origin || '');
      setEstimatedValue(editingAttendance.estimatedValue?.toString() || '');
      setProbability(editingAttendance.probability?.toString() || '');
      setStatus(editingAttendance.status);
      setResponsibleUserId(editingAttendance.responsibleUserId);
      setNextContactDate(editingAttendance.nextContactDate || '');
      setObservations(editingAttendance.observations || '');
    } else {
      setClientId('');
      setClientSearch('');
      setAreaOfLaw('civil');
      setDescription('');
      setOrigin('');
      setEstimatedValue('');
      setProbability('');
      setStatus('novo_contato');
      setResponsibleUserId(users[0]?.id || '');
      setNextContactDate('');
      setObservations('');
    }
    setErrors({});
  }, [editingAttendance, isOpen, users]);
  const handleSelectClient = (client: ClientRecord) => {
    setClientId(client.id);
    setClientSearch('');
    setShowClientDropdown(false);
  };
  const handleSaveNewClient = (clientData: any) => {
    // In a real app, this would save to backend and return the new client
    // For now, we'll just close the modal
    setIsClientModalOpen(false);
  };
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!clientId) newErrors.clientId = 'Selecione um cliente';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!responsibleUserId)
    newErrors.responsibleUserId = 'Selecione um responsável';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validate()) return;
    const data: Partial<Attendance> = {
      id: editingAttendance?.id,
      clientId,
      areaOfLaw,
      description,
      origin: origin || undefined,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      probability: probability ? parseInt(probability) : undefined,
      status,
      responsibleUserId,
      nextContactDate: nextContactDate || undefined,
      observations: observations || undefined
    };
    onSave(data);
    onClose();
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingAttendance ? 'Editar Atendimento' : 'Novo Atendimento'}
        size="xl">
        
        <div className="space-y-6">
          {/* Client Selection */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-4">
              1. Selecionar Cliente *
            </h4>

            {selectedClient ?
            <div className="glass rounded-xl p-4 border border-accent-blue/30 bg-accent-blue/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-accent-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {selectedClient.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {selectedClient.cpf} • {selectedClient.phone}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {selectedClient.email}
                      </p>
                    </div>
                  </div>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClientId('')}>
                  
                    Alterar
                  </Button>
                </div>
              </div> :

            <div className="space-y-3">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="Buscar cliente por nome, CPF ou telefone..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50" />
                
                  {errors.clientId &&
                <p className="mt-1 text-sm text-accent-red">
                      {errors.clientId}
                    </p>
                }
                </div>

                {showClientDropdown &&
              <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
                    {filteredClients.length > 0 ?
                filteredClients.map((client) =>
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0">
                  
                          <p className="font-medium text-text-primary">
                            {client.name}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {client.cpf} • {client.phone || 'Sem telefone'}
                          </p>
                        </button>
                ) :

                <div className="p-4 text-center text-text-secondary">
                        <p className="mb-2">Nenhum cliente encontrado</p>
                      </div>
                }
                    <button
                  onClick={() => {
                    setShowClientDropdown(false);
                    setIsClientModalOpen(true);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-accent-blue/10 transition-colors flex items-center gap-2 text-accent-blue border-t border-white/10">
                  
                      <PlusIcon className="w-4 h-4" />
                      Cadastrar novo cliente
                    </button>
                  </div>
              }
              </div>
            }
          </div>

          {/* Attendance Data */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-4">
              2. Dados do Atendimento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Área do Direito *"
                value={areaOfLaw}
                onChange={(e) => setAreaOfLaw(e.target.value as AreaOfLaw)}
                options={Object.entries(AREA_OF_LAW_CONFIG).map(([k, v]) => ({
                  value: k,
                  label: v
                }))} />
              
              <Select
                label="Responsável *"
                value={responsibleUserId}
                onChange={(e) => setResponsibleUserId(e.target.value)}
                options={users.map((u) => ({
                  value: u.id,
                  label: u.name
                }))} />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descrição do Caso *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o caso do cliente..."
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
                  rows={3} />
                
                {errors.description &&
                <p className="mt-1 text-sm text-accent-red">
                    {errors.description}
                  </p>
                }
              </div>
              <Input
                label="Origem do Contato"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ex: Indicação, Google, LinkedIn" />
              
              <Input
                label="Valor Estimado (R$)"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0,00" />
              
              <Input
                label="Probabilidade (%)"
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                placeholder="0-100" />
              
              <Input
                label="Próximo Contato"
                type="date"
                value={nextContactDate}
                onChange={(e) => setNextContactDate(e.target.value)} />
              
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                options={Object.entries(ATTENDANCE_STATUS_CONFIG).map(
                  ([k, v]) => ({
                    value: k,
                    label: v.label
                  })
                )} />
              
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Observações Internas
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações internas sobre o atendimento..."
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
              rows={2} />
            
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingAttendance ? 'Salvar Alterações' : 'Criar Atendimento'}
            </Button>
          </div>
        </div>
      </Modal>

      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveNewClient} />
      
    </>);

}