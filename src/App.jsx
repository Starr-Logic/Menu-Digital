import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ListOrdered,
  QrCode,
  X,
  Sparkles,
  ArrowRight,
  LogOut,
  Utensils,
  History,
  Package,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import QrGenerator from './pages/admin/QrGenerator';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import AdminLogin from './pages/admin/AdminLogin';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import Navbar from './components/Navbar';
import MenuCard from './pages/customer/MenuCard';
import CartModal from './pages/customer/CartModal';
import ProductDetailModal from './pages/customer/ProductDetailModal';
import OrderSuccessModal from './pages/customer/OrderSuccessModal';
import { API_BASE_URL, SOCKET_URL } from './config';
import { io } from 'socket.io-client';

// Helper component for live countdown
function CountdownTimer({ order }) {
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    if (!order.prep_time_minutes || !['Preparing', 'Served'].includes(order.status)) return;

    const calculateRemaining = () => {
      // If it's already served, just show Ready
      if (order.status === 'Served') return 'READY';

      // Use preparedAt if available, fallback to createdAt
      const startedAt = new Date(order.preparedAt || order.createdAt || Date.now());
      const endTime = startedAt.getTime() + order.prep_time_minutes * 60000;
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

      if (diffSeconds <= 0) return '00:00';

      const m = Math.floor(diffSeconds / 60);
      const s = diffSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Set initial
    setTimeLeftStr(calculateRemaining());

    // Update every 1 second
    const interval = setInterval(() => {
      setTimeLeftStr(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  return (
    <div className="bg-indigo-950/80 border border-indigo-400/30 px-3 py-1.5 rounded-xl text-sm font-black text-indigo-300 shadow-inner min-w-[70px] text-center font-mono">
      {timeLeftStr}
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const socketRef = useRef(null);

  // Navigation / View state: 'customer' or 'kitchen'
  const [activeTab, setActiveTab] = useState(() => {
    // If the URL ends with /admin, go straight to the admin portal
    return window.location.pathname.startsWith('/admin') ? 'kitchen' : 'customer';
  });

  // Authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Products and Orders states from Backend APIs
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Customer State
  const [selectedTable, setSelectedTable] = useState('Table 3');
  
  // Refs for stale closures (setInterval)
  const activeTabRef = useRef(activeTab);
  const selectedTableRef = useRef(selectedTable);
  
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedTableRef.current = selectedTable; }, [selectedTable]);

  const [cart, setCart] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  // Sync URL for Admin pages to show /admin and Customer to show /
  useEffect(() => {
    const adminTabs = ['kitchen', 'qr-generator', 'add-product', 'analytics', 'settings'];
    if (adminTabs.includes(activeTab)) {
      window.history.pushState({}, '', '/admin');
    } else if (activeTab === 'customer' || activeTab === 'orders') {
      const search = window.location.search;
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/' + search);
      }
    }
  }, [activeTab]);



  const handleOpenCart = () => setIsMobileCartOpen(true);
  const handleShowTableModal = () => setShowQrModal(true);
  const openHelp = () => { window.location.href = 'mailto:[EMAIL_ADDRESS]'; };
  const openContact = () => { window.location.href = 'tel:+855976333440'; };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(false);
  };

  // Notifications state
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast helper
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handle admin login
  const handleAdminLogin = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    setIsAdminLoggedIn(true);
    triggerToast(`Welcome ${user.username}!`, 'success');
    setActiveTab('kitchen');
  };

  const resetCustomerOrderState = () => {
    setCart({});
    setOrderNote('');
    setIsMobileCartOpen(false);
    setLastPlacedOrder(null);
    setShowQrModal(false);
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    resetCustomerOrderState();
    setActiveTab('customer');
    triggerToast('Logged out successfully', 'success');
  };

  // URL Parameter Detection for table number (e.g., ?table=5 or ?table=Table 5)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      let formattedTable = tableParam.trim();
      // If table is just a number (e.g. '5' or '12')
      if (/^\d+$/.test(formattedTable)) {
        formattedTable = `Table ${formattedTable}`;
      } else if (/^table\s*\d+$/i.test(formattedTable)) {
        const num = formattedTable.match(/\d+/)[0];
        formattedTable = `Table ${num}`;
      }
      setSelectedTable(formattedTable);
      triggerToast(`Table connection established: ${formattedTable}`, 'success');
    }
  }, []);

  // Check for stored authentication token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (storedToken && storedUser) {
      try {
        setAdminToken(storedToken);
        setAdminUser(JSON.parse(storedUser));
        setIsAdminLoggedIn(true);
      } catch (err) {
        console.error('Error restoring auth:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  // Fetch Menu Products from GET /api/products
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch menu products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      triggerToast('Could not load menu from server', 'error');
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch Orders from GET /api/orders
  const fetchOrders = async (silent = false) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      if (['customer', 'orders'].includes(activeTabRef.current) && selectedTableRef.current) {
        try {
          const res = await fetch(`${API_BASE_URL}/orders/table/${encodeURIComponent(selectedTableRef.current)}`);
          if (res.ok) {
            const tableOrders = await res.json();
            setOrders(tableOrders);
          }
        } catch (err) {
          console.error('Error fetching table orders:', err);
        }
      }
      if (!silent) setOrdersLoading(false);
      return;
    }

    try {
      if (!silent) setOrdersLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        if (!silent) triggerToast('Admin authentication required to load orders', 'error');
        setOrders([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      if (!silent) triggerToast('Could not synchronize orders with server', 'error');
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  };

  // On mount: fetch products and orders, setup polling
  useEffect(() => {
    // Initial data fetch
    fetchProducts();
    fetchOrders();
    // Load app settings
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings for app:', err);
      }
    })();

    // Poll orders every 5 seconds for live status/updates (fallback for admin)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    // Setup global socket listener for real-time updates for both admin and customers
    socketRef.current = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    socketRef.current.on('new_order', (newOrder) => {
      setOrders(prev => {
        // Prevent duplicate orders
        if (prev.find(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
    });
    socketRef.current.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Derived unique categories from loaded products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Cart operations
  const addToCart = (productId) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    const product = products.find(p => p.id === productId);
    if (product) {
      triggerToast(`Added ${product.name} to cart`);
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
    triggerToast('Cart cleared');
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const prod = products.find(p => p.id === parseInt(id));
      return total + (prod ? prod.price * qty : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  // Submit order to POST /api/orders
  const handlePlaceOrder = async () => {
    if (getCartItemCount() === 0) return;
    // Client-side minimum order validation
    try {
      const minRaw = settings && settings.minOrderValue ? settings.minOrderValue.toString() : null;
      const minNumeric = minRaw ? parseFloat(minRaw.replace(/[^0-9.]/g, '')) || 0 : 0;
      const cartTotal = getCartTotal();
      if (minNumeric > 0 && cartTotal < minNumeric) {
        triggerToast(`Minimum order is ${settings.minOrderValue}`, 'error');
        return;
      }
    } catch (err) {
      // ignore parsing errors and continue
      console.warn('Error parsing min order value:', err);
    }

    setIsPlacingOrder(true);
    try {
      // Build order items list of { product_id, quantity }
      const orderItems = Object.entries(cart).map(([id, quantity]) => ({
        product_id: parseInt(id),
        quantity
      }));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_number: selectedTable,
          items: orderItems,
          note: orderNote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
      }

      const orderResult = await response.json();
      setLastPlacedOrder(orderResult);
      // Immediately push to local state so the customer sees the Pending banner instantly
      setOrders(prev => [orderResult, ...prev]);
      setCart({});
      setOrderNote('');
      setIsMobileCartOpen(false); // Close mobile drawer if open
      triggerToast(`Order placed successfully for ${selectedTable}!`, 'success');
      fetchOrders(true); // refresh orders silently
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Error submitting order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Update order status via PATCH /api/orders/:id/status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      triggerToast(`Order #${orderId} set to ${newStatus}`, 'success');
      fetchOrders(true); // refresh list
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Error updating order status', 'error');
    }
  };

  // Calculate high-level metrics for kitchen dashboard
  const stats = {
    revenue: orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total_price, 0),
    completed: orders.filter(o => o.status === 'Served').length,
    pending: orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length,
    avgOrder: orders.length > 0
      ? orders.reduce((sum, o) => sum + o.total_price, 0) / orders.length
      : 0
  };

  // Filter products by category, displaying grouped lists when "All" is active
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  // Group filtered products for gorgeous structured section-by-section menu
  const getGroupedProducts = () => {
    const grouped = {};
    const relevantCategories = activeCategory === 'All'
      ? categories.filter(c => c !== 'All')
      : [activeCategory];

    relevantCategories.forEach(cat => {
      const items = products.filter(p => p.category === cat);
      if (items.length > 0) {
        grouped[cat] = items;
      }
    });
    return grouped;
  };

  const groupedProducts = getGroupedProducts();

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans pb-32">

      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/30 backdrop-blur-md'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30 backdrop-blur-md'
              }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Sticky Navigation Header - Hide on Admin Login Page to completely isolate UI */}
      {!(activeTab === 'kitchen' && !isAdminLoggedIn) && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statsPending={stats.pending}
          fetchOrders={fetchOrders}
          triggerToast={triggerToast}
          isAdminLoggedIn={isAdminLoggedIn}
          adminUser={adminUser}
          onLogout={handleAdminLogout}
        />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ==================================== */}
        {/* VIEW 1: CUSTOMER VIEW                */}
        {/* ==================================== */}
        {activeTab === 'customer' && (
          <div className="space-y-8">
            {isAdminLoggedIn ? (
              <div className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_35%)]" />

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 min-w-0">
                  <div className="max-w-2xl min-w-0 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('interactive_table_ordering')}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 shadow-inner">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('active_session')}</p>
                        <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
                          {selectedTable.replace('Table', t('table'))}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('table_qr_links')}</p>
                        <p className="mt-1 text-sm font-medium text-slate-300">{t('generate_qr_desc')}</p>
                      </div>
                    </div>

                    <p className="max-w-xl text-sm leading-relaxed text-slate-400">
                      {t('browse_menu_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{t('simulate_scanning')}</span>
                      <div className="flex flex-wrap gap-2">
                        {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6'].map(tbl => (
                          <button
                            key={tbl}
                            onClick={() => {
                              setSelectedTable(tbl);
                              triggerToast(t('switched_session', { table: tbl.replace('Table', t('table')) }), 'success');
                            }}
                            className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-all ${selectedTable === tbl
                                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15'
                                : 'bg-slate-800/90 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                              }`}
                          >
                            {tbl.replace('Table', t('table'))}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-4 py-3 shadow-inner self-start xl:self-auto">
                    <div className="flex h-12 min-w-45 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
                      <QrCode className="h-8 w-8 text-slate-950" />
                    </div>
                    <div className="min-w-45">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{t('quick_access', 'Quick access')}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">{t('quick_access_desc', 'Open the menu and place your order in seconds.')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* Left columns (Products list - Category filter + categorized grids) */}
              <div className="lg:col-span-2 space-y-6">

                {/* Horizontal Category Selector */}
                <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none sticky top-16 z-20 bg-slate-950 py-2.5 min-w-0">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all border ${activeCategory === cat
                          ? 'bg-slate-100 text-slate-950 border-slate-100'
                          : 'bg-slate-900 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                    >
                      {cat === 'All' ? t('all') : cat}
                    </button>
                  ))}
                </div>

                {/* Grouped section category loops */}
                {productsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} className="bg-slate-900/50 rounded-3xl p-4 border border-slate-800 space-y-4 animate-pulse">
                        <div className="aspect-video w-full bg-slate-800 rounded-2xl" />
                        <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                        <div className="h-3 bg-slate-800 rounded-md w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-4 bg-slate-800 rounded-md w-1/4" />
                          <div className="h-8 bg-slate-800 rounded-lg w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Object.keys(groupedProducts).length === 0 ? (
                  <div className="text-center bg-slate-900/40 rounded-3xl p-16 border border-slate-900">
                    <p className="text-slate-500 text-sm">{t('no_items_found', 'No culinary items found in this section.')}</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {Object.entries(groupedProducts).map(([catName, items]) => (
                      <div key={catName} className="space-y-5">
                        {/* Section Category Title */}
                        <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                          <span className="w-1.5 h-6 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20" />
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-100 uppercase">{catName}</h3>
                          <span className="text-[10px] bg-slate-900 text-slate-500 px-2.5 py-0.5 rounded-full font-bold border border-slate-800">
                            {items.length} {t('options')}
                          </span>
                        </div>

                        {/* Category specific products grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {items.map(product => (
                            <MenuCard
                              key={product.id}
                              product={product}
                              cartQty={cart[product.id] || 0}
                              addToCart={addToCart}
                              removeFromCart={removeFromCart}
                              onViewDetails={() => openProductModal(product)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column sidebar (Desktop Cart - visible only on large screen size) */}
              <div className="hidden lg:block bg-slate-900/80 rounded-3xl border border-slate-850 p-6 space-y-6 sticky top-24 shadow-xl">
                <CartModal
                  isSidebar={true}
                  cart={cart}
                  settings={settings}
                  products={products}
                  removeFromCart={removeFromCart}
                  addToCart={addToCart}
                  clearCart={clearCart}
                  orderNote={orderNote}
                  setOrderNote={setOrderNote}
                  getCartTotal={getCartTotal}
                  getCartItemCount={getCartItemCount}
                  handlePlaceOrder={handlePlaceOrder}
                  isPlacingOrder={isPlacingOrder}
                  selectedTable={selectedTable}
                  lastPlacedOrder={lastPlacedOrder}
                />
              </div>

            </div>

          </div>
        )}

        {/* ==================================== */}
        {/* VIEW 1.5: CUSTOMER ORDERS (TRACKER)  */}
        {/* ==================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 max-w-3xl mx-auto">
            {/* Active Table Order History Section */}
            <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-850 space-y-5">
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <ListOrdered className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base sm:text-lg">{t('live_order_tracker')} ({selectedTable.replace('Table', t('table'))})</h3>
                    <p className="text-[11px] text-slate-500">{t('live_order_tracker_desc')}</p>
                  </div>
                </div>

                {orders.filter(o => o.table_number === selectedTable && ['Pending', 'Preparing', 'Served'].includes(o.status)).length > 0 && (
                  <button 
                    onClick={() => {
                      if (socketRef.current) {
                        socketRef.current.emit('call_waiter', { table: selectedTable, type: 'bill' });
                      }
                      triggerToast(t('bill_requested_msg', { table: selectedTable.replace('Table', t('table')) }), 'success');
                    }}
                    className="flex flex-col items-center justify-center gap-1 text-[#b395ff] hover:text-[#c4b5fd] transition-colors active:scale-95 cursor-pointer bg-transparent border-none p-1 shrink-0"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="3" width="12" height="8" rx="1.5" />
                      <path d="M4 14l2-3h12l2 3v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z" />
                      <circle cx="9" cy="16.5" r="0.5" fill="currentColor"/>
                      <circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>
                      <circle cx="15" cy="16.5" r="0.5" fill="currentColor"/>
                    </svg>
                    <span className="text-[10px] font-bold tracking-wide mt-0.5">POS</span>
                  </button>
                )}
              </div>

              {orders.filter(o => o.table_number === selectedTable && ['Pending', 'Preparing', 'Served'].includes(o.status)).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  {t('no_orders_recorded', { table: selectedTable.replace('Table', t('table')) })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {orders
                    .filter(o => o.table_number === selectedTable && ['Pending', 'Preparing', 'Served'].includes(o.status))
                    .map(order => (
                      <div key={order.id} className="border border-slate-800/80 rounded-2xl p-4.5 bg-slate-900/40 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">{t('ticket')} #{order.id}</span>
                            <div className="text-xs text-slate-400 mt-0.5">{t('placed')}: {new Date(order.createdAt).toLocaleTimeString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {['Preparing', 'Served'].includes(order.status) && order.prep_time_minutes ? (
                              <CountdownTimer order={order} />
                            ) : null}
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                order.status === 'Preparing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  order.status === 'Served' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    'bg-slate-800 text-slate-500 border border-slate-700/50'
                              }`}>
                              {t(order.status.toLowerCase(), order.status)}
                            </span>
                          </div>
                        </div>

                        {/* List items */}
                        <div className="text-xs text-slate-400 divide-y divide-slate-800/50 space-y-1.5">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between py-1.5 first:pt-0">
                              <span className="font-light text-slate-300">
                                {item.product?.name} <span className="text-slate-500 text-[10px] font-bold">x{item.quantity}</span>
                              </span>
                              <span className="font-bold text-slate-300">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-800/60 text-xs">
                          <span className="font-semibold text-slate-500">{t('grand_total')}</span>
                          <span className="font-black text-sm text-amber-400">${order.total_price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success modal after placing order */}
        <OrderSuccessModal order={lastPlacedOrder} isOpen={!!lastPlacedOrder} onClose={() => setLastPlacedOrder(null)} />

        {/* ==================================== */}
        {/* VIEW 2: KITCHEN STAFF MONITOR VIEW   */}
        {/* ==================================== */}
        {activeTab === 'kitchen' && !isAdminLoggedIn ? (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        ) : activeTab === 'kitchen' && isAdminLoggedIn ? (
          <AdminDashboard
            onNewOrderToast={(msg) => triggerToast(msg, 'success')}
          />
        ) : null}

        {activeTab === 'qr-generator' && !isAdminLoggedIn ? (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        ) : activeTab === 'qr-generator' && isAdminLoggedIn ? (
          <QrGenerator
            onSelectTable={(tableName) => {
              setSelectedTable(tableName);
              triggerToast(`Selected ${tableName} for local simulation session`, 'success');
            }}
            onNavigateToMenu={() => {
              setActiveTab('customer');
            }}
          />
        ) : null}

        {activeTab === 'add-product' && !isAdminLoggedIn ? (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        ) : activeTab === 'add-product' && isAdminLoggedIn ? (
          <AddProduct
            onProductAdded={(product, isEditing, action = 'create') => {
              fetchProducts();
              if (action === 'delete') {
                triggerToast(`Deleted ${product?.name || 'product'} from menu`, 'success');
                return;
              }
              triggerToast(
                isEditing ? `Updated ${product.name} in menu` : `Added ${product.name} to menu!`,
                'success'
              );
              setActiveTab('customer');
            }}
            onCancel={() => {
              setActiveTab('customer');
            }}
          />
        ) : null}

        {activeTab === 'analytics' && !isAdminLoggedIn ? (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        ) : activeTab === 'analytics' && isAdminLoggedIn ? (
          <Analytics orders={orders} />
        ) : null}

        {activeTab === 'settings' && !isAdminLoggedIn ? (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        ) : activeTab === 'settings' && isAdminLoggedIn ? (
          <Settings
            onCancel={() => {
              setActiveTab('customer');
            }}
            triggerToast={triggerToast}
          />
        ) : null}

      </main>

      {['customer', 'orders'].includes(activeTab) && (
        <footer className="bg-slate-950 border-t border-slate-900 mt-20 py-8 pb-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <p className="text-slate-500 text-xs font-semibold">BiteQR • Fully integrated Node.js, Express, SQLite & Sequelize backend</p>
            <p className="text-[10px] text-slate-600">All prices and actions reflect live requests to our backend SQLite API endpoints. Zero mock data is used.</p>
          </div>
        </footer>
      )}


      {/* MOBILE STICKY FLOATING CART BAR AND MOBILE DRAWER CART OVERLAY */}
      {activeTab === 'customer' && (
        <CartModal
          isMobile={true}
          isOpen={isMobileCartOpen}
          setIsOpen={setIsMobileCartOpen}
          settings={settings}
          cart={cart}
          products={products}
          removeFromCart={removeFromCart}
          addToCart={addToCart}
          clearCart={clearCart}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
          getCartTotal={getCartTotal}
          getCartItemCount={getCartItemCount}
          handlePlaceOrder={handlePlaceOrder}
          isPlacingOrder={isPlacingOrder}
          selectedTable={selectedTable}
          lastPlacedOrder={lastPlacedOrder}
        />
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
        addToCart={addToCart}
      />

      {/* QR Code Scan Generator Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowQrModal(false)}
                className="fixed inset-0 transition-opacity bg-slate-950/80 backdrop-blur-sm"
              />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
              >
                <div className="px-6 pt-6 pb-5 space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-slate-100 leading-none">Simulation scan links</h3>
                    <button
                      onClick={() => setShowQrModal(false)}
                      className="p-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed font-light">
                    Generate table specific search paths to test real automatic routing. Copy, scan, or click these active links:
                  </p>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {[1, 2, 3, 4, 5, 6].map(num => {
                      const link = `?table=${num}`;
                      return (
                        <div key={num} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-xs font-bold text-slate-300">Table {num} link</span>
                          <a
                            href={link}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition-colors"
                          >
                            Scan / Visit
                          </a>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs">
                    <code className="text-[10px] text-indigo-400 font-mono">/menu?table=[1-6]</code>
                  </div>
                </div>

                <div className="bg-slate-900/60 px-6 py-4 flex justify-end border-t border-slate-800/60">
                  <button
                    onClick={() => setShowQrModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-950 text-xs font-black rounded-xl transition-all"
                  >
                    Close Hub
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* Global Bottom Navigation Bar (Only for Customers) */}
      {['customer', 'orders'].includes(activeTab) && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800/50 z-50 px-4 py-2 flex justify-center gap-12 items-center pb-safe">
          {/* Home Tab (Customer Menu) */}
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 p-2 w-20 ${activeTab === 'customer' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <Utensils className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wide mt-0.5">{t('nav_home')}</span>
        </button>

        {/* Orders Tab (Customer Live Tracker) */}
        <button
          onClick={() => {
            setActiveTab('orders');
            fetchOrders();
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 p-2 w-20 ${activeTab === 'orders' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-400'}`}
        >
          <ListOrdered className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wide mt-0.5">{t('nav_orders')}</span>
        </button>
      </div>
      )}
    </div>
  );
}
