import { useTranslation } from 'react-i18next';
import { ChefHat, Globe, Utensils, Layers, QrCode, Plus, LogOut, LogIn } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, statsPending, fetchOrders, triggerToast, isAdminLoggedIn, adminUser, onLogout }) {
  const { t, i18n } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 shadow-xl" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 md:py-0 md:h-16 gap-4 md:gap-0 min-w-0">
          
          {/* Logo and Branding */}
          <div className="flex items-center gap-3 min-w-0" id="brand-container">
            <div className="p-2 bg-linear-to-tr from-amber-500 to-orange-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/10">
              <ChefHat className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-100">BiteQR</h1>
              <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest leading-none mt-0.5">Menu Digital</p>
            </div>
          </div>

          {/* Controls Side */}
          <div className="flex flex-wrap items-center justify-end gap-3 flex-1 min-w-0" id="controls-container">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-1.5 shadow-inner min-w-0" id="nav-toolbar">
              {/* Language Switcher Selector */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-2.5 py-2" id="lang-switcher-wrapper">
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

              {/* Mode Switcher */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 overflow-x-auto whitespace-nowrap" id="nav-tabs-wrapper">
                <button 
                  id="btn-nav-customer"
                  onClick={() => setActiveTab('customer')}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${
                    activeTab === 'customer' 
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15' 
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  {t('customer_menu')}
                </button>

                {!isAdminLoggedIn && (
                  <button
                    id="btn-admin-login"
                    onClick={() => setActiveTab('kitchen')}
                    className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition-all hover:border-amber-500/30 hover:text-amber-400 shrink-0"
                    title={t('admin_login')}
                  >
                    <LogIn className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {isAdminLoggedIn && (
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  id="btn-nav-kitchen"
                  onClick={() => {
                    setActiveTab('kitchen');
                    fetchOrders();
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all relative ${
                    activeTab === 'kitchen' 
                      ? 'bg-indigo-600 text-slate-100' 
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {t('kitchen_deck')}
                  {statsPending > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-black bg-rose-500 text-white rounded-full animate-bounce">
                      {statsPending}
                    </span>
                  )}
                </button>
                
                <button 
                  id="btn-nav-qr"
                  onClick={() => setActiveTab('qr-generator')}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all relative ${
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
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all relative ${
                    activeTab === 'add-product' 
                      ? 'bg-teal-600 text-slate-100' 
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t('add_new_product')}
                </button>
              </div>
            )}

            {/* Admin User Info & Logout */}
            {isAdminLoggedIn && adminUser && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-200">{adminUser.username}</p>
                  <p className="text-[10px] text-slate-500">Admin</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
