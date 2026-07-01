import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const [qty, setQty] = useState(1);
  const { t } = useTranslation();
  const { addToCart } = useAppContext();

  // Reset quantity when product changes
  useEffect(() => {
    if (isOpen) setQty(1);
  }, [isOpen, product]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl z-10 border border-slate-800"
          >
            {/* Close Button - Floating */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 backdrop-blur-md transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row">
              {/* Product Image */}
              <div className="w-full sm:w-2/5 h-64 sm:h-auto bg-slate-800 shrink-0 relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    {t('no_image_selected')}
                  </div>
                )}
                {/* Gradient overlay for mobile text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent sm:hidden" />
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight pr-8">
                    {product.name}
                  </h3>
                  <div className="text-amber-500 font-black text-2xl mt-2">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                  {product.description}
                </p>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-800 mt-auto">
                  <div className="flex items-center justify-between gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setQty(q => Math.max(1, q - 1))} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-8 text-center font-black text-slate-100 text-xl">
                        {qty}
                      </span>
                      <button 
                        onClick={() => setQty(q => q + 1)} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => {
                        for (let i = 0; i < qty; i++) addToCart(product.id);
                        onClose();
                      }}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black transition-colors shadow-[0_8px_20px_rgba(245,158,11,0.2)]"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="hidden sm:inline">{t('add_qty_to_cart', { qty })}</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
