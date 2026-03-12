import React, { useMemo, useState } from 'react';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { Client, Installment, WhatsAppLog } from '../types';
import { mockClients } from '../data/mockData';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { ClientCard } from '../components/ClientCard';
import { ClientModal } from '../components/ClientModal';
import { InstallmentModal } from '../components/InstallmentModal';
import { WhatsAppHistoryModal } from '../components/WhatsAppHistoryModal';
const monthOptions = [
{
  value: '',
  label: 'Todos os meses'
},
{
  value: '01',
  label: 'Janeiro'
},
{
  value: '02',
  label: 'Fevereiro'
},
{
  value: '03',
  label: 'Março'
},
{
  value: '04',
  label: 'Abril'
},
{
  value: '05',
  label: 'Maio'
},
{
  value: '06',
  label: 'Junho'
},
{
  value: '07',
  label: 'Julho'
},
{
  value: '08',
  label: 'Agosto'
},
{
  value: '09',
  label: 'Setembro'
},
{
  value: '10',
  label: 'Outubro'
},
{
  value: '11',
  label: 'Novembro'
},
{
  value: '12',
  label: 'Dezembro'
}];

const currentYear = new Date().getFullYear();
const yearOptions = [
{
  value: '',
  label: 'Todos os anos'
},
...Array.from(
  {
    length: 5
  },
  (_, i) => ({
    value: (currentYear - 2 + i).toString(),
    label: (currentYear - 2 + i).toString()
  })
)];

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<{
    clientId: string;
    installment: Installment;
  } | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppClient, setWhatsAppClient] = useState<Client | null>(null);
  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Name filter
      if (
      searchTerm &&
      !client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      {
        return false;
      }
      // Month/Year filter - check if any installment matches
      if (filterMonth || filterYear) {
        const hasMatchingInstallment = client.installments.some((inst) => {
          const date = new Date(inst.dueDate);
          const instMonth = (date.getMonth() + 1).toString().padStart(2, '0');
          const instYear = date.getFullYear().toString();
          if (filterMonth && filterYear) {
            return instMonth === filterMonth && instYear === filterYear;
          }
          if (filterMonth) {
            return instMonth === filterMonth;
          }
          if (filterYear) {
            return instYear === filterYear;
          }
          return true;
        });
        if (!hasMatchingInstallment) return false;
      }
      return true;
    });
  }, [clients, searchTerm, filterMonth, filterYear]);
  const clearFilters = () => {
    setSearchTerm('');
    setFilterMonth('');
    setFilterYear('');
  };
  const hasActiveFilters = searchTerm || filterMonth || filterYear;
  // Client CRUD
  const handleSaveClient = (
  clientData: Omit<Client, 'id' | 'whatsappHistory'> & {
    id?: string;
  }) =>
  {
    if (clientData.id) {
      // Update existing
      setClients(
        clients.map((c) =>
        c.id === clientData.id ?
        {
          ...c,
          ...clientData,
          whatsappHistory: c.whatsappHistory
        } :
        c
        )
      );
    } else {
      // Create new
      const newClient: Client = {
        ...clientData,
        id: `client-${Date.now()}`,
        whatsappHistory: []
      };
      setClients([newClient, ...clients]);
    }
  };
  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter((c) => c.id !== clientId));
    }
  };
  // Installment actions
  const handlePayInstallment = (clientId: string, installmentId: string) => {
    setClients(
      clients.map((c) =>
      c.id === clientId ?
      {
        ...c,
        installments: c.installments.map((i) =>
        i.id === installmentId ?
        {
          ...i,
          status: 'pago' as const,
          paidDate: new Date().toISOString().split('T')[0]
        } :
        i
        )
      } :
      c
      )
    );
  };
  const handleEditInstallment = (
  clientId: string,
  installment: Installment) =>
  {
    setEditingInstallment({
      clientId,
      installment
    });
    setIsInstallmentModalOpen(true);
  };
  const handleSaveInstallment = (
  clientId: string,
  installment: Installment) =>
  {
    setClients(
      clients.map((c) =>
      c.id === clientId ?
      {
        ...c,
        installments: c.installments.map((i) =>
        i.id === installment.id ? installment : i
        )
      } :
      c
      )
    );
  };
  const handleDeleteInstallment = (clientId: string, installmentId: string) => {
    if (confirm('Tem certeza que deseja excluir esta parcela?')) {
      setClients(
        clients.map((c) =>
        c.id === clientId ?
        {
          ...c,
          installments: c.installments.filter(
            (i) => i.id !== installmentId
          )
        } :
        c
        )
      );
    }
  };
  // WhatsApp history
  const handleViewWhatsAppHistory = (client: Client) => {
    setWhatsAppClient(client);
    setIsWhatsAppModalOpen(true);
  };
  const handleAddWhatsAppLog = (
  clientId: string,
  log: Omit<WhatsAppLog, 'id'>) =>
  {
    const newLog: WhatsAppLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    setClients(
      clients.map((c) =>
      c.id === clientId ?
      {
        ...c,
        whatsappHistory: [newLog, ...c.whatsappHistory]
      } :
      c
      )
    );
    // Update the modal's client reference
    setWhatsAppClient((prev) =>
    prev?.id === clientId ?
    {
      ...prev,
      whatsappHistory: [newLog, ...prev.whatsappHistory]
    } :
    prev
    );
  };
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
            Gestão de Clientes
          </h1>
          <p className="text-text-secondary">
            {filteredClients.length} cliente
            {filteredClients.length !== 1 ? 's' : ''} encontrado
            {filteredClients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="w-5 h-5" />}
          onClick={() => {
            setEditingClient(null);
            setIsClientModalOpen(true);
          }}>
          
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div
        className="glass rounded-2xl p-4 border border-white/10 animate-fade-in"
        style={{
          animationDelay: '100ms'
        }}>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50" />
            
          </div>
          <div className="flex gap-3">
            <div className="w-40">
              <Select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                options={monthOptions} />
              
            </div>
            <div className="w-32">
              <Select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                options={yearOptions} />
              
            </div>
            {hasActiveFilters &&
            <Button
              variant="ghost"
              onClick={clearFilters}
              icon={<XIcon className="w-4 h-4" />}>
              
                Limpar
              </Button>
            }
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ?
        <div className="glass rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-text-secondary">Nenhum cliente encontrado</p>
          </div> :

        filteredClients.map((client, index) =>
        <div
          key={client.id}
          style={{
            animationDelay: `${(index + 2) * 50}ms`
          }}>
          
              <ClientCard
            client={client}
            onPayInstallment={handlePayInstallment}
            onEditInstallment={handleEditInstallment}
            onDeleteInstallment={handleDeleteInstallment}
            onEditClient={(c) => {
              setEditingClient(c);
              setIsClientModalOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
            onViewWhatsAppHistory={handleViewWhatsAppHistory} />
          
            </div>
        )
        }
      </div>

      {/* Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient} />
      

      <InstallmentModal
        isOpen={isInstallmentModalOpen}
        onClose={() => {
          setIsInstallmentModalOpen(false);
          setEditingInstallment(null);
        }}
        onSave={handleSaveInstallment}
        clientId={editingInstallment?.clientId || ''}
        installment={editingInstallment?.installment} />
      

      <WhatsAppHistoryModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        client={whatsAppClient}
        onAddLog={handleAddWhatsAppLog} />
      
    </div>);

}