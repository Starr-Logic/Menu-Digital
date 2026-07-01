import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OrderSuccessModal({ order, isOpen, onClose }) {
  const { t } = useTranslation();
  if (!order) return null;

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-3xl w-[min(520px,94%)] border border-slate-800 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-100">{t('order_sent')}</h3>
                <p className="text-sm text-slate-400">{t('order_sent_kitchen_desc')}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex justify-between"><span className="text-slate-500">{t('ticket')}</span><span className="font-black">#{order.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t('table')}</span><span className="font-black">{order.table_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t('total')}</span><span className="font-black text-amber-400">${order.total_price.toFixed(2)}</span></div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-950 font-black rounded-xl">{t('close')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
