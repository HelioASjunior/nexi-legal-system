import React, { useState } from 'react';
import { PlusIcon, MessageCircleIcon } from 'lucide-react';
import { Client, WhatsAppLog } from '../types';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
interface WhatsAppHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onAddLog: (clientId: string, log: Omit<WhatsAppLog, 'id'>) => void;
}
export function WhatsAppHistoryModal({
  isOpen,
  onClose,
  client,
  onAddLog
}: WhatsAppHistoryModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPhone, setNewPhone] = useState('');
  const [newObservation, setNewObservation] = useState('');
  if (!client) return null;
  const handleAddLog = () => {
    if (!newObservation.trim()) return;
    onAddLog(client.id, {
      date: newDate,
      phone: newPhone || client.phone,
      observation: newObservation
    });
    setShowAddForm(false);
    setNewObservation('');
    setNewPhone('');
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico WhatsApp - ${client.name}`}
      size="lg">
      
      <div className="space-y-4">
        {/* Add New Log Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setShowAddForm(!showAddForm)}>
            
            Novo Registro
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm &&
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
              label="Data"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)} />
            
              <Input
              label="Telefone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder={client.phone} />
            
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Observação
              </label>
              <textarea
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              placeholder="Descreva o contato realizado..."
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
              rows={3} />
            
            </div>
            <div className="flex justify-end gap-2">
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}>
              
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddLog}>
                Salvar
              </Button>
            </div>
          </div>
        }

        {/* History List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {client.whatsappHistory.length === 0 ?
          <div className="text-center py-8">
              <MessageCircleIcon className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
              <p className="text-text-secondary">Nenhum registro de contato</p>
            </div> :

          client.whatsappHistory.map((log) =>
          <div
            key={log.id}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-accent-green">
                    {new Date(log.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {log.phone}
                  </span>
                </div>
                <p className="text-text-primary">{log.observation}</p>
              </div>
          )
          }
        </div>
      </div>
    </Modal>);

}