import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Analytics({ orders = [] }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    topProducts: {},
  });

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const calculateStats = () => {
    const completedOrders = orders.filter(o => o.status === 'Served');
    const pendingOrders = orders.filter(o => o.status !== 'Served' && o.status !== 'Cancelled');

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total_price || 0), 0);

    const topProducts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const name = item.product?.name || 'Unknown';
        topProducts[name] = (topProducts[name] || 0) + item.quantity;
      });
    });

    setStats({
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length) : 0,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      topProducts: Object.entries(topProducts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .reduce((obj, [name, count]) => ({ ...obj, [name]: count }), {}),
    });
  };

  const statusChartData = [
    { name: t('pending'), value: orders.filter(o => o.status === 'Pending').length },
    { name: t('preparing'), value: orders.filter(o => o.status === 'Preparing').length },
    { name: t('served'), value: orders.filter(o => o.status === 'Served').length },
    { name: t('cancelled'), value: orders.filter(o => o.status === 'Cancelled').length },
  ];

  const ordersByDate = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const ordersByDateData = Object.entries(ordersByDate)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, count]) => ({ date, count }));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in" id="analytics-container">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-amber-500" />
          {t('sales_analytics')}
        </h1>
        <p className="text-slate-400 text-sm">{t('analytics_desc')}</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{t('total_revenue')}</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">{t('from_orders', { count: stats.totalOrders })}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{t('total_orders')}</span>
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            {stats.totalOrders}
          </div>
          <p className="text-[11px] text-slate-500">{t('all_time_orders')}</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{t('avg_order')}</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            ${stats.averageOrderValue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">{t('average_per_order')}</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{t('completed')}</span>
            <div className="w-5 h-5 text-green-500 bg-green-500/20 rounded-full flex items-center justify-center text-[10px] font-black">✓</div>
          </div>
          <div className="text-2xl font-black text-slate-100">
            {stats.completedOrders}
          </div>
          <p className="text-[11px] text-slate-500">{t('served_orders')}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">{t('pending')}</span>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            {stats.pendingOrders}
          </div>
          <p className="text-[11px] text-slate-500">{t('in_progress')}</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-100">{t('top_selling_items')}</h2>
          <p className="text-sm text-slate-500">{t('most_ordered_products')}</p>
        </div>

        {Object.keys(stats.topProducts).length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">{t('no_order_data')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(stats.topProducts).map(([productName, count], idx) => (
              <div key={productName} className="flex items-center gap-4">
                <div className="text-sm font-black text-slate-400 min-w-[3rem] text-right">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-200">{productName}</span>
                    <span className="text-xs font-bold text-amber-400">{count} {t('sold')}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(stats.topProducts), 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl border border-amber-500/20 p-8 space-y-4">
          <h3 className="text-lg font-black text-amber-400">{t('revenue_performance')}</h3>
          <div className="text-4xl font-black text-slate-100">
            ${stats.totalRevenue.toFixed(0)}
          </div>
          <p className="text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: t('generated_from', { count: stats.totalOrders }) }} />
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-3xl border border-emerald-500/20 p-8 space-y-4">
          <h3 className="text-lg font-black text-emerald-400">{t('completion_rate')}</h3>
          <div className="text-4xl font-black text-slate-100">
            {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
          </div>
          <p className="text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: t('out_of_orders_completed', { completed: stats.completedOrders, total: stats.totalOrders }) }} />
        </div>

        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6">
          <h3 className="text-lg font-black text-slate-100">{t('order_timeline')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersByDateData} margin={{ top: 16, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-100">{t('order_status_breakdown')}</h3>
              <p className="text-sm text-slate-500">{t('live_order_status')}</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={4}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={`slice-${index}`}
                      fill={['#f59e0b', '#0ea5e9', '#22c55e', '#f43f5e'][index % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-100">{t('top_products_chart')}</h3>
              <p className="text-sm text-slate-500">{t('quantity_sold')}</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(stats.topProducts).map(([name, value]) => ({ name, value }))} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
