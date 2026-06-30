import { useTranslation } from 'react-i18next';
import { ChefHat, Utensils, Layers, QrCode, Plus, RefreshCw, Settings } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, statsPending, fetchOrders }) {
  const { t } = useTranslation();

  return (
    <aside className="mx-auto mb-6 flex w-full max-w-full flex-row items-center justify-between gap-3 rounded-3xl border border-slate-800/90 bg-slate-950/95 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:mb-0 lg:h-[calc(100vh-2rem)] lg:w-24 lg:flex-col lg:justify-between lg:px-3 lg:py-4">
      <div className="flex items-center gap-3 lg:flex-col lg:gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-white/10 lg:h-16 lg:w-16">
          <ChefHat className="h-6 w-6" />
        </div>

        <div className="hidden lg:block text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-300">BiteQR</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.24em] text-white">Menu</p>
        </div>
      </div>

      <nav aria-label="Main sidebar navigation" className="flex flex-1 items-center justify-between gap-2 lg:flex-col lg:justify-center">
        {[
          {
            id: 'customer',
            icon: <Utensils className="h-5 w-5" />,
            label: t('customer_menu'),
          },
          {
            id: 'kitchen',
            icon: <Layers className="h-5 w-5" />,
            label: t('kitchen_deck'),
            badge: statsPending,
          },
          {
            id: 'qr-generator',
            icon: <QrCode className="h-5 w-5" />,
            label: t('qr_hub'),
          },
          {
            id: 'add-product',
            icon: <Plus className="h-5 w-5" />,
            label: t('add_new_product'),
          },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              title={item.label}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'kitchen') fetchOrders();
              }}
              className={`relative inline-flex h-12 w-12 items-center justify-center rounded-3xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 lg:h-14 lg:w-14 ${
                isActive
                  ? 'border-transparent bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800/95 hover:text-slate-100'
              }`}
            >
              {item.icon}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.1rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[9px] font-black text-white shadow-lg shadow-rose-500/20">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center justify-end gap-3 lg:flex-col lg:justify-end">
        <button
          type="button"
          onClick={fetchOrders}
          title={t('refresh', 'Refresh')}
          className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-slate-300 transition-colors duration-200 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 lg:h-14 lg:w-14"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        <button
          type="button"
          title={t('settings', 'Settings')}
          className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-800 bg-violet-600 text-white shadow-lg shadow-violet-500/20 transition-all duration-200 lg:h-14 lg:w-14"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
