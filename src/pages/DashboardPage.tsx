import { useMemo } from 'react';
import {
  TrendingDownIcon,
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
import { useLanguage } from '../context/LanguageContext';
export function DashboardPage() {
  const { t } = useLanguage();
  const { financialMovements, clientRecords, attendances, legalEvents } =
  useData();
  // Calculate metrics from real data
  const metrics = useMemo(() => {
    let totalReceived = 0;
    let totalOverdue = 0;
    let totalPending = 0;
    let paidCount = 0;
    let overdueCount = 0;
    let pendingCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const counterpartiesWithOverdue = new Set<string>();

    financialMovements.forEach((movement) => {
      const signal = movement.direction === 'entrada' ? 1 : -1;
      const value = movement.amount * signal;
      const movementDate = new Date(`${movement.receivedAt}T12:00:00`);

      if (movement.status === 'recebida') {
        totalReceived += value;
        paidCount++;
      } else if (movementDate < today) {
        totalOverdue += value;
        overdueCount++;
        counterpartiesWithOverdue.add(movement.receivedFrom.toLowerCase().trim());
      } else {
        totalPending += value;
        pendingCount++;
      }
    });

    return {
      totalReceived,
      totalInadimplente: totalOverdue,
      clientesEmAtraso: counterpartiesWithOverdue.size,
      previsaoRecebimento: totalPending,
      parcelasPagas: paidCount,
      parcelasAtrasadas: overdueCount,
      parcelasPendentes: pendingCount,
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
  }, [financialMovements, clientRecords, attendances, legalEvents]);
  // Chart data
  const statusComposition = useMemo(
    () =>
    [
    {
      name: t('dashboard.chart.paid') || 'Paid',
      value: metrics.parcelasPagas,
      color: 'var(--accent-green)'
    },
    {
      name: t('dashboard.chart.overdue') || 'Overdue',
      value: metrics.parcelasAtrasadas,
      color: 'var(--accent-red)'
    },
    {
      name: t('dashboard.chart.pending') || 'Pending',
      value: metrics.parcelasPendentes,
      color: 'var(--accent-orange)'
    }].
    filter((item) => item.value > 0),
    [metrics, t]
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
    t('dashboard.month.jan') || 'Jan',
    t('dashboard.month.feb') || 'Feb',
    t('dashboard.month.mar') || 'Mar',
    t('dashboard.month.apr') || 'Apr',
    t('dashboard.month.may') || 'May',
    t('dashboard.month.jun') || 'Jun',
    t('dashboard.month.jul') || 'Jul',
    t('dashboard.month.aug') || 'Aug',
    t('dashboard.month.sep') || 'Sep',
    t('dashboard.month.oct') || 'Oct',
    t('dashboard.month.nov') || 'Nov',
    t('dashboard.month.dec') || 'Dec'];

    const today = new Date();
    financialMovements.forEach((movement) => {
      const date = new Date(`${movement.receivedAt}T12:00:00`);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = monthNames[date.getMonth()];
      const signal = movement.direction === 'entrada' ? 1 : -1;
      const value = movement.amount * signal;

      if (!data[monthKey]) {
        data[monthKey] = {
          month: monthLabel,
          recebido: 0,
          inadimplente: 0
        };
      }

      if (movement.status === 'recebida') {
        data[monthKey].recebido += value;
      } else if (date < today) {
        data[monthKey].inadimplente += value;
      }
    });
    return Object.values(data).slice(-6);
  }, [financialMovements]);
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2
    })}`;
  };
  const hasData =
  financialMovements.length > 0 ||
  clientRecords.length > 0 ||
  attendances.length > 0 ||
  legalEvents.length > 0;
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-[var(--text-secondary)]">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title={t('dashboard.metric.overdue')}
          value={formatCurrency(metrics.totalInadimplente)}
          icon={<TrendingDownIcon className="w-6 h-6" />}
          glowColor="red"
          trend={metrics.totalInadimplente > 0 ? 'down' : undefined}
          delay={100} />
        
        <MetricCard
          title={t('dashboard.metric.pending')}
          value={formatCurrency(metrics.previsaoRecebimento)}
          icon={<CalendarIcon className="w-6 h-6" />}
          glowColor="orange"
          delay={200} />
        
        <MetricCard
          title={t('dashboard.metric.received')}
          value={formatCurrency(metrics.totalReceived)}
          icon={<TrendingUpIcon className="w-6 h-6" />}
          glowColor="green"
          trend={metrics.totalReceived !== 0 ? 'up' : undefined}
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
            {t('dashboard.chart.status')}
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
                  {t('common.notFound')}
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
            {t('dashboard.chart.monthlyComparison') || 'Receipts vs Overdue'}
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
                          {value === 'recebido' ? (t('dashboard.chart.received') || 'Received') : (t('dashboard.chart.delinquent') || 'Overdue')}
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
                  {t('dashboard.emptyFinancial')}
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
          {t('dashboard.title')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-green)]">
              {metrics.parcelasPagas}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('reports.receipts')}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-red)]">
              {metrics.parcelasAtrasadas}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('reports.overdue')}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-orange)]">
              {metrics.parcelasPendentes}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('dashboard.metric.pending')}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--glass-bg)]">
            <p className="text-3xl font-bold text-[var(--accent-blue)]">
              {metrics.clientesAtivos}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('dashboard.metric.activeClients')}
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
                {t('dashboard.metric.registeredClients')}
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
                {t('dashboard.metric.openAttendances')}
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
                {t('dashboard.metric.upcomingEvents')}
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
            {t('dashboard.emptyPrompt')}
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            {t('dashboard.emptyPrompt')}
          </p>
        </div>
      }
    </div>);

}