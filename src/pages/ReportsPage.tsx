import { useMemo, useRef, useState } from 'react';
import {
  DownloadIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  PieChartIcon,
  BarChart3Icon } from
'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart } from
'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
const reportTypes = [
{
  id: 'geral',
  title: 'reports.general',
  description: 'reports.generalDesc',
  icon: <PieChartIcon className="w-6 h-6" />,
  color: 'blue'
},
{
  id: 'inadimplencia',
  title: 'reports.overdue',
  description: 'reports.overdueDesc',
  icon: <AlertTriangleIcon className="w-6 h-6" />,
  color: 'red'
},
{
  id: 'recebimentos',
  title: 'reports.receipts',
  description: 'reports.receiptsDesc',
  icon: <TrendingUpIcon className="w-6 h-6" />,
  color: 'green'
},
{
  id: 'clientes',
  title: 'reports.clients',
  description: 'reports.clientsDesc',
  icon: <UsersIcon className="w-6 h-6" />,
  color: 'orange'
},
{
  id: 'previsao',
  title: 'reports.forecast',
  description: 'reports.forecastDesc',
  icon: <CalendarIcon className="w-6 h-6" />,
  color: 'purple'
}];

const monthOptions = [
{
  value: '01',
  label: 'reports.month.jan'
},
{
  value: '02',
  label: 'reports.month.feb'
},
{
  value: '03',
  label: 'reports.month.mar'
},
{
  value: '04',
  label: 'reports.month.apr'
},
{
  value: '05',
  label: 'reports.month.may'
},
{
  value: '06',
  label: 'reports.month.jun'
},
{
  value: '07',
  label: 'reports.month.jul'
},
{
  value: '08',
  label: 'reports.month.aug'
},
{
  value: '09',
  label: 'reports.month.sep'
},
{
  value: '10',
  label: 'reports.month.oct'
},
{
  value: '11',
  label: 'reports.month.nov'
},
{
  value: '12',
  label: 'reports.month.dec'
}];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  {
    length: 5
  },
  (_, i) => ({
    value: (currentYear - 2 + i).toString(),
    label: (currentYear - 2 + i).toString()
  })
);
const colorClasses: Record<string, string> = {
  red: 'bg-[var(--accent-red)]/20 text-[var(--accent-red)] border-[var(--accent-red)]/30',
  green:
  'bg-[var(--accent-green)]/20 text-[var(--accent-green)] border-[var(--accent-green)]/30',
  blue: 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] border-[var(--accent-blue)]/30',
  orange:
  'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] border-[var(--accent-orange)]/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};
export function ReportsPage() {
  const { t } = useLanguage();
  const { financialMovements } = useData();
  const reportPdfSnapshotRef = useRef<HTMLDivElement>(null);
  const [selectedReport, setSelectedReport] = useState<string>('geral');
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [startMonth, setStartMonth] = useState('01');
  const [startYear, setStartYear] = useState(currentYear.toString());
  const [endMonth, setEndMonth] = useState(currentMonth);
  const [endYear, setEndYear] = useState(currentYear.toString());
  const [isGenerating, setIsGenerating] = useState(false);
  const metrics = useMemo(() => {
    let totalReceived = 0,
      totalPending = 0,
      totalOverdue = 0;
    let paidCount = 0,
      pendingCount = 0,
      overdueCount = 0;
    const today = new Date();
    financialMovements.forEach((movement) => {
      const signal = movement.direction === 'entrada' ? 1 : -1;
      const value = movement.amount * signal;
      if (movement.status === 'recebida') {
        totalReceived += value;
        paidCount++;
      } else if (new Date(`${movement.receivedAt}T12:00:00`) < today) {
        totalOverdue += value;
        overdueCount++;
      } else {
        totalPending += value;
        pendingCount++;
      }
    });

    const counterparties = new Set(financialMovements.map((m) => m.receivedFrom.toLowerCase().trim()));
    return {
      totalReceived,
      totalPending,
      totalOverdue,
      paidCount,
      pendingCount,
      overdueCount,
      totalClients: counterparties.size
    };
  }, [financialMovements]);
  const statusPieData = useMemo(
    () =>
    [
    {
      name: t('reports.paid') || 'Paid',
      value: metrics.paidCount,
      color: 'var(--accent-green)'
    },
    {
      name: t('reports.pending') || 'Pending',
      value: metrics.pendingCount,
      color: 'var(--accent-orange)'
    },
    {
      name: t('reports.overdue') || 'Overdue',
      value: metrics.overdueCount,
      color: 'var(--accent-red)'
    }].
    filter((item) => item.value > 0),
    [metrics]
  );
  const monthlyData = useMemo(() => {
    const data: Record<
      string,
      {
        month: string;
        recebido: number;
        pendente: number;
        atrasado: number;
      }> =
    {};
    const today = new Date();
    financialMovements.forEach((movement) => {
      const date = new Date(`${movement.receivedAt}T12:00:00`);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthLabel = t(monthOptions[date.getMonth()]?.label || '') || monthOptions[date.getMonth()]?.label?.slice(0, 3) || '';
      const signal = movement.direction === 'entrada' ? 1 : -1;
      const value = movement.amount * signal;
      if (!data[monthKey]) {
        data[monthKey] = {
          month: monthLabel,
          recebido: 0,
          pendente: 0,
          atrasado: 0
        };
      }
      if (movement.status === 'recebida') data[monthKey].recebido += value;else
      if (date < today) data[monthKey].atrasado += value;else
      data[monthKey].pendente += value;
    });
    return Object.values(data).slice(-6);
  }, [financialMovements]);
  const clientValueData = useMemo(() => {
    const grouped = new Map<string, {total: number; pago: number}>();
    financialMovements.forEach((movement) => {
      const key = movement.receivedFrom.trim() || 'Sem nome';
      const signal = movement.direction === 'entrada' ? 1 : -1;
      const value = movement.amount * signal;
      const current = grouped.get(key) || { total: 0, pago: 0 };
      current.total += value;
      if (movement.status === 'recebida') current.pago += value;
      grouped.set(key, current);
    });
    return Array.from(grouped.entries())
      .map(([name, values]) => ({ name: name.split(' ')[0], total: values.total, pago: values.pago }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
      .slice(0, 5);
  }, [financialMovements]);
  const generatePDF = async () => {
    setIsGenerating(true);

    // Allow pending chart animations/layout updates to flush before capture.
    await new Promise((resolve) => setTimeout(resolve, 250));

    try {
      const exportNode = reportPdfSnapshotRef.current;
      if (!exportNode) {
        throw new Error('Painel de relatórios não encontrado para exportação.');
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 8;
      const isLightTheme = document.documentElement.classList.contains('light');

      const canvas = await html2canvas(exportNode, {
        scale: 2,
        useCORS: true,
        backgroundColor: isLightTheme ? '#f6f8fa' : '#0e1117'
      });

      const imageData = canvas.toDataURL('image/png', 1.0);
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const imageRatio = canvas.width / canvas.height;
      const pageRatio = availableWidth / availableHeight;
      let renderWidth = availableWidth;
      let renderHeight = availableHeight;

      if (imageRatio > pageRatio) {
        renderHeight = availableWidth / imageRatio;
      } else {
        renderWidth = availableHeight * imageRatio;
      }

      const offsetX = (pageWidth - renderWidth) / 2;
      const offsetY = (pageHeight - renderHeight) / 2;

      doc.addImage(imageData, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');

      const startMonthName =
      monthOptions.find((m) => m.value === startMonth)?.label || '';
      const endMonthName =
      monthOptions.find((m) => m.value === endMonth)?.label || '';
      doc.setTextColor(120);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Periodo: ${startMonthName}/${startYear} ate ${endMonthName}/${endYear} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
        margin,
        pageHeight - 4
      );

      doc.save(
        `relatorio_${selectedReport}_${startMonth}${startYear}_${endMonth}${endYear}.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setIsGenerating(false);
  };
  const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(0)}k`;
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
          {t('reports.title')}
        </h1>
        <p className="text-[var(--text-secondary)]">
          {t('reports.subtitle')}
        </p>
      </div>

      <div
        className="glass rounded-2xl p-5 border border-[var(--glass-border)] animate-fade-in"
        style={{
          animationDelay: '50ms'
        }}>
        
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">De:</span>
            <div className="w-32">
              <Select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                options={monthOptions} />
              
            </div>
            <div className="w-24">
              <Select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                options={yearOptions} />
              
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Até:</span>
            <div className="w-32">
              <Select
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                options={monthOptions} />
              
            </div>
            <div className="w-24">
              <Select
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                options={yearOptions} />
              
            </div>
          </div>
          <Button
            variant="primary"
            icon={
            isGenerating ?
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

            <DownloadIcon className="w-4 h-4" />

            }
            onClick={generatePDF}
            disabled={isGenerating}>
            
            {isGenerating ? 'Gerando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      <div
        ref={reportPdfSnapshotRef}
        className="fixed left-[-12000px] top-0 w-[1580px] h-[1120px] overflow-hidden bg-[var(--dark-bg)] text-[var(--text-primary)] p-10"
      >
        <div className="h-full w-full flex flex-col gap-8">
          <div className="rounded-[28px] border border-[var(--glass-border)] bg-[linear-gradient(135deg,rgba(88,166,255,0.14),rgba(255,255,255,0.02),rgba(63,185,80,0.12))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--dark-surface)]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  Relatório Executivo
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-blue)]" />
                  
                </div>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                  Painel Financeiro Corporativo
                </h2>
                <p className="mt-3 text-base leading-6 text-[var(--text-secondary)] max-w-2xl">
                  Visão consolidada da carteira, com status de recebimento, inadimplência e evolução mensal em uma única leitura executiva.
                </p>
              </div>

              <div className="min-w-[280px] rounded-2xl border border-[var(--glass-border)] bg-[var(--dark-surface)]/70 p-4 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]">Período selecionado</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                  {monthOptions.find((m) => m.value === startMonth)?.label || ''}/{startYear} até {monthOptions.find((m) => m.value === endMonth)?.label || ''}/{endYear}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[var(--glass-bg)] p-3">
                    <p className="text-[11px] text-[var(--text-secondary)]">Gerado em</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{new Date().toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--glass-bg)] p-3">
                    <p className="text-[11px] text-[var(--text-secondary)]">Base</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">Lançamentos financeiros</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-5">
            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">Total Clientes</p>
              <div className="text-4xl font-bold text-[var(--text-primary)]">{metrics.totalClients}</div>
            </div>
            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">Total Recebido</p>
              <div className="text-4xl font-bold text-[var(--accent-green)]">R$ {(metrics.totalReceived / 1000).toFixed(1)}k</div>
            </div>
            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">Pendente</p>
              <div className="text-4xl font-bold text-[var(--accent-orange)]">R$ {(metrics.totalPending / 1000).toFixed(1)}k</div>
            </div>
            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">Em Atraso</p>
              <div className="text-4xl font-bold text-[var(--accent-red)]">R$ {(metrics.totalOverdue / 1000).toFixed(1)}k</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] min-h-0">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[var(--accent-blue)]" />
                Distribuição de Status
              </h3>
              <div className="h-[320px]">
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`snapshot-pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--dark-surface)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '10px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">Nenhum dado financeiro</div>
                )}
              </div>
            </div>

            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)] min-h-0">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5 text-[var(--accent-green)]" />
                Evolução Mensal
              </h3>
              <div className="h-[320px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={formatCurrency} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--dark-surface)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '10px'
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                      />
                      <Legend />
                      <Bar dataKey="recebido" name="Recebido" fill="var(--accent-green)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="pendente" name="Pendente" fill="var(--accent-orange)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="atrasado" name="Atrasado" fill="var(--accent-red)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">Nenhum dado financeiro</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)]">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-5">Tendência de Recebimentos</h3>
              <div className="h-[260px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="snapshotRecebido" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={formatCurrency} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--dark-surface)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '10px'
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                      />
                      <Area type="monotone" dataKey="recebido" stroke="var(--accent-green)" fillOpacity={1} fill="url(#snapshotRecebido)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">Nenhum dado financeiro</div>
                )}
              </div>
            </div>

            <div className="glass rounded-3xl p-6 border border-[var(--glass-border)]">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-5">Top 5 Clientes</h3>
              <div className="h-[260px]">
                {clientValueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientValueData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                      <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickFormatter={formatCurrency} />
                      <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--dark-surface)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '10px'
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="var(--accent-blue)" radius={[0, 6, 6, 0]} />
                      <Bar dataKey="pago" name="Pago" fill="var(--accent-green)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">Nenhum cliente cadastrado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in"
        style={{
          animationDelay: '200ms'
        }}>
        
        <div className="glass rounded-2xl p-6 border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-purple-400" />
            Tendência de Recebimentos
          </h3>
          <div className="h-64">
            {monthlyData.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                    id="colorRecebido"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    
                      <stop
                      offset="5%"
                      stopColor="var(--accent-green)"
                      stopOpacity={0.3} />
                    
                      <stop
                      offset="95%"
                      stopColor="var(--accent-green)"
                      stopOpacity={0} />
                    
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--glass-border)" />
                
                  <XAxis
                  dataKey="month"
                  stroke="var(--text-secondary)"
                  fontSize={12} />
                
                  <YAxis
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickFormatter={formatCurrency} />
                
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--dark-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR')}`,
                  '']
                  } />
                
                  <Area
                  type="monotone"
                  dataKey="recebido"
                  stroke="var(--accent-green)"
                  fillOpacity={1}
                  fill="url(#colorRecebido)"
                  strokeWidth={2} />
                
                </AreaChart>
              </ResponsiveContainer> :

            <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                Nenhum dado financeiro
              </div>
            }
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-[var(--accent-orange)]" />
            Top 5 Clientes por Valor
          </h3>
          <div className="h-64">
            {clientValueData.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientValueData} layout="vertical">
                  <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--glass-border)" />
                
                  <XAxis
                  type="number"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickFormatter={formatCurrency} />
                
                  <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  width={60} />
                
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--dark-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR')}`,
                  '']
                  } />
                
                  <Legend />
                  <Bar
                  dataKey="total"
                  name="Total"
                  fill="var(--accent-blue)"
                  radius={[0, 4, 4, 0]} />
                
                  <Bar
                  dataKey="pago"
                  name="Pago"
                  fill="var(--accent-green)"
                  radius={[0, 4, 4, 0]} />
                
                </BarChart>
              </ResponsiveContainer> :

            <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                Nenhum cliente cadastrado
              </div>
            }
          </div>
        </div>
      </div>

      <div
        className="glass rounded-2xl p-6 border border-[var(--glass-border)] animate-fade-in"
        style={{
          animationDelay: '250ms'
        }}>
        
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Tipos de Relatório
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {reportTypes.map((report) =>
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-xl border text-left transition-all ${selectedReport === report.id ? colorClasses[report.color] : 'border-[var(--glass-border)] hover:bg-[var(--glass-bg)]'}`}>
            
              <div className="mb-2">{report.icon}</div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {report.title}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {report.description}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>);

}