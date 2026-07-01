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
import { useAppContext } from '../../contexts/AppContext';

export default function CartModal({
  // layout triggers
  isSidebar = false,
  isMobile = false,
  isOpen = false,
  setIsOpen = null
}) {
  const { t } = useTranslation();
  
  const {
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
    settings
  } = useAppContext();

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
      <div className="flex justify-between items-center border-b border-slate-100 pb-4" id="cart-header">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">{t('order_basket')}</h3>
        </div>
        {cartItemCount > 0 && (
          <button 
            id="btn-clear-cart"
            onClick={clearCart}
            className="text-slate-600 hover:text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('clear')}
          </button>
        )}
      </div>

      {cartItemCount === 0 ? (
        <div className="text-center py-16 space-y-4" id="cart-empty-state">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-700 text-sm font-semibold">{t('basket_empty')}</p>
            <p className="text-xs text-slate-400 max-w-60 mx-auto">{t('select_items')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Item List */}
          <div className="divide-y divide-slate-100 max-h-[45vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent" id="cart-items-list">
            {Object.entries(cart).map(([id, qty]) => {
              const prod = products.find(p => p.id === parseInt(id));
              if (!prod) return null;
              return (
                <div key={id} className="flex items-center justify-between py-4 min-w-0" id={`cart-item-${id}`}>
                  <div className="space-y-1 flex-1 pr-4">
                    <h4 className="text-[15px] font-semibold text-slate-800 leading-tight">{prod.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">${prod.price.toFixed(2)} {t('each')}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-bold text-slate-800">${(prod.price * qty).toFixed(2)}</span>
                    <div className="flex items-center gap-0.5 bg-white rounded-full border border-slate-200 shadow-sm">
                      <button 
                        id={`cart-decrease-${id}`}
                        onClick={() => removeFromCart(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold text-slate-800 w-6 text-center">{qty}</span>
                      <button 
                        id={`cart-increase-${id}`}
                        onClick={() => addToCart(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Special Notes */}
          <div className="space-y-2 pt-4 border-t border-slate-100" id="cart-notes-container">
            <label className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              {t('special_notes')}
            </label>
            <input 
              type="text" 
              placeholder={t('notes_placeholder')} 
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full text-[13px] px-4 py-3 bg-slate-50/50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Pricing Details */}
          <div className="space-y-3 pt-5 mt-2 border-t border-slate-100 text-[13px]" id="cart-pricing-details">
            <div className="flex justify-between text-slate-600">
              <span>{t('subtotal')}</span>
              <span className="font-semibold text-slate-800">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>{t('vat')}</span>
              <span>{t('included')}</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
              <span className="text-slate-800 font-bold text-sm">{t('total_due')}</span>
              <span className="text-amber-500 font-extrabold text-xl tracking-tight">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            id="btn-confirm-checkout"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || belowMin}
            className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-slate-800 text-[13px] font-bold rounded-2xl shadow-[0_8px_24px_rgba(245,158,11,0.12)] border border-amber-200/60 hover:bg-amber-50/30 transition-all cursor-pointer"
          >
            {isPlacingOrder ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
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
            <div className="mt-3 text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 font-medium flex items-center justify-center">
              <span dangerouslySetInnerHTML={{ __html: t('minimum_order_text', { minOrder: minOrderRaw, diff: `$${(minOrderNumeric - cartTotal).toFixed(2)}` }) }} />
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
          className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs space-y-2 mt-4"
        >
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            {t('sent_to_kitchen')}
          </div>
          <p className="text-emerald-700/80 leading-relaxed font-medium">
            {t('preparing_text')}
          </p>
          <div className="text-[10px] text-emerald-600/70 border-t border-emerald-100 pt-2 flex justify-between font-bold">
            <span>{t('ticket')} #{lastPlacedOrder.id}</span>
            <span>Paid: ${lastPlacedOrder.total_price.toFixed(2)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (isSidebar) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-100 p-7 space-y-6 sticky top-24 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]" id="desktop-sidebar-cart">
        {renderCartPanelContent()}
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        {/* MOBILE STICKY FLOATING CART BAR */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-24 inset-x-4 z-40 lg:hidden" id="mobile-floating-cart-trigger">
            <button 
              onClick={() => setIsOpen(true)}
              className="w-full bg-slate-900 text-white rounded-[24px] py-3.5 px-5 flex justify-between items-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative p-2.5 bg-slate-800 text-slate-300 rounded-2xl">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartItemCount}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-bold tracking-wide text-slate-100">{t('view_active_order')}</p>
                  <p className="text-[10.5px] text-slate-400 font-medium">{t('items_ready', { count: cartItemCount })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm bg-slate-800/80 px-4 py-2 rounded-xl">
                ${cartTotal.toFixed(2)}
                <ArrowRight className="w-4 h-4 text-amber-500" />
              </div>
            </button>
          </div>
        )}

        {/* MOBILE DRAWER CART OVERLAY */}
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[60] overflow-hidden lg:hidden" id="mobile-cart-drawer-container">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              {/* Drawer Sheet */}
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                className="absolute bottom-0 inset-x-0 bg-white rounded-t-[36px] p-6 pt-5 space-y-6 max-h-[90vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                id="mobile-cart-drawer-sheet"
              >
                {/* Drag handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2" />
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-100/50 tracking-wide">
                    {selectedTable.replace('Table', t('table'))} {t('ordering')}
                  </span>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
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
