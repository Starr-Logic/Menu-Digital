import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Analytics({ orders = [] }) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    topProducts: [],
    orderStatusData: [],
    hourlyData: [],
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

    // Top Products
    const topProductsObj = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const name = item.product?.name || 'Unknown';
        topProductsObj[name] = (topProductsObj[name] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(topProductsObj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, value: count }));

    // Order Status Distribution
    const orderStatusData = [
      { name: 'Completed', value: completedOrders.length, fill: '#10b981' },
      { name: 'Pending', value: pendingOrders.length, fill: '#f59e0b' },
      { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length, fill: '#ef4444' },
    ].filter(item => item.value > 0);

    // Hourly Data (simulated)
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      orders: Math.floor(Math.random() * 15),
      revenue: Math.floor(Math.random() * 500),
    }));

    setStats({
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length) : 0,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      topProducts,
      orderStatusData,
      hourlyData,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in" id="analytics-container">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-amber-500" />
          Sales Analytics
        </h1>
        <p className="text-slate-400 text-sm">Real-time business insights and performance metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">From {stats.totalOrders} orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Total Orders</span>
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            {stats.totalOrders}
          </div>
          <p className="text-[11px] text-slate-500">All time orders</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Avg Order</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            ${stats.averageOrderValue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">Average per order</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Completed</span>
            <div className="w-5 h-5 text-green-500 bg-green-500/20 rounded-full flex items-center justify-center text-[10px] font-black">✓</div>
          </div>
          <div className="text-2xl font-black text-slate-100">
            {stats.completedOrders}
          </div>
          <p className="text-[11px] text-slate-500">Served orders</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Pending</span>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            {stats.pendingOrders}
          </div>
          <p className="text-[11px] text-slate-500">In progress</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-100">Top Selling Items</h2>
          <p className="text-sm text-slate-500">Most ordered products by quantity</p>
        </div>

        {Object.keys(stats.topProducts).length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No order data available yet</p>
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
                    <span className="text-xs font-bold text-amber-400">{count} sold</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl border border-amber-500/20 p-8 space-y-4">
          <h3 className="text-lg font-black text-amber-400">Revenue Performance</h3>
          <div className="text-4xl font-black text-slate-100">
            ${stats.totalRevenue.toFixed(0)}
          </div>
          <p className="text-sm text-slate-400">
            Generated from <span className="font-bold text-slate-200">{stats.totalOrders}</span> total orders
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-3xl border border-emerald-500/20 p-8 space-y-4">
          <h3 className="text-lg font-black text-emerald-400">Completion Rate</h3>
          <div className="text-4xl font-black text-slate-100">
            {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
          </div>
          <p className="text-sm text-slate-400">
            <span className="font-bold text-slate-200">{stats.completedOrders}</span> out of {stats.totalOrders} orders completed
          </p>
        </div>
      </div>
    </div>
  );
}
