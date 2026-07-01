import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL, SOCKET_URL } from '../config';

export function useOrders(triggerToast, selectedTable, handleAdminLogout) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const socketRef = useRef(null);
  const location = useLocation();
  
  const activePathRef = useRef(location.pathname);
  const selectedTableRef = useRef(selectedTable);
  useEffect(() => { activePathRef.current = location.pathname; }, [location.pathname]);
  useEffect(() => { selectedTableRef.current = selectedTable; }, [selectedTable]);

  const fetchOrders = async (silent = false) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      if ((activePathRef.current === '/' || activePathRef.current === '/orders') && selectedTableRef.current) {
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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        if (!silent) triggerToast('Session expired. Please log in again.', 'error');
        handleAdminLogout();
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

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => { fetchOrders(true); }, 5000);

    socketRef.current = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    socketRef.current.on('new_order', (newOrder) => {
      setOrders(prev => {
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

  const stats = {
    revenue: orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total_price, 0),
    completed: orders.filter(o => o.status === 'Served').length,
    pending: orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length,
    avgOrder: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_price, 0) / orders.length : 0
  };

  return {
    orders,
    setOrders,
    ordersLoading,
    fetchOrders,
    socketRef,
    stats
  };
}
