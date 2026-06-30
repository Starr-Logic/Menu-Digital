import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  Info, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  X 
} from 'lucide-react';

export default function CartModal({
  cart,
  products,
  removeFromCart,
  addToCart,
  clearCart,
  orderNote,
  setOrderNote,
  getCartTotal,
  getCartItemCount,
  handlePlaceOrder,
  isPlacingOrder,
  selectedTable,
  lastPlacedOrder,
  settings,
  // layout triggers
  isSidebar = false,
  isMobile = false,
  isOpen = false,
  setIsOpen = null
}) {
  const { t } = useTranslation();

  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();
  // Parse minimum order from settings (string like "$5.00")
  let minOrderRaw = null;
  let minOrderNumeric = 0;
  try {
    minOrderRaw = settings && settings.minOrderValue ? settings.minOrderValue.toString() : null;
    minOrderNumeric = minOrderRaw ? parseFloat(minOrderRaw.replace(/[^0-9.]/g, '')) || 0 : 0;
  } catch (err) {
    minOrderNumeric = 0;
  }
  const belowMin = minOrderNumeric > 0 && cartTotal < minOrderNumeric;

  // Unified Cart Panel Inner Content
  const renderCartPanelContent = () => (
    <div className="space-y-6 min-w-0" id="cart-panel-inner">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4" id="cart-header">
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="w-5 h-5 text-amber-500 animate-pulse" />
          <h3 className="font-extrabold text-slate-100 text-base">{t('order_basket')}</h3>
        </div>
        {cartItemCount > 0 && (
          <button 
            id="btn-clear-cart"
            onClick={clearCart}
            className="text-slate-500 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-950 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('clear')}
          </button>
        )}
      </div>

      {cartItemCount === 0 ? (
        <div className="text-center py-16 space-y-4" id="cart-empty-state">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-300 text-sm font-bold">{t('basket_empty')}</p>
            <p className="text-xs text-slate-500 max-w-60 mx-auto">{t('select_items')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Item List */}
          <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto pr-1" id="cart-items-list">
            {Object.entries(cart).map(([id, qty]) => {
              const prod = products.find(p => p.id === parseInt(id));
              if (!prod) return null;
              return (
                <div key={id} className="flex items-center justify-between py-3.5 first:pt-0 min-w-0" id={`cart-item-${id}`}>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{prod.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">${prod.price.toFixed(2)} {t('each')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-100">${(prod.price * qty).toFixed(2)}</span>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button 
                        id={`cart-decrease-${id}`}
                        onClick={() => removeFromCart(prod.id)}
                        className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-200">{qty}</span>
                      <button 
                        id={`cart-increase-${id}`}
                        onClick={() => addToCart(prod.id)}
                        className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Special Notes */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80" id="cart-notes-container">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-500" />
              {t('special_notes')}
            </label>
            <input 
              type="text" 
              placeholder={t('notes_placeholder')} 
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Pricing Details */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs" id="cart-pricing-details">
            <div className="flex justify-between text-slate-400">
              <span>{t('subtotal')}</span>
              <span className="font-semibold text-slate-200">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t('vat')}</span>
              <span>{t('included')}</span>
            </div>
            <div className="flex justify-between text-slate-100 font-black text-sm pt-2.5 border-t border-slate-800">
              <span>{t('total_due')}</span>
              <span className="text-amber-400 text-base">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            id="btn-confirm-checkout"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || belowMin}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
          >
            {isPlacingOrder ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                {t('submitting_order')}
              </>
            ) : (
              <>
                {t('confirm_send_order')} ({selectedTable.replace('Table', t('table'))})
              </>
            )}
          </button>

          {/* Minimum order notice */}
          {minOrderNumeric > 0 && belowMin && (
            <div className="mt-2 text-xs text-rose-300 bg-rose-950/10 border border-rose-800 rounded-xl p-2">
              <strong className="font-black">Minimum order:</strong> {minOrderRaw}. Add <span className="font-bold">${(minOrderNumeric - cartTotal).toFixed(2)}</span> more to proceed.
            </div>
          )}
        </>
      )}

      {/* Persistent Order Success Panel */}
      {lastPlacedOrder && (
        <motion.div 
          id="order-success-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs space-y-2"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
            {t('sent_to_kitchen')}
          </div>
          <p className="text-slate-300 leading-relaxed font-light">
            {t('preparing_text')}
          </p>
          <div className="text-[10px] text-slate-500 border-t border-emerald-500/10 pt-2 flex justify-between">
            <span>{t('ticket')} #{lastPlacedOrder.id}</span>
            <span>Paid: ${lastPlacedOrder.total_price.toFixed(2)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (isSidebar) {
    return (
      <div className="bg-slate-900/80 rounded-3xl border border-slate-850 p-6 space-y-6 sticky top-24 shadow-xl" id="desktop-sidebar-cart">
        {renderCartPanelContent()}
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        {/* MOBILE STICKY FLOATING CART BAR */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-6 inset-x-4 z-40 lg:hidden" id="mobile-floating-cart-trigger">
            <button 
              onClick={() => setIsOpen(true)}
              className="w-full bg-slate-100 text-slate-950 rounded-2xl py-4 px-5 flex justify-between items-center shadow-2xl hover:bg-white transition-all active:scale-[0.98] border border-white/10 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-slate-950 text-amber-400 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-100">
                    {cartItemCount}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-black tracking-wide text-slate-900">{t('view_active_order')}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{t('items_ready', { count: cartItemCount })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black text-amber-600 text-sm">
                ${cartTotal.toFixed(2)}
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </div>
            </button>
          </div>
        )}

        {/* MOBILE DRAWER CART OVERLAY */}
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" id="mobile-cart-drawer-container">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              {/* Drawer Sheet */}
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute bottom-0 inset-x-0 bg-slate-900 rounded-t-4xl border-t border-slate-800 p-6 space-y-6 max-h-[85vh] overflow-y-auto"
                id="mobile-cart-drawer-sheet"
              >
                <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-1" />
                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    {selectedTable.replace('Table', t('table'))} {t('ordering')}
                  </span>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderCartPanelContent()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Fallback direct render
  return renderCartPanelContent();
}
