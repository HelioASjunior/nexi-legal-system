import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon, MoreVerticalIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { FinancialMovement } from '../types';
import { useData } from '../context/DataContext';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { FinancialMovementModal } from '../components/financial/FinancialMovementModal';
import { Modal } from '../components/Modal';
import { useLanguage } from '../context/LanguageContext';

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

type FinanceTab = 'todos' | 'abertos' | 'pagos';

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function FinanceiroPage() {
  const { clientRecords, financialMovements, setFinancialMovements } = useData();
  const { t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [tab, setTab] = useState<FinanceTab>('todos');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<FinancialMovement | null>(null);
  const [viewingMovement, setViewingMovement] = useState<FinancialMovement | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [showMovementMenu, setShowMovementMenu] = useState(false);
  const [movementPreset, setMovementPreset] = useState<{
    direction?: FinancialMovement['direction'];
    status?: FinancialMovement['status'];
    movementType?: FinancialMovement['movementType'];
    classification?: FinancialMovement['classification'];
    title?: string;
  } | null>(null);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMovementMenu(false);
      }

      // Keep row action menu open when interacting with its trigger/popup.
      if (!target.closest('[data-row-action-trigger]') && !target.closest('[data-row-action-menu]')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  useEffect(() => {
    if (isMovementModalOpen) {
      setShowMovementMenu(false);
    }
  }, [isMovementModalOpen]);

  const allMovements = useMemo(() => {
    return [...financialMovements].sort((a, b) => {
      const dateA = new Date(`${a.receivedAt}T12:00:00`).getTime();
      const dateB = new Date(`${b.receivedAt}T12:00:00`).getTime();
      return dateA - dateB;
    });
  }, [financialMovements]);

  const filteredMovements = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const searchDigits = searchTerm.replace(/\D/g, '');

    return allMovements.filter((movement) => {
      if (tab === 'abertos' && movement.status !== 'a_receber') return false;
      if (tab === 'pagos' && movement.status !== 'recebida') return false;

      const date = new Date(`${movement.receivedAt}T12:00:00`);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());

      const clientById = movement.clientId ? clientRecords.find((c) => c.id === movement.clientId) : undefined;
      const fallbackClient = clientRecords.find((c) => normalizeText(c.name) === normalizeText(movement.receivedFrom));
      const cpf = clientById?.cpf || fallbackClient?.cpf || '';

      const matchesSearch = !normalizedSearch ? true : (
        normalizeText(movement.receivedFrom).includes(normalizedSearch) ||
        normalizeText(movement.description).includes(normalizedSearch) ||
        normalizeText(cpf).includes(normalizedSearch) ||
        (searchDigits ? cpf.replace(/\D/g, '').includes(searchDigits) : false)
      );

      if (!matchesSearch) return false;

      // Busca global: quando há termo, não limita ao mês/ano selecionado.
      if (normalizedSearch) return true;

      if (filterMonth && month !== filterMonth) return false;
      if (filterYear && year !== filterYear) return false;
      return true;
    });
  }, [allMovements, clientRecords, filterMonth, filterYear, searchTerm, tab]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, FinancialMovement[]>();
    filteredMovements.forEach((movement) => {
      const key = movement.receivedAt;
      const current = groups.get(key) || [];
      current.push(movement);
      groups.set(key, current);
    });

    const orderedDates = Array.from(groups.keys()).sort((a, b) => {
      return new Date(`${a}T12:00:00`).getTime() - new Date(`${b}T12:00:00`).getTime();
    });

    let runningBalance = 0;
    const result = orderedDates.map((dateKey) => {
      const movements = groups.get(dateKey) || [];
      const previousBalance = runningBalance;
      const dayDelta = movements.reduce((sum, item) => {
        return sum + (item.direction === 'entrada' ? item.amount : -item.amount);
      }, 0);
      runningBalance += dayDelta;
      return {
        dateKey,
        previousBalance,
        dayBalance: runningBalance,
        movements,
      };
    });

    return result;
  }, [filteredMovements]);

  const handleSaveMovement = (movement: FinancialMovement) => {
    if (editingMovement) {
      setFinancialMovements((prev) =>
        prev.map((item) =>
          item.id === editingMovement.id
            ? {
                ...item,
                ...movement,
                id: editingMovement.id,
                installmentGroupId: editingMovement.installmentGroupId,
                installmentIndex: editingMovement.installmentIndex,
                installmentCount: editingMovement.installmentCount,
                createdAt: editingMovement.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );
      setEditingMovement(null);
      setMovementPreset(null);
      return;
    }

    const parcelCount = Math.max(1, movement.installmentCount || 1);
    const baseDate = new Date(`${movement.receivedAt}T12:00:00`);
    const groupId = movement.installmentGroupId || `grp-${movement.id}-${Date.now()}`;

    const expanded: FinancialMovement[] = Array.from({ length: parcelCount }, (_, index) => {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + index);
      return {
        ...movement,
        id: `${movement.id}-${index + 1}`,
        installmentGroupId: groupId,
        installmentCount: parcelCount,
        installmentIndex: index + 1,
        repeatMonthly: parcelCount > 1,
        receivedAt: dueDate.toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      };
    });

    setFinancialMovements((prev) => [...expanded, ...prev]);
    setMovementPreset(null);
  };

  const handleDeleteMovement = (movement: FinancialMovement) => {
    if (!confirm('Deseja excluir este lançamento?')) return;
    setFinancialMovements((prev) => prev.filter((item) => item.id !== movement.id));
  };

  const togglePaid = (movementId: string, checked: boolean) => {
    setFinancialMovements((prev) =>
      prev.map((movement) =>
        movement.id === movementId
          ? { ...movement, status: checked ? 'recebida' : 'a_receber', updatedAt: new Date().toISOString() }
          : movement
      )
    );
  };

  const openMovementModal = (preset: NonNullable<typeof movementPreset>) => {
    setEditingMovement(null);
    setMovementPreset(preset);
    setShowMovementMenu(false);
    requestAnimationFrame(() => setIsMovementModalOpen(true));
  };

  const openEditMovement = (movement: FinancialMovement) => {
    setShowMovementMenu(false);
    setOpenActionMenuId(null);
    setMovementPreset(null);
    setEditingMovement(movement);
    requestAnimationFrame(() => setIsMovementModalOpen(true));
  };

  const openViewMovement = (movement: FinancialMovement) => {
    setOpenActionMenuId(null);
    setViewingMovement(movement);
  };

  const movementMenuOptions = [
    {
      label: 'Honorário',
      preset: {
        direction: 'entrada' as const,
        status: 'a_receber' as const,
        movementType: 'honorario' as const,
        classification: 'Honorários' as const,
        title: 'Novo lançamento - Honorário'
      }
    },
    {
      label: 'Outras Entradas',
      preset: {
        direction: 'entrada' as const,
        status: 'a_receber' as const,
        movementType: 'entrada_avulsa' as const,
        title: 'Novo lançamento - Outras Entradas'
      }
    },
    {
      label: 'Saída',
      preset: {
        direction: 'saida' as const,
        status: 'a_receber' as const,
        movementType: 'adiantamento_despesa' as const,
        title: 'Novo lançamento - Saída'
      }
    },
    {
      label: 'Transferência',
      preset: {
        direction: 'saida' as const,
        status: 'a_receber' as const,
        movementType: 'entrada_avulsa' as const,
        title: 'Novo lançamento - Transferência'
      }
    }
  ] as const;
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="relative z-[220] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
            {t('sidebar.financial') || 'Financial'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t('finance.subtitle') || 'Management of entries, income and expenses'}
          </p>
        </div>
        <div ref={menuRef} className="relative">
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowMovementMenu((prev) => !prev)}>
            {t('financial.addEntry') || 'Add entry'}
          </Button>
          {showMovementMenu && (
            <div className="absolute right-0 mt-2 w-56 z-[260] rounded-2xl glass-strong border border-[var(--glass-border)] shadow-lg overflow-hidden">
              {movementMenuOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                  onClick={() => openMovementModal(option.preset)}>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-[var(--glass-border)] animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 lg:pb-0 lg:border-b-0">
            <button type="button" className={`px-3 py-1.5 text-sm ${tab === 'todos' ? 'text-accent-blue border-b-2 border-accent-blue' : 'text-text-secondary'}`} onClick={() => setTab('todos')}>{t('common.all') || 'All'}</button>
            <button type="button" className={`px-3 py-1.5 text-sm ${tab === 'abertos' ? 'text-accent-blue border-b-2 border-accent-blue' : 'text-text-secondary'}`} onClick={() => setTab('abertos')}>{t('finance.toPayOrReceive') || 'To pay / To receive'}</button>
            <button type="button" className={`px-3 py-1.5 text-sm ${tab === 'pagos' ? 'text-accent-blue border-b-2 border-accent-blue' : 'text-text-secondary'}`} onClick={() => setTab('pagos')}>{t('finance.paidAndReceived') || 'Paid and received'}</button>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('finance.searchAllMonths') || 'Search by name or CPF (all months)'}
                className="w-full pl-10 pr-3 py-2 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60"
              />
            </div>
            <div className="w-36">
              <Select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} options={monthOptions} />
            </div>
            <div className="w-28">
              <Select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} options={yearOptions} />
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-white/10">
                <th className="py-2 px-2">{t('common.date') || 'Date'}</th>
                <th className="py-2 px-2">{t('common.type') || 'Type'}</th>
                <th className="py-2 px-2">{t('finance.party') || 'Received from / Paid to'}</th>
                <th className="py-2 px-2">{t('common.description') || 'Description'}</th>
                <th className="py-2 px-2">{t('common.category') || 'Category'}</th>
                <th className="py-2 px-2 text-right">{t('common.amount') || 'Amount'}</th>
                <th className="py-2 px-2 text-center">{t('common.paid') || 'Paid'}</th>
                <th className="py-2 px-2 text-center">{t('common.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-secondary">{t('finance.noEntries') || 'No entries found'}</td>
                </tr>
              )}
              {groupedRows.map((group) => (
                <Fragment key={`group-${group.dateKey}`}>
                  <tr key={`saldo-${group.dateKey}`} className="bg-white/[0.03] border-b border-white/10">
                    <td colSpan={8} className="py-2 px-2 text-xs text-text-secondary">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span>{t('finance.dateLabel') || 'Date'}: {new Date(`${group.dateKey}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                        <span>{t('finance.previousBalance') || 'Previous balance'}: {group.previousBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <span className="text-text-primary">{t('finance.dayBalance') || 'Day balance'}: {group.dayBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    </td>
                  </tr>
                  {group.movements.map((movement) => {
                    const isIncome = movement.direction === 'entrada';
                    const value = isIncome ? movement.amount : -movement.amount;
                    const valueColor = isIncome ? 'text-text-primary' : 'text-accent-red';

                    return (
                      <tr key={movement.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="py-2 px-2 text-text-primary">{new Date(`${movement.receivedAt}T12:00:00`).toLocaleDateString('pt-BR')}</td>
                        <td className="py-2 px-2">
                          {isIncome ? (
                            <ArrowDownRightIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRightIcon className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                        <td className="py-2 px-2 text-accent-blue">
                          {movement.receivedFrom}
                          {movement.installmentCount && movement.installmentCount > 1 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-white/15 text-[11px] text-text-secondary">
                              {movement.installmentIndex}/{movement.installmentCount}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-text-primary">{movement.description}</td>
                        <td className="py-2 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-cyan-400/20 text-cyan-300">{movement.classification}</span>
                        </td>
                        <td className={`py-2 px-2 text-right font-medium ${valueColor}`}>
                          {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={movement.status === 'recebida'}
                            onChange={(e) => togglePaid(movement.id, e.target.checked)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <div className="relative flex items-center justify-center">
                            <button
                              type="button"
                              data-row-action-trigger
                              className="p-1.5 rounded hover:bg-white/10 text-text-secondary hover:text-text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId((prev) => prev === movement.id ? null : movement.id);
                              }}
                              aria-label="Ações do lançamento">
                              <MoreVerticalIcon className="w-4 h-4" />
                            </button>
                            {openActionMenuId === movement.id && (
                              <div
                                data-row-action-menu
                                className="absolute right-0 top-8 z-[300] min-w-36 rounded-xl glass-strong border border-[var(--glass-border)] shadow-lg overflow-hidden">
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-white/10"
                                  onClick={() => openViewMovement(movement)}>
                                      {t('common.view') || 'View'}
                                </button>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-white/10"
                                  onClick={() => openEditMovement(movement)}>
                                      {t('common.edit') || 'Edit'}
                                </button>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-accent-red hover:bg-accent-red/10"
                                  onClick={() => handleDeleteMovement(movement)}>
                                      {t('common.delete') || 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FinancialMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setEditingMovement(null);
          setMovementPreset(null);
        }}
        onSave={handleSaveMovement}
        clientRecords={clientRecords}
        movement={editingMovement}
        preset={movementPreset} />

      <Modal
        isOpen={!!viewingMovement}
        onClose={() => setViewingMovement(null)}
        title={t('financial.viewEntry') || 'View entry'}
        size="md">
        {viewingMovement && (
          <div className="space-y-3 text-sm">
            <p className="text-text-secondary">{t('common.date') || 'Date'}: <span className="text-text-primary">{new Date(`${viewingMovement.receivedAt}T12:00:00`).toLocaleDateString('pt-BR')}</span></p>
            <p className="text-text-secondary">{t('common.type') || 'Type'}: <span className="text-text-primary">{viewingMovement.direction === 'entrada' ? (t('financial.income') || 'Income') : (t('financial.expense') || 'Expense')}</span></p>
            <p className="text-text-secondary">{t('common.name') || 'Name'}: <span className="text-text-primary">{viewingMovement.receivedFrom}</span></p>
            <p className="text-text-secondary">{t('common.description') || 'Description'}: <span className="text-text-primary">{viewingMovement.description}</span></p>
            <p className="text-text-secondary">{t('common.category') || 'Category'}: <span className="text-text-primary">{viewingMovement.classification}</span></p>
            <p className="text-text-secondary">{t('common.amount') || 'Amount'}: <span className="text-text-primary">{(viewingMovement.direction === 'entrada' ? viewingMovement.amount : -viewingMovement.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
            <p className="text-text-secondary">{t('common.status') || 'Status'}: <span className="text-text-primary">{viewingMovement.status === 'recebida' ? (t('financial.received') || 'Paid / Received') : (t('financial.toReceive') || 'To pay / To receive')}</span></p>
          </div>
        )}
      </Modal>
      </div>
      );

}