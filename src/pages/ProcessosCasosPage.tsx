import { useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllUsers } from '../data/authData';
import { type LegalProcess } from '../types';

type ProcessFormState = {
  clientId: string;
  clientSearch: string;
  clientQualification: string;
  otherInvolvedName: string;
  otherInvolvedQualification: string;
  title: string;
  label: string;
  instance: '1_grau' | '2_grau' | 'superior' | 'supremo' | 'outra';
  number: string;
  courtNumber: string;
  courtDivision: string;
  forum: string;
  action: string;
  tribunalLink: string;
  subject: string;
  claimValue: string;
  distributedAt: string;
  condemnationValue: string;
  notes: string;
  responsibleId: string;
};

const INSTANCE_OPTIONS: { value: ProcessFormState['instance']; labelPt: string; labelEn: string }[] = [
  { value: '1_grau', labelPt: '1o Grau', labelEn: '1st Instance' },
  { value: '2_grau', labelPt: '2o Grau', labelEn: '2nd Instance' },
  { value: 'superior', labelPt: 'Superior', labelEn: 'Superior Court' },
  { value: 'supremo', labelPt: 'Supremo', labelEn: 'Supreme Court' },
  { value: 'outra', labelPt: 'Outra', labelEn: 'Other' },
];

const initialFormState: ProcessFormState = {
  clientId: '',
  clientSearch: '',
  clientQualification: '',
  otherInvolvedName: '',
  otherInvolvedQualification: '',
  title: '',
  label: '',
  instance: '1_grau',
  number: '',
  courtNumber: '',
  courtDivision: '',
  forum: '',
  action: '',
  tribunalLink: '',
  subject: '',
  claimValue: '',
  distributedAt: '',
  condemnationValue: '',
  notes: '',
  responsibleId: '',
};

function parseCurrencyValue(value: string): number | undefined {
  const sanitized = value.replace(/\./g, '').replace(',', '.').trim();
  if (!sanitized) return undefined;
  const num = Number(sanitized);
  return Number.isFinite(num) ? num : undefined;
}

export function ProcessosCasosPage() {
  const { t, language } = useLanguage();
  const { legalProcesses, setLegalProcesses, clientRecords } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);
  const [form, setForm] = useState<ProcessFormState>(initialFormState);

  const users = useMemo(() => getAllUsers().filter((u) => u.active), []);

  const clients = useMemo(
    () => clientRecords.filter((c) => !c.deletedAt && c.status === 'ativo'),
    [clientRecords]
  );

  const processRows = useMemo(() => {
    return [...legalProcesses].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [legalProcesses]);

  const otherInvolvedSuggestions = useMemo(() => {
    const query = form.otherInvolvedName.trim().toLowerCase();
    if (!query) return clients.slice(0, 8);

    return clients.
    filter((c) => c.name.toLowerCase().includes(query)).
    slice(0, 8);
  }, [clients, form.otherInvolvedName]);

  const clientSuggestions = useMemo(() => {
    const query = form.clientSearch.trim().toLowerCase();
    if (!query) return clients.slice(0, 8);

    return clients.
    filter((c) => c.name.toLowerCase().includes(query)).
    slice(0, 8);
  }, [clients, form.clientSearch]);

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || t('common.notFound');
  };

  const instanceLabel = (instance?: LegalProcess['instance']) => {
    const found = INSTANCE_OPTIONS.find((opt) => opt.value === instance);
    if (!found) return '-';
    return language === 'pt' ? found.labelPt : found.labelEn;
  };

  const resetForm = () => {
    const defaultResponsible = users[0]?.id || '';
    setForm({ ...initialFormState, responsibleId: defaultResponsible });
  };

  const openNewModal = () => {
    setEditingProcessId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (process: LegalProcess) => {
    setEditingProcessId(process.id);
    setForm({
      clientId: process.client || '',
      clientSearch: getClientName(process.client),
      clientQualification: process.clientQualification || '',
      otherInvolvedName: process.otherInvolvedName || '',
      otherInvolvedQualification: process.otherInvolvedQualification || '',
      title: process.title || '',
      label: process.label || '',
      instance: process.instance || '1_grau',
      number: process.number || '',
      courtNumber: process.courtNumber || '',
      courtDivision: process.courtDivision || '',
      forum: process.forum || '',
      action: process.action || '',
      tribunalLink: process.tribunalLink || '',
      subject: process.subject || process.description || '',
      claimValue: typeof process.claimValue === 'number' ? String(process.claimValue) : '',
      distributedAt: process.distributedAt || '',
      condemnationValue: typeof process.condemnationValue === 'number' ? String(process.condemnationValue) : '',
      notes: process.notes || '',
      responsibleId: process.responsibleId || users[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (processId: string) => {
    const confirmed = window.confirm(
      t('processes.confirmDelete') || 'Tem certeza que deseja excluir este processo?'
    );
    if (!confirmed) return;
    setLegalProcesses((prev) => prev.filter((p) => p.id !== processId));
  };

  const handleSave = () => {
    if (!form.clientId || !form.title.trim() || !form.responsibleId) {
      return;
    }

    const now = new Date().toISOString();
    const responsible = users.find((u) => u.id === form.responsibleId);

    const tribunal = [form.courtNumber, form.courtDivision, form.forum]
      .map((v) => v.trim())
      .filter(Boolean)
      .join(' - ');

    const process: LegalProcess = {
      id: editingProcessId || `proc-${Date.now()}`,
      number: form.number.trim(),
      client: form.clientId,
      tribunal,
      description: form.subject.trim() || form.title.trim(),
      title: form.title.trim(),
      label: form.label.trim() || undefined,
      instance: form.instance,
      clientQualification: form.clientQualification.trim() || undefined,
      otherInvolvedName: form.otherInvolvedName.trim() || undefined,
      otherInvolvedQualification: form.otherInvolvedQualification.trim() || undefined,
      courtNumber: form.courtNumber.trim() || undefined,
      courtDivision: form.courtDivision.trim() || undefined,
      forum: form.forum.trim() || undefined,
      action: form.action.trim() || undefined,
      tribunalLink: form.tribunalLink.trim() || undefined,
      subject: form.subject.trim() || undefined,
      claimValue: parseCurrencyValue(form.claimValue),
      distributedAt: form.distributedAt || undefined,
      condemnationValue: parseCurrencyValue(form.condemnationValue),
      notes: form.notes.trim() || undefined,
      responsibleId: form.responsibleId,
      responsibleName: responsible?.name,
      createdAt:
      legalProcesses.find((p) => p.id === editingProcessId)?.createdAt || now,
      updatedAt: now,
    };

    if (editingProcessId) {
      setLegalProcesses((prev) =>
      prev.map((p) => p.id === editingProcessId ? process : p)
      );
    } else {
      setLegalProcesses((prev) => [process, ...prev]);
    }

    setIsModalOpen(false);
    setEditingProcessId(null);
    resetForm();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-1">
            {t('processes.title') || 'Processos e Casos'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t('processes.subtitle') || 'Cadastro e acompanhamento dos processos do escritorio'}
          </p>
        </div>

        <Button variant="primary" icon={<PlusIcon className="w-5 h-5" />} onClick={openNewModal}>
          {t('processes.addNew') || 'Adicionar novo processo'}
        </Button>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-white/10 text-text-secondary">
              <tr>
                <th className="text-left py-3 px-4">{t('processes.fields.number') || 'Numero'}</th>
                <th className="text-left py-3 px-4">{t('processes.fields.title') || 'Titulo'}</th>
                <th className="text-left py-3 px-4">{t('processes.fields.client') || 'Cliente'}</th>
                <th className="text-left py-3 px-4">{t('processes.fields.instance') || 'Instancia'}</th>
                <th className="text-left py-3 px-4">{t('calendar.responsible') || 'Responsavel'}</th>
                <th className="text-left py-3 px-4">{t('processes.fields.distributedAt') || 'Distribuido em'}</th>
                <th className="text-right py-3 px-4">{t('common.actions') || 'Acoes'}</th>
              </tr>
            </thead>
            <tbody>
              {processRows.length === 0 && (
                <tr>
                  <td className="py-8 px-4 text-center text-text-secondary" colSpan={7}>
                    {t('processes.empty') || 'Nenhum processo cadastrado'}
                  </td>
                </tr>
              )}

              {processRows.map((process) => (
                <tr key={process.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="py-3 px-4 text-text-primary">{process.number || '-'}</td>
                  <td className="py-3 px-4 text-text-primary">{process.title || '-'}</td>
                  <td className="py-3 px-4 text-text-primary">{getClientName(process.client)}</td>
                  <td className="py-3 px-4 text-text-primary">{instanceLabel(process.instance)}</td>
                  <td className="py-3 px-4 text-text-primary">{process.responsibleName || '-'}</td>
                  <td className="py-3 px-4 text-text-primary">{process.distributedAt || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(process)}>
                        {t('common.edit') || 'Editar'}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(process.id)}>
                        {t('common.delete') || 'Excluir'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProcessId(null);
        }}
        title={
          editingProcessId ?
          (t('processes.modalEditTitle') || 'Editar processo') :
          (t('processes.modalTitle') || 'Novo processo')
        }
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label={`${t('processes.fields.client') || 'Clientes'}*`}
                value={form.clientSearch}
                onChange={(e) => {
                  const query = e.target.value;
                  const matchedClient = clients.find(
                    (c) => c.name.toLowerCase() === query.trim().toLowerCase()
                  );

                  setForm((prev) => ({
                    ...prev,
                    clientSearch: query,
                    clientId: matchedClient?.id || '',
                  }));
                }}
                placeholder={t('processes.selectClient') || 'Selecione um cliente'}
                list="process-client-suggestions" />

              <datalist id="process-client-suggestions">
                {clientSuggestions.map((client) =>
                <option key={client.id} value={client.name} />
                )}
              </datalist>
            </div>
            <Input
              label={t('processes.fields.clientQualification') || 'Qualificacao'}
              value={form.clientQualification}
              onChange={(e) => setForm((prev) => ({ ...prev, clientQualification: e.target.value }))}
              placeholder={t('processes.placeholders.qualification') || 'Qualificacao'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label={t('processes.fields.otherInvolved') || 'Outros envolvidos'}
                value={form.otherInvolvedName}
                onChange={(e) => setForm((prev) => ({ ...prev, otherInvolvedName: e.target.value }))}
                placeholder={t('processes.placeholders.otherInvolved') || 'Digite o nome do envolvido'}
                list="process-other-involved-clients" />

              <datalist id="process-other-involved-clients">
                {otherInvolvedSuggestions.map((client) =>
                <option key={client.id} value={client.name} />
                )}
              </datalist>
            </div>
            <Input
              label={t('processes.fields.otherInvolvedQualification') || 'Qualificacao'}
              value={form.otherInvolvedQualification}
              onChange={(e) => setForm((prev) => ({ ...prev, otherInvolvedQualification: e.target.value }))}
              placeholder={t('processes.placeholders.qualification') || 'Qualificacao'}
            />
          </div>

          <Input
            label={`${t('processes.fields.title') || 'Titulo'}*`}
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={t('processes.placeholders.title') || 'Digite o titulo do processo'}
          />

          <Input
            label={t('processes.fields.label') || 'Etiqueta'}
            value={form.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder={t('processes.placeholders.label') || 'Digite a etiqueta'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('processes.fields.instance') || 'Instancia'}
              value={form.instance}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, instance: e.target.value as ProcessFormState['instance'] }))
              }
              options={INSTANCE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: language === 'pt' ? opt.labelPt : opt.labelEn,
              }))}
            />
            <Input
              label={t('processes.fields.number') || 'Numero'}
              value={form.number}
              onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
              placeholder={t('processes.placeholders.number') || 'Digite o numero do processo'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('processes.fields.courtNumber') || 'Juizo'}
              value={form.courtNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, courtNumber: e.target.value }))}
            />
            <Input
              label={t('processes.fields.courtDivision') || 'Vara'}
              value={form.courtDivision}
              onChange={(e) => setForm((prev) => ({ ...prev, courtDivision: e.target.value }))}
            />
            <Input
              label={t('processes.fields.forum') || 'Foro'}
              value={form.forum}
              onChange={(e) => setForm((prev) => ({ ...prev, forum: e.target.value }))}
            />
          </div>

          <Input
            label={t('processes.fields.action') || 'Acao'}
            value={form.action}
            onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value }))}
            placeholder={t('processes.placeholders.action') || 'Digite a acao'}
          />

          <Input
            label={t('processes.fields.tribunalLink') || 'Link no tribunal'}
            value={form.tribunalLink}
            onChange={(e) => setForm((prev) => ({ ...prev, tribunalLink: e.target.value }))}
            placeholder={t('processes.placeholders.tribunalLink') || 'Digite o link no tribunal'}
          />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('processes.fields.subject') || 'Objeto'}
            </label>
            <textarea
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder={t('processes.placeholders.subject') || 'Digite a descricao do processo'}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('processes.fields.claimValue') || 'Valor da causa'}
              value={form.claimValue}
              onChange={(e) => setForm((prev) => ({ ...prev, claimValue: e.target.value }))}
              placeholder={t('processes.placeholders.value') || 'Digite o valor'}
            />
            <Input
              label={t('processes.fields.distributedAt') || 'Distribuido em'}
              type="date"
              value={form.distributedAt}
              onChange={(e) => setForm((prev) => ({ ...prev, distributedAt: e.target.value }))}
            />
          </div>

          <Input
            label={t('processes.fields.condemnationValue') || 'Valor da condenacao'}
            value={form.condemnationValue}
            onChange={(e) => setForm((prev) => ({ ...prev, condemnationValue: e.target.value }))}
            placeholder={t('processes.placeholders.value') || 'Digite o valor'}
          />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('processes.fields.notes') || 'Observacoes'}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={t('processes.placeholders.notes') || 'Digite mais detalhes'}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 resize-none"
              rows={3}
            />
          </div>

          <Select
            label={`${t('calendar.responsible') || 'Responsavel'}*`}
            value={form.responsibleId}
            onChange={(e) => setForm((prev) => ({ ...prev, responsibleId: e.target.value }))}
            options={[
              { value: '', label: t('processes.selectResponsible') || 'Selecione um responsavel' },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingProcessId(null);
              }}>
              {t('common.cancel') || 'Cancelar'}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('common.save') || 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
