import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ProductDetailModal({ product, isOpen, onClose, addToCart }) {
  const [qty, setQty] = useState(1);
  const { t } = useTranslation();

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-3xl w-[min(680px,96%)] border border-slate-800 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-100">{product.name}</h3>
                <p className="text-sm text-slate-400 mt-2">{product.description}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-2xl border border-slate-800" />
                ) : (
                  <div className="w-full h-48 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">{t('no_image_selected')}</div>
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-black text-amber-400">${product.price.toFixed(2)}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 rounded-lg bg-slate-800 text-slate-200">
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-2 bg-slate-950 rounded-lg text-slate-100 font-black">{qty}</div>
                    <button onClick={() => setQty(q => q + 1)} className="p-2 rounded-lg bg-slate-800 text-slate-200">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-400">
                  <p>{product.description}</p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      for (let i = 0; i < qty; i++) addToCart(product.id);
                      onClose();
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-3 rounded-xl font-black shadow-md"
                  >
                    {t('add_qty_to_cart', { qty })}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
