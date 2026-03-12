import React, { useMemo } from 'react';
import {
  TrendingDownIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  HeadphonesIcon } from
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
  ResponsiveContainer,
  Legend } from
'recharts';
import { MetricCard } from '../components/MetricCard';
import { useData } from '../context/DataContext';
export function DashboardPage() {
  const { financialClients, clientRecords, attendances, legalEvents } =
  useData();
  // Calculate metrics from real data
  const metrics = useMemo(() => {
    let totalInadimplente = 0;
    let clientesEmAtraso = 0;
    let previsaoRecebimento = 0;
    let parcelasPagas = 0;
    let parcelasAtrasadas = 0;
    let parcelasPendentes = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    financialClients.forEach((client) => {
      let clientHasOverdue = false;
      client.installments.forEach((inst) => {
        if (inst.status === 'pago') {
          parcelasPagas++;
        } else if (
        inst.status === 'atrasado' ||
        inst.status === 'pendente' && new Date(inst.dueDate) < today)
        {
          parcelasAtrasadas++;
          totalInadimplente += inst.value;
          clientHasOverdue = true;
        } else {
          parcelasPendentes++;
          previsaoRecebimento += inst.value;
        }
      });
      if (clientHasOverdue) clientesEmAtraso++;
    });
    return {
      totalInadimplente,
      clientesEmAtraso,
      previsaoRecebimento,
      parcelasPagas,
      parcelasAtrasadas,
      parcelasPendentes,
      clientesAtivos: clientRecords.filter(
        (c) => c.status === 'ativo' && !c.deletedAt
      ).length,
      atendimentosAbertos: attendances.filter(
        (a) =>
        !a.deletedAt && a.status !== 'fechado' && a.status !== 'nao_fechado'
      ).length,
      eventosProximos: legalEvents.filter((e) => {
        if (e.status === 'concluido') return false;
        const eventDate = new Date(e.dateEnd);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return eventDate >= today && eventDate <= nextWeek;
      }).length
    };
  }, [financialClients, clientRecords, attendances, legalEvents]);
  // Chart data
  const statusComposition = useMemo(
    () =>
    [
    {
      name: 'Pago',
      value: metrics.parcelasPagas,
      color: 'var(--accent-green)'
    },
    {
      name: 'Atrasado',
      value: metrics.parcelasAtrasadas,
      color: 'var(--accent-red)'
    },
    {
      name: 'Pendente',
      value: metrics.parcelasPendentes,
      color: 'var(--accent-orange)'
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
        inadimplente: number;
      }> =
    {};
    const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'];

    const today = new Date();
    financialClients.forEach((client) => {
      client.installments.forEach((inst) => {
        const date = new Date(inst.dueDate);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = monthNames[date.getMonth()];
        if (!data[monthKey]) {
          data[monthKey] = {
            month: monthLabel,
            recebido: 0,
            inadimplente: 0
          };
        }
        if (inst.status === 'pago') {
          data[monthKey].recebido += inst.value;
        } else if (
        inst.status === 'atrasado' ||
        inst.status === 'pendente' && new Date(inst.dueDate) < today)
        {
          data[monthKey].inadimplente += inst.value;
        }
      });
    });
    return Object.values(data).slice(-6);
  }, [financialClients]);
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2
    })}`;
  };
  const hasData =
  financialClients.length > 0 ||
  clientRecords.length > 0 ||
  attendances.length > 0 ||
  legalEvents.length > 0;
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
          Dashboard
        </h1>
        <p className="text-[var(--text-secondary)]">
          Visão geral da sua carteira de cobrança
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Inadimplente"
          value={formatCurrency(metrics.totalInadimplente)}
          icon={<TrendingDownIcon className="w-6 h-6" />}
          glowColor="red"
          trend={metrics.totalInadimplente > 0 ? 'down' : undefined}
          delay={100} />
        
        <MetricCard
          title="Clientes em Atraso"
          value={metrics.clientesEmAtraso.toString()}
          icon={<AlertTriangleIcon className="w-6 h-6" />}
          glowColor="orange"
          delay={200} />
        
        <MetricCard
          title="Previsão de Recebimento"
          value={formatCurrency(metrics.previsaoRecebimento)}
          icon={<TrendingUpIcon className="w-6 h-6" />}
          glowColor="green"
          trend={metrics.previsaoRecebimento > 0 ? 'up' : undefined}
          delay={300} />
        
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status Composition */}
        <div
          className="glass glass-hover rounded-2xl p-6 border border-[var(--glass-border)] animate-fade-in"
          style={{
            animationDelay: '400ms'
          }}>
          
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Composição de Status
          </h3>
          <div className="h-64">
            {statusComposition.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                  data={statusComposition}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none">
                  
                    {statusComposition.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                  </Pie>
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--dark-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value: number) => [`${value} parcelas`, '']} />
                
                  <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) =>
                  <span className="text-[var(--text-secondary)] text-sm">
                        {value}
                      </span>
                  } />
                
                </PieChart>
              </ResponsiveContainer> :

            <div className="h-full flex items-center justify-center">
                <p className="text-[var(--text-secondary)]">
                  Nenhuma parcela cadastrada
                </p>
              </div>
            }
          </div>
        </div>

        {/* Bar Chart - Monthly Data */}
        <div
          className="glass glass-hover rounded-2xl p-6 border border-[var(--glass-border)] animate-fade-in"
          style={{
            animationDelay: '500ms'
          }}>
          
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            Recebimentos vs Inadimplência
          </h3>
          <div className="h-64">
            {monthlyData.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8}>
                  <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--glass-border)" />
                
                  <XAxis
                  dataKey="month"
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  axisLine={{
                    stroke: 'var(--glass-border)'
                  }} />
                
                  <YAxis
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  axisLine={{
                    stroke: 'var(--glass-border)'
                  }}
                  tickFormatter={(value) => `R$${value / 1000}k`} />
                
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--dark-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR')}`,
                  '']
                  } />
                
                  <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                  <span className="text-[var(--text-secondary)] text-sm">
                        {value === 'recebido' ? 'Recebido' : 'Inadimplente'}
                      </span>
                  } />
                
                  <Bar
                  dataKey="recebido"
                  fill="var(--accent-blue)"
                  radius={[4, 4, 0, 0]} />
                
                  <Bar
                  dataKey="inadimplente"
                  fill="var(--accent-red)"
                  radius={[4, 4, 0, 0]} />
                
                </BarChart>
              </ResponsiveContainer> :

            <div className="h-full flex items-center justify-center">
                <p className="text-[var(--text-secondary)]">
                  Nenhum dado financeiro cadastrado
                </p>
              </div>
            }
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div
        className="glass rounded-2xl p-6 border border-[var(--glass-border)] animate-fade-in"
        style={{
          animationDelay: '600ms'
        }}>
        
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Resumo Rápido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-green)]">
              {metrics.parcelasPagas}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Parcelas Pagas
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-red)]">
              {metrics.parcelasAtrasadas}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Parcelas Atrasadas
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-orange)]">
              {metrics.parcelasPendentes}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Parcelas Pendentes
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-blue)]">
              {metrics.clientesAtivos}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Clientes Ativos
            </p>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in"
        style={{
          animationDelay: '700ms'
        }}>
        
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-blue)]/20">
              <UsersIcon className="w-5 h-5 text-[var(--accent-blue)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {metrics.clientesAtivos}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Clientes Cadastrados
              </p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-orange)]/20">
              <HeadphonesIcon className="w-5 h-5 text-[var(--accent-orange)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {metrics.atendimentosAbertos}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Atendimentos Abertos
              </p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-green)]/20">
              <CalendarIcon className="w-5 h-5 text-[var(--accent-green)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {metrics.eventosProximos}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Eventos Esta Semana
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasData &&
      <div
        className="glass rounded-2xl p-12 border border-[var(--glass-border)] text-center animate-fade-in"
        style={{
          animationDelay: '800ms'
        }}>
        
          <div className="w-16 h-16 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUpIcon className="w-8 h-8 text-[var(--accent-blue)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Comece a usar o sistema
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Cadastre clientes, atendimentos e eventos no calendário para ver as
            métricas e gráficos atualizados automaticamente.
          </p>
        </div>
      }
    </div>);

}