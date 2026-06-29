import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../config';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  RefreshCw, 
  Play, 
  Sparkles, 
  Check, 
  X, 
  Coffee, 
  Utensils, 
  Bell, 
  Volume2, 
  VolumeX,
  Filter
} from 'lucide-react';

export default function AdminDashboard({ onNewOrderToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Audio chime feedback using Web Audio API
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      // Tone 2 (offset slightly for chime)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.45);
      }, 100);
    } catch (e) {
      console.warn('Audio play was prevented or unsupported by browser', e);
    }
  };

  // Fetch initial orders on mount
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Fetch orders
    fetchOrders();

    // 2. Establish socket.io connection
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log(`WebSocket client connected: ${socket.id}`);
      setSocketConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log(`WebSocket client disconnected: ${reason}`);
      setSocketConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setSocketConnected(false);
    });

    // 3. Listen for new real-time orders (Idempotent to avoid duplicates)
    socket.on('new_order', (newOrder) => {
      console.log('Real-time: New order received on client!', newOrder);
      
      setOrders((prev) => {
        // Prevent duplicate insertion
        if (prev.some((o) => o.id === newOrder.id)) {
          return prev;
        }
        return [newOrder, ...prev];
      });

      // Play alert chime sound
      playNotificationSound();

      // Emit toast notification to top-level App
      if (onNewOrderToast) {
        onNewOrderToast(`🛎️ New Order #${newOrder.id} received from ${newOrder.table_number}!`);
      }
    });

    // 4. Listen for real-time status updates from other terminals/backends
    socket.on('order_updated', (updatedOrder) => {
      console.log('Real-time: Order status updated on client!', updatedOrder);
      setOrders((prev) => 
        prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o)
      );
    });

    // Clean up connections on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_order');
      socket.off('order_updated');
      socket.disconnect();
    };
  }, []);

  // Handler to update status via PATCH
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update order status');
      }
      
      // Local state is updated automatically via the socket 'order_updated' event or the response
      const updatedData = await res.json();
      setOrders((prev) => 
        prev.map((o) => o.id === orderId ? updatedData : o)
      );
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error updating order');
    }
  };

  const toCurrencyNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  };

  const formatCurrency = (value) => toCurrencyNumber(value).toFixed(2);

  // Derive metrics dynamically from orders state
  const metrics = {
    revenue: orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + toCurrencyNumber(o.total_price), 0),
    pending: orders.filter(o => o.status === 'Pending').length,
    preparing: orders.filter(o => o.status === 'Preparing').length,
    served: orders.filter(o => o.status === 'Served').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    avgValue: orders.length > 0 
      ? (orders.reduce((sum, o) => sum + toCurrencyNumber(o.total_price), 0) / orders.length) 
      : 0
  };

  // Filters
  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Gross Revenue</div>
            <div className="text-lg font-black text-slate-100">${formatCurrency(metrics.revenue)}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl relative">
            <Clock className="w-5 h-5 animate-pulse" />
            {metrics.pending > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Pending Orders</div>
            <div className="text-lg font-black text-slate-100">{metrics.pending}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">In Preparation</div>
            <div className="text-lg font-black text-slate-100">{metrics.preparing}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-slate-850 text-slate-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Average Ticket</div>
            <div className="text-lg font-black text-slate-100">${formatCurrency(metrics.avgValue)}</div>
          </div>
        </div>

      </div>

      {/* Main Panel Content */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-slate-100 text-lg flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-400" />
                Real-Time Kitchen Deck
              </h3>
              
              {/* Connection state badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border ${
                socketConnected 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-950/40 text-rose-400 border-rose-500/20 animate-pulse'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'}`} />
                {socketConnected ? 'Live Connection' : 'Offline'}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-light">
              Dine-in orders appearing instantly with custom sound notification and automated list updates.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playNotificationSound();
              }}
              className={`p-2.5 rounded-xl border transition-all ${
                soundEnabled 
                  ? 'bg-slate-950 text-amber-400 border-slate-800 hover:border-slate-750' 
                  : 'bg-slate-950 text-slate-600 border-slate-900 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Disable Chime Sound' : 'Enable Chime Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Test alert trigger */}
            <button
              onClick={playNotificationSound}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-slate-200 text-[11px] font-bold rounded-xl transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              Test Chime
            </button>

            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Manual
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Filter Deck:</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Pending', 'Preparing', 'Served', 'Cancelled'].map((filt) => (
              <button
                key={filt}
                onClick={() => setStatusFilter(filt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                  statusFilter === filt
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950 text-slate-500 border-slate-900 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                {filt} ({
                  filt === 'All' ? orders.length :
                  filt === 'Pending' ? metrics.pending :
                  filt === 'Preparing' ? metrics.preparing :
                  filt === 'Served' ? metrics.served :
                  metrics.cancelled
                })
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards Deck Grid */}
        {loading ? (
          <div className="text-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-slate-500 text-xs font-mono">Loading active orders database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 space-y-4 border border-dashed border-slate-850 rounded-3xl bg-slate-950/10">
            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-700 border border-slate-850 mx-auto">
              <ChefHat className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-xs">No orders recorded in the current active filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div 
                key={order.id}
                className={`border rounded-2.5xl overflow-hidden transition-all duration-300 flex flex-col justify-between bg-slate-950/80 ${
                  order.status === 'Pending' ? 'border-amber-500/30 shadow-lg shadow-amber-500/5' :
                  order.status === 'Preparing' ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/5' :
                  order.status === 'Served' ? 'border-slate-900 opacity-80' :
                  'border-slate-950 opacity-40'
                }`}
              >
                {/* Ticket Header */}
                <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-900/30">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-200 text-[10px] font-black rounded-lg">
                      {order.table_number}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">#{order.id}</span>
                  </div>
                  
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase ${
                    order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    order.status === 'Preparing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    order.status === 'Served' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-slate-850 text-slate-400 border border-slate-800/50'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Ticket Body Content */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="space-y-2.5 divide-y divide-slate-900/60">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs pt-2.5 first:pt-0">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-200">{item.product?.name}</span>
                          <div className="text-[10px] text-slate-500">${formatCurrency(item.price)} each</div>
                        </div>
                        <span className="font-black text-slate-200 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 text-xs">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {order.note && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[12px] text-rose-100 leading-normal">
                      <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-[0.18em] font-black text-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                        <span>Customer Note</span>
                      </div>
                      <p className="whitespace-pre-line text-sm text-rose-100">{order.note}</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Received: {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                {/* Ticket Footer Action Controls */}
                <div className="p-4 bg-slate-900/20 border-t border-slate-900 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Ticket Total</span>
                    <span className="font-black text-base text-slate-200">${formatCurrency(order.total_price)}</span>
                  </div>

                  {/* Actions depending on current status */}
                  {order.status === 'Pending' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                        className="col-span-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Prepare Order
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                        className="py-2 border border-rose-950 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {order.status === 'Preparing' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Served')}
                        className="col-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Served
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                        className="py-2 border border-rose-950 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {(order.status === 'Served' || order.status === 'Cancelled') && (
                    <div className="flex items-center justify-center gap-1.5 py-2 bg-slate-900/50 border border-slate-800/50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {order.status === 'Served' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Served & Completed
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-rose-500" />
                          Ticket Cancelled
                        </>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
