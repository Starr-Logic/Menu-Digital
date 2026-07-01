import { useTranslation } from 'react-i18next';
import { Sparkles, QrCode } from 'lucide-react';
import MenuCard from './MenuCard';
import CartModal from './CartModal';
import { useAppContext } from '../../contexts/AppContext';

export default function CustomerMenu({ openProductModal }) {
  const { t } = useTranslation();
  
  const {
    isAdminLoggedIn,
    selectedTable,
    setSelectedTable,
    triggerToast,
    categories,
    activeCategory,
    setActiveCategory,
    getGroupedProducts,
    productsLoading,
    cart,
    products,
    addToCart,
    removeFromCart,
    settings
  } = useAppContext();

  const groupedProducts = getGroupedProducts();

  return (
    <div className="space-y-8">
      {isAdminLoggedIn ? (
        <div className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_35%)]" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 min-w-0">
            <div className="max-w-2xl min-w-0 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                {t('interactive_table_ordering')}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 shadow-inner">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('active_session')}</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {selectedTable.replace('Table', t('table'))}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('table_qr_links')}</p>
                  <p className="mt-1 text-sm font-medium text-slate-300">{t('generate_qr_desc')}</p>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-relaxed text-slate-400">
                {t('browse_menu_desc')}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{t('simulate_scanning')}</span>
                <div className="flex flex-wrap gap-2">
                  {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6'].map(tbl => (
                    <button
                      key={tbl}
                      onClick={() => {
                        setSelectedTable(tbl);
                        triggerToast(t('switched_session', { table: tbl.replace('Table', t('table')) }), 'success');
                      }}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-all ${
                        selectedTable === tbl
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15'
                          : 'bg-slate-800/90 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {tbl.replace('Table', t('table'))}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-4 py-3 shadow-inner self-start xl:self-auto">
              <div className="flex h-12 min-w-45 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
                <QrCode className="h-8 w-8 text-slate-950" />
              </div>
              <div className="min-w-45">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{t('quick_access', 'Quick access')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{t('quick_access_desc', 'Open the menu and place your order in seconds.')}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left columns (Products list - Category filter + categorized grids) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Horizontal Category Selector */}
          <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none sticky top-16 z-20 bg-slate-950 py-2.5 min-w-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                  activeCategory === cat
                    ? 'bg-slate-100 text-slate-950 border-slate-100'
                    : 'bg-slate-900 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {cat === 'All' ? t('all') : cat}
              </button>
            ))}
          </div>

          {/* Grouped section category loops */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-slate-900/50 rounded-3xl p-4 border border-slate-800 space-y-4 animate-pulse">
                  <div className="aspect-video w-full bg-slate-800 rounded-2xl" />
                  <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-800 rounded-md w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 bg-slate-800 rounded-md w-1/4" />
                    <div className="h-8 bg-slate-800 rounded-lg w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center bg-slate-900/40 rounded-3xl p-16 border border-slate-900">
              <p className="text-slate-500 text-sm">{t('no_items_found', 'No culinary items found in this section.')}</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedProducts).map(([catName, items]) => (
                <div key={catName} className="space-y-5">
                  {/* Section Category Title */}
                  <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20" />
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-100 uppercase">{catName}</h3>
                    <span className="text-[10px] bg-slate-900 text-slate-500 px-2.5 py-0.5 rounded-full font-bold border border-slate-800">
                      {items.length} {t('options')}
                    </span>
                  </div>

                  {/* Category specific products grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {items.map(product => (
                      <MenuCard
                        key={product.id}
                        product={product}
                        cartQty={cart[product.id] || 0}
                        addToCart={addToCart}
                        removeFromCart={removeFromCart}
                        onViewDetails={() => openProductModal(product)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column sidebar (Desktop Cart - visible only on large screen size) */}
        <div className="hidden lg:block bg-slate-900/80 rounded-3xl border border-slate-850 p-6 space-y-6 sticky top-24 shadow-xl">
          <CartModal isSidebar={true} />
        </div>
      </div>
    </div>
  );
}
