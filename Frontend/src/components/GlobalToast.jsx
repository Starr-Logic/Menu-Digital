import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function GlobalToast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4.5 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${
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
  );
}
