import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Import hooks
import { useAuth } from '../hooks/useAuth';
import { useMenu } from '../hooks/useMenu';
import { useOrders } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';
import { useTableSync } from '../hooks/useTableSync';
import { API_BASE_URL } from '../config';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(null);

  const triggerToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  const tableSync = useTableSync(triggerToast);
  const auth = useAuth(triggerToast);
  const menu = useMenu(triggerToast);

  // We need a stable reference to resetCustomerOrderState for the auth hook
  // Since cart depends on orders and orders depends on auth, we break the circle:
  const cartRef = useRef(null);

  const orders = useOrders(
    triggerToast,
    tableSync.selectedTable,
    () => auth.handleAdminLogout(() => cartRef.current?.resetCustomerOrderState())
  );

  const cart = useCart(
    menu.products,
    tableSync.selectedTable,
    settings,
    orders.setOrders,
    orders.fetchOrders,
    triggerToast
  );

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const value = {
    toast,
    triggerToast,
    settings,
    ...tableSync,
    ...auth,
    ...menu,
    ...orders,
    ...cart
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
