import { useTranslation } from 'react-i18next';
import { ChefHat, Globe, Utensils, Layers, QrCode, Plus, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, statsPending, fetchOrders, triggerToast }) {
  const { t, i18n } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.22)]" id="main-header">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center justify-center rounded-3xl bg-linear-to-tr from-amber-500 via-orange-400 to-rose-500 p-3 shadow-lg shadow-amber-500/20">
            <ChefHat className="h-5 w-5 text-slate-950" />
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300">BiteQR</p>
            <h1 className="text-lg font-black tracking-tight text-slate-100">Menu Digital</h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-slate-800/80 bg-slate-900/75 p-2 shadow-inner">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="language-switcher"
                value={i18n.language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  i18n.changeLanguage(newLang);
                  triggerToast(newLang === 'km' ? 'បានប្តូរភាសាទៅជាភាសាខ្មែរ' : 'Language switched to English', 'success');
                }}
                className="bg-transparent text-[11px] text-slate-200 font-extrabold focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-950 text-slate-200">EN</option>
                <option value="km" className="bg-slate-950 text-slate-200">KH</option>
              </select>
            </div>

            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/80 px-3 py-2 text-[11px] font-black text-slate-200 border border-slate-800 hover:bg-slate-900 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {t('refresh', 'Refresh')}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              id="btn-nav-customer"
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[10px] font-black tracking-[0.18em] uppercase transition-all ${
                activeTab === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Utensils className="w-4 h-4" />
              {t('customer_menu')}
            </button>
            <button
              id="btn-nav-kitchen"
              onClick={() => {
                setActiveTab('kitchen');
                fetchOrders();
              }}
              className={`relative flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[10px] font-black tracking-[0.18em] uppercase transition-all ${
                activeTab === 'kitchen'
                  ? 'bg-indigo-600 text-slate-100'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t('kitchen_deck')}
              {statsPending > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-black bg-rose-500 text-white rounded-full animate-pulse">
                  {statsPending}
                </span>
              )}
            </button>
            <button
              id="btn-nav-qr"
              onClick={() => setActiveTab('qr-generator')}
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[10px] font-black tracking-[0.18em] uppercase transition-all ${
                activeTab === 'qr-generator'
                  ? 'bg-emerald-600 text-slate-100'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              {t('qr_hub')}
            </button>
            <button
              id="btn-nav-add-product"
              onClick={() => setActiveTab('add-product')}
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[10px] font-black tracking-[0.18em] uppercase transition-all ${
                activeTab === 'add-product'
                  ? 'bg-teal-600 text-slate-100'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              {t('add_new_product')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
