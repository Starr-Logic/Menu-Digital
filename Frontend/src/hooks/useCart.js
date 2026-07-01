import { useState } from 'react';
import { API_BASE_URL } from '../config';

export function useCart(products, selectedTable, settings, setOrders, fetchOrders, triggerToast) {
  const [cart, setCart] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [orderNote, setOrderNote] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const resetCustomerOrderState = () => {
    setCart({});
    setOrderNote('');
    setIsMobileCartOpen(false);
    setLastPlacedOrder(null);
  };

  const addToCart = (productId) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    const product = products.find(p => p.id === productId);
    if (product) triggerToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) { updated[productId] -= 1; } 
      else { delete updated[productId]; }
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

  const handlePlaceOrder = async () => {
    if (getCartItemCount() === 0) return;
    try {
      const minRaw = settings && settings.minOrderValue ? settings.minOrderValue.toString() : null;
      const minNumeric = minRaw ? parseFloat(minRaw.replace(/[^0-9.]/g, '')) || 0 : 0;
      const cartTotal = getCartTotal();
      if (minNumeric > 0 && cartTotal < minNumeric) {
        triggerToast(`Minimum order is ${settings.minOrderValue}`, 'error');
        return;
      }
    } catch (err) { console.warn(err); }

    setIsPlacingOrder(true);
    try {
      const orderItems = Object.entries(cart).map(([id, quantity]) => ({
        product_id: parseInt(id), quantity
      }));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setOrders(prev => [orderResult, ...prev]);
      setCart({});
      setOrderNote('');
      setIsMobileCartOpen(false);
      triggerToast(`Order placed successfully for ${selectedTable}!`, 'success');
      fetchOrders(true);
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Error submitting order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return {
    cart,
    isPlacingOrder,
    lastPlacedOrder,
    setLastPlacedOrder,
    orderNote,
    setOrderNote,
    isMobileCartOpen,
    setIsMobileCartOpen,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    handlePlaceOrder,
    resetCustomerOrderState
  };
}
