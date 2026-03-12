import React, { useMemo, useState } from 'react';
import {
  DownloadIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  DollarSignIcon,
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
import jsPDF from 'jspdf';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { useData } from '../context/DataContext';
const reportTypes = [
{
  id: 'geral',
  title: 'Relatório Geral',
  description: 'Dashboard completo com gráficos',
  icon: <PieChartIcon className="w-6 h-6" />,
  color: 'blue'
},
{
  id: 'inadimplencia',
  title: 'Inadimplência',
  description: 'Análise de parcelas em atraso',
  icon: <AlertTriangleIcon className="w-6 h-6" />,
  color: 'red'
},
{
  id: 'recebimentos',
  title: 'Recebimentos',
  description: 'Parcelas pagas no período',
  icon: <TrendingUpIcon className="w-6 h-6" />,
  color: 'green'
},
{
  id: 'clientes',
  title: 'Clientes',
  description: 'Análise da carteira de clientes',
  icon: <UsersIcon className="w-6 h-6" />,
  color: 'orange'
},
{
  id: 'previsao',
  title: 'Previsão',
  description: 'Projeção de recebimentos',
  icon: <CalendarIcon className="w-6 h-6" />,
  color: 'purple'
}];

const monthOptions = [
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
  const { financialClients } = useData();
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
    financialClients.forEach((client) => {
      client.installments.forEach((inst) => {
        if (inst.status === 'pago') {
          totalReceived += inst.value;
          paidCount++;
        } else if (new Date(inst.dueDate) < new Date()) {
          totalOverdue += inst.value;
          overdueCount++;
        } else {
          totalPending += inst.value;
          pendingCount++;
        }
      });
    });
    return {
      totalReceived,
      totalPending,
      totalOverdue,
      paidCount,
      pendingCount,
      overdueCount,
      totalClients: financialClients.length
    };
  }, [financialClients]);
  const statusPieData = useMemo(
    () =>
    [
    {
      name: 'Pagas',
      value: metrics.paidCount,
      color: 'var(--accent-green)'
    },
    {
      name: 'Pendentes',
      value: metrics.pendingCount,
      color: 'var(--accent-orange)'
    },
    {
      name: 'Atrasadas',
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
    financialClients.forEach((client) => {
      client.installments.forEach((inst) => {
        const date = new Date(inst.dueDate);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthLabel =
        monthOptions[date.getMonth()]?.label?.slice(0, 3) || '';
        if (!data[monthKey])
        data[monthKey] = {
          month: monthLabel,
          recebido: 0,
          pendente: 0,
          atrasado: 0
        };
        if (inst.status === 'pago') data[monthKey].recebido += inst.value;else
        if (new Date(inst.dueDate) < new Date())
        data[monthKey].atrasado += inst.value;else
        data[monthKey].pendente += inst.value;
      });
    });
    return Object.values(data).slice(-6);
  }, [financialClients]);
  const clientValueData = useMemo(() => {
    return financialClients.slice(0, 5).map((client) => ({
      name: client.name.split(' ')[0],
      total: client.installments.reduce((sum, i) => sum + i.value, 0),
      pago: client.installments.
      filter((i) => i.status === 'pago').
      reduce((sum, i) => sum + i.value, 0)
    }));
  }, [financialClients]);
  const formatBRL = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2
  })}`;
  const generatePDF = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;
      doc.setFillColor(14, 17, 23);
      doc.rect(0, 0, pageWidth, 45, 'F');
      doc.setTextColor(88, 166, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('SISTEMA JURIDICO', margin, y + 8);
      doc.setTextColor(240, 246, 252);
      doc.setFontSize(14);
      doc.text('Relatorio Executivo', margin, y + 18);
      doc.setTextColor(139, 148, 158);
      doc.setFontSize(9);
      const startMonthName =
      monthOptions.find((m) => m.value === startMonth)?.label || '';
      const endMonthName =
      monthOptions.find((m) => m.value === endMonth)?.label || '';
      doc.text(
        `Periodo: ${startMonthName}/${startYear} ate ${endMonthName}/${endYear}`,
        margin,
        y + 26
      );
      doc.text(
        `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        margin,
        y + 32
      );
      y = 55;
      doc.setDrawColor(88, 166, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      doc.setTextColor(88, 166, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO EXECUTIVO', margin, y);
      y += 10;
      const kpiWidth = (pageWidth - margin * 2 - 15) / 4;
      const kpis = [
      {
        label: 'Total Clientes',
        value: metrics.totalClients.toString(),
        color: [88, 166, 255]
      },
      {
        label: 'Total Recebido',
        value: formatBRL(metrics.totalReceived),
        color: [63, 185, 80]
      },
      {
        label: 'Total Pendente',
        value: formatBRL(metrics.totalPending),
        color: [210, 153, 34]
      },
      {
        label: 'Total em Atraso',
        value: formatBRL(metrics.totalOverdue),
        color: [248, 81, 73]
      }];

      kpis.forEach((kpi, i) => {
        const x = margin + i * (kpiWidth + 5);
        doc.setFillColor(22, 27, 34);
        doc.roundedRect(x, y, kpiWidth, 28, 3, 3, 'F');
        doc.setDrawColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, kpiWidth, 28, 3, 3, 'S');
        doc.setTextColor(139, 148, 158);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(kpi.label, x + 4, y + 8);
        doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, x + 4, y + 20);
      });
      y += 40;
      doc.setTextColor(88, 166, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRIBUICAO DE PARCELAS', margin, y);
      y += 10;
      doc.setFillColor(22, 27, 34);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'F');
      const parcelas = [
      {
        label: 'Parcelas Pagas',
        value: metrics.paidCount,
        color: [63, 185, 80]
      },
      {
        label: 'Parcelas Pendentes',
        value: metrics.pendingCount,
        color: [210, 153, 34]
      },
      {
        label: 'Parcelas Atrasadas',
        value: metrics.overdueCount,
        color: [248, 81, 73]
      }];

      const colWidth = (pageWidth - margin * 2) / 3;
      parcelas.forEach((p, i) => {
        const x = margin + i * colWidth;
        doc.setFillColor(p.color[0], p.color[1], p.color[2]);
        doc.circle(x + 8, y + 12, 3, 'F');
        doc.setTextColor(139, 148, 158);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(p.label, x + 14, y + 13);
        doc.setTextColor(p.color[0], p.color[1], p.color[2]);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(p.value.toString(), x + 14, y + 24);
      });
      y += 40;
      doc.setTextColor(88, 166, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALHAMENTO POR CLIENTE', margin, y);
      y += 8;
      if (financialClients.length === 0) {
        doc.setFillColor(22, 27, 34);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 3, 3, 'F');
        doc.setTextColor(139, 148, 158);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Nenhum cliente cadastrado', margin + 10, y + 13);
      } else {
        doc.setFillColor(30, 35, 44);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, 'F');
        doc.setTextColor(139, 148, 158);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente', margin + 4, y + 7);
        doc.text('Total', margin + 80, y + 7);
        doc.text('Pago', margin + 110, y + 7);
        doc.text('Pendente', margin + 140, y + 7);
        y += 12;
        financialClients.forEach((client, i) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const total = client.installments.reduce(
            (sum, inst) => sum + inst.value,
            0
          );
          const pago = client.installments.
          filter((inst) => inst.status === 'pago').
          reduce((sum, inst) => sum + inst.value, 0);
          const pendente = total - pago;
          const bgColor = i % 2 === 0 ? [22, 27, 34] : [18, 22, 28];
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(margin, y, pageWidth - margin * 2, 9, 'F');
          doc.setTextColor(240, 246, 252);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(client.name, margin + 4, y + 6);
          doc.setTextColor(139, 148, 158);
          doc.text(formatBRL(total), margin + 80, y + 6);
          doc.setTextColor(63, 185, 80);
          doc.text(formatBRL(pago), margin + 110, y + 6);
          doc.setTextColor(210, 153, 34);
          doc.text(formatBRL(pendente), margin + 140, y + 6);
          y += 9;
        });
      }
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
          Relatórios
        </h1>
        <p className="text-[var(--text-secondary)]">
          Dashboard analítico com visualizações estilo Power BI
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in"
        style={{
          animationDelay: '100ms'
        }}>
        
        <div className="glass rounded-2xl p-5 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--accent-blue)]/20">
              <UsersIcon className="w-5 h-5 text-[var(--accent-blue)]" />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              Total Clientes
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">
            {metrics.totalClients}
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--accent-green)]/20">
              <DollarSignIcon className="w-5 h-5 text-[var(--accent-green)]" />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              Total Recebido
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-green)]">
            R$ {(metrics.totalReceived / 1000).toFixed(1)}k
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--accent-orange)]/20">
              <TrendingUpIcon className="w-5 h-5 text-[var(--accent-orange)]" />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              Pendente
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-orange)]">
            R$ {(metrics.totalPending / 1000).toFixed(1)}k
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--accent-red)]/20">
              <AlertTriangleIcon className="w-5 h-5 text-[var(--accent-red)]" />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              Em Atraso
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-red)]">
            R$ {(metrics.totalOverdue / 1000).toFixed(1)}k
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in"
        style={{
          animationDelay: '150ms'
        }}>
        
        <div className="glass rounded-2xl p-6 border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-[var(--accent-blue)]" />
            Distribuição de Parcelas
          </h3>
          <div className="h-64">
            {statusPieData.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}>
                  
                    {statusPieData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                  </Pie>
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--dark-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px'
                  }} />
                
                </PieChart>
              </ResponsiveContainer> :

            <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                Nenhuma parcela cadastrada
              </div>
            }
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5 text-[var(--accent-green)]" />
            Evolução Mensal
          </h3>
          <div className="h-64">
            {monthlyData.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
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
                
                  <Legend />
                  <Bar
                  dataKey="recebido"
                  name="Recebido"
                  fill="var(--accent-green)"
                  radius={[4, 4, 0, 0]} />
                
                  <Bar
                  dataKey="pendente"
                  name="Pendente"
                  fill="var(--accent-orange)"
                  radius={[4, 4, 0, 0]} />
                
                  <Bar
                  dataKey="atrasado"
                  name="Atrasado"
                  fill="var(--accent-red)"
                  radius={[4, 4, 0, 0]} />
                
                </BarChart>
              </ResponsiveContainer> :

            <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                Nenhum dado financeiro
              </div>
            }
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