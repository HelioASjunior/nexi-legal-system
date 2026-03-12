import React, { useEffect, useState } from 'react';
import { ClientRecord, MaritalStatus } from '../../types';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import {
  maskCPF,
  maskPhone,
  maskCEP,
  validateCPF,
  unmask } from
'../../utils/masks';
import { mockClientRecords } from '../../data/clientRecords';
import { appEnv } from '../../config/env';
interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
  client: Omit<
    ClientRecord,
    'id' | 'createdAt' | 'updatedAt' | 'createdBy'> &
  {
    id?: string;
  })
  => void;
  editingClient?: ClientRecord | null;
}
const maritalStatusOptions = [
{
  value: '',
  label: 'Selecione...'
},
{
  value: 'solteiro',
  label: 'Solteiro(a)'
},
{
  value: 'casado',
  label: 'Casado(a)'
},
{
  value: 'divorciado',
  label: 'Divorciado(a)'
},
{
  value: 'viuvo',
  label: 'Viúvo(a)'
},
{
  value: 'uniao_estavel',
  label: 'União Estável'
}];

const stateOptions = [
{
  value: '',
  label: 'UF'
},
{
  value: 'AC',
  label: 'AC'
},
{
  value: 'AL',
  label: 'AL'
},
{
  value: 'AP',
  label: 'AP'
},
{
  value: 'AM',
  label: 'AM'
},
{
  value: 'BA',
  label: 'BA'
},
{
  value: 'CE',
  label: 'CE'
},
{
  value: 'DF',
  label: 'DF'
},
{
  value: 'ES',
  label: 'ES'
},
{
  value: 'GO',
  label: 'GO'
},
{
  value: 'MA',
  label: 'MA'
},
{
  value: 'MT',
  label: 'MT'
},
{
  value: 'MS',
  label: 'MS'
},
{
  value: 'MG',
  label: 'MG'
},
{
  value: 'PA',
  label: 'PA'
},
{
  value: 'PB',
  label: 'PB'
},
{
  value: 'PR',
  label: 'PR'
},
{
  value: 'PE',
  label: 'PE'
},
{
  value: 'PI',
  label: 'PI'
},
{
  value: 'RJ',
  label: 'RJ'
},
{
  value: 'RN',
  label: 'RN'
},
{
  value: 'RS',
  label: 'RS'
},
{
  value: 'RO',
  label: 'RO'
},
{
  value: 'RR',
  label: 'RR'
},
{
  value: 'SC',
  label: 'SC'
},
{
  value: 'SP',
  label: 'SP'
},
{
  value: 'SE',
  label: 'SE'
},
{
  value: 'TO',
  label: 'TO'
}];

export function ClientFormModal({
  isOpen,
  onClose,
  onSave,
  editingClient
}: ClientFormModalProps) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | ''>('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [motherName, setMotherName] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setCpf(editingClient.cpf);
      setRg(editingClient.rg || '');
      setBirthDate(editingClient.birthDate || '');
      setMaritalStatus(editingClient.maritalStatus || '');
      setProfession(editingClient.profession || '');
      setPhone(editingClient.phone || '');
      setWhatsapp(editingClient.whatsapp || '');
      setEmail(editingClient.email || '');
      setMotherName(editingClient.motherName || '');
      setCep(editingClient.cep || '');
      setStreet(editingClient.street);
      setNumber(editingClient.number);
      setComplement(editingClient.complement || '');
      setNeighborhood(editingClient.neighborhood);
      setCity(editingClient.city);
      setState(editingClient.state);
      setObservations(editingClient.observations || '');
      setStatus(editingClient.status);
    } else {
      resetForm();
    }
    setErrors({});
  }, [editingClient, isOpen]);
  const resetForm = () => {
    setName('');
    setCpf('');
    setRg('');
    setBirthDate('');
    setMaritalStatus('');
    setProfession('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setMotherName('');
    setCep('');
    setStreet('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    setCity('');
    setState('');
    setObservations('');
    setStatus('ativo');
    setCepError('');
    setCepLoading(false);
  };
  const handleCepChange = async (rawValue: string) => {
    const masked = maskCEP(rawValue);
    setCep(masked);
    setCepError('');
    const digits = masked.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const base = appEnv.viaCepBaseUrl.replace(/\/$/, '');
      const res = await fetch(`${base}/${digits}/json/`);
      if (!res.ok) throw new Error('Erro na consulta');
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
      } else {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch {
      setCepError('Erro ao consultar CEP. Verifique sua conexão.');
    } finally {
      setCepLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(cpf)) {
      newErrors.cpf = 'CPF inválido';
    } else {
      // Check for duplicate CPF
      const cpfDigits = unmask(cpf);
      const duplicate = mockClientRecords.find(
        (c) => unmask(c.cpf) === cpfDigits && c.id !== editingClient?.id
      );
      if (duplicate) {
        newErrors.cpf = 'CPF já cadastrado';
      }
    }
    if (!street.trim()) newErrors.street = 'Logradouro é obrigatório';
    if (!number.trim()) newErrors.number = 'Número é obrigatório';
    if (!neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!state) newErrors.state = 'UF é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validate()) return;
    const clientData: Omit<
      ClientRecord,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy'> &
    {
      id?: string;
    } = {
      id: editingClient?.id,
      name,
      cpf,
      rg: rg || undefined,
      birthDate: birthDate || undefined,
      maritalStatus: maritalStatus as MaritalStatus || undefined,
      profession: profession || undefined,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      email: email || undefined,
      motherName: motherName || undefined,
      cep: cep || undefined,
      street,
      number,
      complement: complement || undefined,
      neighborhood,
      city,
      state,
      observations: observations || undefined,
      status
    };
    onSave(clientData);
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      size="xl">
      
      <div className="space-y-6">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4">
            Dados Pessoais
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nome Completo *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo do cliente"
                error={errors.name} />
              
            </div>
            <Input
              label="CPF *"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              error={errors.cpf} />
            
            <Input
              label="RG"
              value={rg}
              onChange={(e) => setRg(e.target.value)}
              placeholder="00.000.000-0" />
            
            <Input
              label="Data de Nascimento"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)} />
            
            <Select
              label="Estado Civil"
              value={maritalStatus}
              onChange={(e) =>
              setMaritalStatus(e.target.value as MaritalStatus)
              }
              options={maritalStatusOptions} />
            
            <Input
              label="Profissão"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ex: Engenheiro" />
            
            <Input
              label="Nome da Mãe"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="Nome completo da mãe" />
            
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4">
            Contato
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000" />
            
            <Input
              label="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000" />
            
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com" />
            
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4">
            Endereço *
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                label="CEP"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                error={cepError} />
              {cepLoading && (
                <p className="mt-1 text-xs text-text-secondary animate-pulse">Buscando endereço...</p>
              )}
            </div>
            <div className="md:col-span-4">
              <Input
                label="Logradouro *"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rua, Avenida, etc."
                error={errors.street} />
              
            </div>
            <Input
              label="Número *"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="123"
              error={errors.number} />
            
            <div className="md:col-span-2">
              <Input
                label="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Apt, Sala, etc." />
              
            </div>
            <div className="md:col-span-3">
              <Input
                label="Bairro *"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Bairro"
                error={errors.neighborhood} />
              
            </div>
            <div className="md:col-span-4">
              <Input
                label="Cidade *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
                error={errors.city} />
              
            </div>
            <div className="md:col-span-2">
              <Select
                label="UF *"
                value={state}
                onChange={(e) => setState(e.target.value)}
                options={stateOptions} />
              
              {errors.state &&
              <p className="mt-1 text-sm text-accent-red">{errors.state}</p>
              }
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4">
            Informações Adicionais
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Observações
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações sobre o cliente..."
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
                rows={3} />
              
            </div>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
              options={[
              {
                value: 'ativo',
                label: 'Ativo'
              },
              {
                value: 'inativo',
                label: 'Inativo'
              }]
              } />
            
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </div>
    </Modal>);

}