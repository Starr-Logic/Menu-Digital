import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Menu, X, LogOut, LogIn, HelpCircle, Lock, Zap, Users, QrCode, Package, Moon, Sun, Globe, ClipboardList, BarChart3, Settings, Mail, Maximize, Minimize } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export default function Navbar() {
  const { fetchOrders, isAdminLoggedIn, adminUser, handleAdminLogout } = useAppContext();
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('themeMode') !== 'light';
  });

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', theme);
    }
  }, [isDarkMode]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const openHelp = () => {
    window.location.href = 'mailto:contact@biteqr.com';
  };

  const openContact = () => {
    window.location.href = 'tel:+85523123456';
  };

  const handleTabClick = (path) => {
    navigate(path);
    setDropdownOpen(false);
    if (path === '/admin') {
      fetchOrders();
    }
  };

  const isCustomerScan = typeof window !== 'undefined' && window.location.search.includes('table=');

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 shadow-xl" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 h-16">

          {/* Logo and Branding (Hidden Admin Login Trigger) */}
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer"
            id="brand-container"
            onClick={() => handleTabClick('/')}
          >
            <div className="p-2 bg-linear-to-tr from-amber-500 to-orange-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/10 hover:scale-105 transition-transform">
              <ChefHat className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-100">BiteQR</h1>
              <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest leading-none mt-0.5">Menu Digital</p>
            </div>
          </div>

          {/* DESKTOP - Show items in one row */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            {!isAdminLoggedIn ? (
              // CUSTOMER MENU - DESKTOP
              <>
                <button
                  onClick={() => openHelp()}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  {t('help')}
                </button>
                <button
                  onClick={() => openContact()}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {t('contact')}
                </button>
                <button
                  onClick={() => i18n.changeLanguage(i18n.language === 'km' ? 'en' : 'km')}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {i18n.language === 'km' ? 'English' : 'ខ្មែរ'}
                </button>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {!isCustomerScan && (
                  <button
                    onClick={() => handleTabClick('/admin')}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors border-l border-slate-700 pl-4 ml-2"
                  >
                    <Lock className="w-4 h-4" />
                    {t('admin_login')}
                  </button>
                )}
              </>
            ) : (
              // ADMIN MENU - DESKTOP
              <>
                <button
                  onClick={() => handleTabClick('/admin')}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  {t('orders')}
                </button>

                <button
                  onClick={() => handleTabClick('/admin/qr')}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  {t('qr_code')}
                </button>
                <button
                  onClick={() => handleTabClick('/admin/products')}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  {t('products')}
                </button>
                <button
                  onClick={() => handleTabClick('/admin/analytics')}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {t('analytics')}
                </button>
                <button
                  onClick={() => i18n.changeLanguage(i18n.language === 'km' ? 'en' : 'km')}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {i18n.language === 'km' ? 'English' : 'ខ្មែរ'}
                </button>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleTabClick('/admin/settings')}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t('settings')}
                </button>
                <button
                  onClick={() => {
                    handleAdminLogout();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors ml-2 border-l border-slate-700 pl-4"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </>
            )}
          </div>

          {/* MOBILE - Show menu icon */}
          <div className="relative md:hidden">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-3 text-slate-200 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
              title="Menu"
            >
              {dropdownOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>

            {/* Dropdown Menu - Mobile */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden z-50">
                {!isAdminLoggedIn ? (
                  // CUSTOMER MENU - MOBILE
                  <>
                    <button
                      onClick={() => {
                        setIsDarkMode(!isDarkMode);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {isDarkMode ? t('light_mode') : t('night_mode')}
                    </button>


                    <button
                      onClick={() => {
                        openHelp();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <HelpCircle className="w-4 h-4" />
                      {t('help_support')}
                    </button>
                    <button
                      onClick={() => {
                        openContact();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <Mail className="w-4 h-4" />
                      {t('contact')}
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage(i18n.language === 'km' ? 'en' : 'km');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <Globe className="w-4 h-4" />
                      {i18n.language === 'km' ? 'English' : 'ខ្មែរ'}
                    </button>

                    {!isCustomerScan && (
                      <button
                        onClick={() => handleTabClick('/admin')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                      >
                        <Lock className="w-4 h-4" />
                        {t('admin_login')}
                      </button>
                    )}
                  </>
                ) : (
                  // ADMIN MENU - MOBILE
                  <>
                    <button
                      onClick={() => {
                        handleTabClick('/admin');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      {t('orders')}
                    </button>

                    <button
                      onClick={() => {
                        handleTabClick('/admin/qr');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <QrCode className="w-4 h-4" />
                      {t('qr_code')}
                    </button>
                    <button
                      onClick={() => {
                        handleTabClick('/admin/products');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <Package className="w-4 h-4" />
                      {t('products')}
                    </button>
                    <button
                      onClick={() => {
                        handleTabClick('/admin/analytics');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <BarChart3 className="w-4 h-4" />
                      {t('analytics')}
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage(i18n.language === 'km' ? 'en' : 'km');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <Globe className="w-4 h-4" />
                      {i18n.language === 'km' ? 'English' : 'ខ្មែរ'}
                    </button>
                    <button
                      onClick={() => {
                        setIsDarkMode(!isDarkMode);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {isDarkMode ? t('light_mode') : t('night_mode')}
                    </button>
                    <button
                      onClick={() => {
                        toggleFullscreen();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      {isFullscreen ? t('exit_fullscreen') : t('fullscreen')}
                    </button>
                    <button
                      onClick={() => {
                        handleTabClick('/admin/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors border-t border-slate-700"
                    >
                      <Settings className="w-4 h-4" />
                      {t('settings')}
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors border-t border-slate-700"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
