import { useTranslation } from 'react-i18next';
import { Utensils, ListOrdered } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

export default function BottomNav() {
  const { fetchOrders } = useAppContext();
  const { t } = useTranslation();
  const location = useLocation();

  if (!['/', '/orders'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800/50 z-50 px-4 py-2 flex justify-center gap-12 items-center pb-safe">
      {/* Home Tab (Customer Menu) */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 p-2 w-20 ${
          location.pathname === '/' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-400'
        }`}
      >
        <Utensils className="w-6 h-6" strokeWidth={2.5} />
        <span className="text-[10px] font-bold tracking-wide mt-0.5">{t('nav_home')}</span>
      </Link>

      {/* Orders Tab (Customer Live Tracker) */}
      <Link
        to="/orders"
        onClick={() => fetchOrders()}
        className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 p-2 w-20 ${
          location.pathname === '/orders' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-400'
        }`}
      >
        <ListOrdered className="w-6 h-6" strokeWidth={2.5} />
        <span className="text-[10px] font-bold tracking-wide mt-0.5">{t('nav_orders')}</span>
      </Link>
    </div>
  );
}
