import { useTranslation } from 'react-i18next';
import { ListOrdered } from 'lucide-react';
import CountdownTimer from '../../components/CountdownTimer';
import { useAppContext } from '../../contexts/AppContext';

export default function CustomerOrders() {
  const { t } = useTranslation();
  
  const { orders, selectedTable, socketRef, triggerToast } = useAppContext();

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 max-w-3xl mx-auto">
      {/* Active Table Order History Section */}
      <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-850 space-y-5">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base sm:text-lg">{t('live_order_tracker')} ({selectedTable.replace('Table', t('table'))})</h3>
              <p className="text-[11px] text-slate-500">{t('live_order_tracker_desc')}</p>
            </div>
          </div>

          {orders.filter(o => o.table_number === selectedTable && ['Pending', 'Preparing', 'Served'].includes(o.status)).length > 0 && (
            <button 
              onClick={() => {
                if (socketRef.current) {
                  socketRef.current.emit('call_waiter', { table: selectedTable, type: 'bill' });
                }
                triggerToast(t('bill_requested_msg', { table: selectedTable.replace('Table', t('table')) }), 'success');
              }}
              className="flex flex-col items-center justify-center gap-1 text-[#b395ff] hover:text-[#c4b5fd] transition-colors active:scale-95 cursor-pointer bg-transparent border-none p-1 shrink-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="3" width="12" height="8" rx="1.5" />
                <path d="M4 14l2-3h12l2 3v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z" />
                <circle cx="9" cy="16.5" r="0.5" fill="currentColor"/>
                <circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>
                <circle cx="15" cy="16.5" r="0.5" fill="currentColor"/>
              </svg>
              <span className="text-[10px] font-bold tracking-wide mt-0.5 uppercase">{t('cashier')}</span>
            </button>
          )}
        </div>

        {orders.filter(o => o.table_number === selectedTable && ['Pending', 'Preparing', 'Served'].includes(o.status)).length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
            {t('no_orders_recorded', { table: selectedTable.replace('Table', t('table')) })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orders
              .filter(o => o.table_number === selectedTable && ['Pending', 'Preparing', 'Served'].includes(o.status))
              .map(order => (
                <div key={order.id} className="border border-slate-800/80 rounded-2xl p-4.5 bg-slate-900/40 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">{t('ticket')} #{order.id}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{t('placed')}: {new Date(order.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {['Preparing', 'Served'].includes(order.status) && order.prep_time_minutes ? (
                        <CountdownTimer order={order} />
                      ) : null}
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          order.status === 'Preparing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            order.status === 'Served' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-slate-800 text-slate-500 border border-slate-700/50'
                        }`}>
                        {t(order.status.toLowerCase(), order.status)}
                      </span>
                    </div>
                  </div>

                  {/* List items */}
                  <div className="text-xs text-slate-400 divide-y divide-slate-800/50 space-y-1.5">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between py-1.5 first:pt-0">
                        <span className="font-light text-slate-300">
                          {item.product?.name} <span className="text-slate-500 text-[10px] font-bold">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-slate-300">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-800/60 text-xs">
                    <span className="font-semibold text-slate-500">{t('grand_total')}</span>
                    <span className="font-black text-sm text-amber-400">${order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
