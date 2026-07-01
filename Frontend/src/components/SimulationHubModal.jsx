import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function SimulationHubModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 transition-opacity bg-slate-950/80 backdrop-blur-sm"
            />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
            >
              <div className="px-6 pt-6 pb-5 space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-slate-100 leading-none">Simulation scan links</h3>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed font-light">
                  Generate table specific search paths to test real automatic routing. Copy, scan, or click these active links:
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {[1, 2, 3, 4, 5, 6].map(num => {
                    const link = `?table=${num}`;
                    return (
                      <div key={num} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-xs font-bold text-slate-300">Table {num} link</span>
                        <a
                          href={link}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition-colors"
                        >
                          Scan / Visit
                        </a>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs">
                  <code className="text-[10px] text-indigo-400 font-mono">/menu?table=[1-6]</code>
                </div>
              </div>

              <div className="bg-slate-900/60 px-6 py-4 flex justify-end border-t border-slate-800/60">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-950 text-xs font-black rounded-xl transition-all"
                >
                  Close Hub
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
