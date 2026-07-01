import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Context
import { useAppContext } from './contexts/AppContext';

// Pages
import QrGenerator from './pages/admin/QrGenerator';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import AdminLogin from './pages/admin/AdminLogin';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import CustomerMenu from './pages/customer/CustomerMenu';
import CustomerOrders from './pages/customer/CustomerOrders';
import CartModal from './pages/customer/CartModal';

// Components
import Navbar from './components/Navbar';
import ProductDetailModal from './pages/customer/ProductDetailModal';
import OrderSuccessModal from './pages/customer/OrderSuccessModal';
import GlobalToast from './components/GlobalToast';
import BottomNav from './components/BottomNav';
import SimulationHubModal from './components/SimulationHubModal';

export default function App() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const location = useLocation();

  const {
    isAdminLoggedIn,
    handleAdminLogin,
    lastPlacedOrder,
    setLastPlacedOrder,
    isMobileCartOpen,
    setIsMobileCartOpen,
    toast,
    triggerToast,
  } = useAppContext();

  const isCustomerRoute = location.pathname === '/' || location.pathname === '/orders';

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans pb-32">
      <GlobalToast toast={toast} />

      {!(location.pathname.startsWith('/admin') && !isAdminLoggedIn) && <Navbar />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerMenu openProductModal={(p) => { setSelectedProduct(p); setIsProductModalOpen(true); }} />} />
          <Route path="/orders" element={<CustomerOrders />} />

          {/* Admin Routes */}
          <Route path="/admin" element={!isAdminLoggedIn ? <AdminLogin onLoginSuccess={handleAdminLogin} /> : <AdminDashboard onNewOrderToast={triggerToast} />} />
          <Route path="/admin/qr" element={!isAdminLoggedIn ? <AdminLogin onLoginSuccess={handleAdminLogin} /> : <QrGenerator onNavigateToMenu={() => { }} />} />
          <Route path="/admin/products" element={!isAdminLoggedIn ? <AdminLogin onLoginSuccess={handleAdminLogin} /> : <AddProduct onCancel={() => { }} />} />
          <Route path="/admin/analytics" element={!isAdminLoggedIn ? <AdminLogin onLoginSuccess={handleAdminLogin} /> : <Analytics />} />
          <Route path="/admin/settings" element={!isAdminLoggedIn ? <AdminLogin onLoginSuccess={handleAdminLogin} /> : <Settings onCancel={() => { }} />} />
        </Routes>
      </main>
      {location.pathname === '/' && (
        <CartModal isMobile={true} isOpen={isMobileCartOpen} setIsOpen={setIsMobileCartOpen} />
      )}

      <OrderSuccessModal order={lastPlacedOrder} isOpen={!!lastPlacedOrder} onClose={() => setLastPlacedOrder(null)} />
      <ProductDetailModal product={selectedProduct} isOpen={isProductModalOpen} onClose={() => { setSelectedProduct(null); setIsProductModalOpen(false); }} />
      <SimulationHubModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />

      <BottomNav />
    </div>
  );
}
