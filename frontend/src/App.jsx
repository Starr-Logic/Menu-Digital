import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ListOrdered,
  QrCode,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import QrGenerator from './components/QrGenerator';
import AdminDashboard from './components/AdminDashboard';
import AddProduct from './components/AddProduct';
import Navbar from './components/Navbar';
import MenuCard from './components/MenuCard';
import CartModal from './components/CartModal';
import { API_BASE_URL } from './config';

export default function App() {
  const { t, i18n } = useTranslation();

  // Navigation / View state: 'customer' or 'kitchen'
  const [activeTab, setActiveTab] = useState('customer');
  
  // Products and Orders states from Backend APIs
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Customer State
  const [selectedTable, setSelectedTable] = useState('Table 3');
  const [cart, setCart] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Notifications state
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast helper
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
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
    try {
      if (!silent) setOrdersLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`);
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
    fetchProducts();
    fetchOrders();

    // Poll orders every 5 seconds for live status/updates
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(interval);
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
      }

      const orderResult = await response.json();
      setLastPlacedOrder(orderResult);
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
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans pb-24 lg:pb-8">
      
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${
              toast.type === 'error' 
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

      {/* Global Sticky Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        statsPending={stats.pending} 
        fetchOrders={fetchOrders} 
        triggerToast={triggerToast} 
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================================== */}
        {/* VIEW 1: CUSTOMER VIEW                */}
        {/* ==================================== */}
        {activeTab === 'customer' && (
          <div className="space-y-8">
            
            {/* Table Header Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                    {t('interactive_table_ordering')}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-slate-100">
                    {t('active_session')}: <span className="text-amber-400">{selectedTable.replace('Table', t('table'))}</span>
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-light leading-relaxed">
                    {t('browse_menu_desc')}
                  </p>
                  
                  {/* Quick table switcher for testing */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('simulate_scanning')}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6'].map(tbl => (
                        <button
                          key={tbl}
                          onClick={() => {
                            setSelectedTable(tbl);
                            triggerToast(t('switched_session', { table: tbl.replace('Table', t('table')) }), 'success');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                            selectedTable === tbl 
                              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {tbl.replace('Table', t('table'))}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 self-start md:self-auto shadow-inner">
                  <div className="p-2.5 bg-white rounded-xl shadow-md">
                    <QrCode className="w-14 h-14 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-200">{t('table_qr_links')}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">{t('generate_qr_desc')}</p>
                    <button 
                      onClick={() => setShowQrModal(true)}
                      className="mt-2.5 flex items-center gap-1 text-xs text-amber-400 font-extrabold hover:text-amber-300 transition-colors"
                    >
                      {t('open_qr_hub')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout: Menu list & Desktop sidebar cart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left columns (Products list - Category filter + categorized grids) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Horizontal Category Selector */}
                <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none sticky top-16 z-20 bg-slate-950 py-2.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                        activeCategory === cat 
                          ? 'bg-slate-100 text-slate-950 border-slate-100' 
                          : 'bg-slate-900 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      {cat}
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

            {/* Active Table Order History Section */}
            <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-850 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base sm:text-lg">{t('live_order_tracker')} ({selectedTable.replace('Table', t('table'))})</h3>
                  <p className="text-[11px] text-slate-500">{t('live_order_tracker_desc')}</p>
                </div>
              </div>

              {orders.filter(o => o.table_number === selectedTable).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  {t('no_orders_recorded', { table: selectedTable.replace('Table', t('table')) })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {orders
                    .filter(o => o.table_number === selectedTable)
                    .map(order => (
                      <div key={order.id} className="border border-slate-800/80 rounded-2xl p-4.5 bg-slate-900/40 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">{t('ticket')} #{order.id}</span>
                            <div className="text-xs text-slate-400 mt-0.5">{t('placed')}: {new Date(order.createdAt).toLocaleTimeString()}</div>
                          </div>
                          <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                            order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            order.status === 'Preparing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            order.status === 'Served' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-slate-800 text-slate-500 border border-slate-700/50'
                          }`}>
                            {t(order.status.toLowerCase(), order.status)}
                          </span>
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

        {/* ==================================== */}
        {/* VIEW 2: KITCHEN STAFF MONITOR VIEW   */}
        {/* ==================================== */}
        {activeTab === 'kitchen' && (
          <AdminDashboard 
            onNewOrderToast={(msg) => triggerToast(msg, 'success')} 
          />
        )}

        {activeTab === 'qr-generator' && (
          <QrGenerator 
            onSelectTable={(tableName) => {
              setSelectedTable(tableName);
              triggerToast(`Selected ${tableName} for local simulation session`, 'success');
            }}
            onNavigateToMenu={() => {
              setActiveTab('customer');
            }}
          />
        )}

        {activeTab === 'add-product' && (
          <AddProduct 
            onProductAdded={(newProduct) => {
              fetchProducts();
              triggerToast(`Added ${newProduct.name} to menu!`, 'success');
              setActiveTab('customer');
            }}
            onCancel={() => {
              setActiveTab('customer');
            }}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-slate-500 text-xs font-semibold">BiteQR • Fully integrated Node.js, Express, SQLite & Sequelize backend</p>
          <p className="text-[10px] text-slate-600">All prices and actions reflect live requests to our backend SQLite API endpoints. Zero mock data is used.</p>
        </div>
      </footer>

      {/* MOBILE STICKY FLOATING CART BAR AND MOBILE DRAWER CART OVERLAY */}
      {activeTab === 'customer' && (
        <CartModal 
          isMobile={true}
          isOpen={isMobileCartOpen}
          setIsOpen={setIsMobileCartOpen}
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

    </div>
  );
}
