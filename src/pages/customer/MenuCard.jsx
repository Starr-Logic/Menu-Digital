import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, Coffee, Utensils, Info, Globe } from 'lucide-react';

export default function MenuCard({ product, cartQty, addToCart, removeFromCart, onViewDetails }) {
  const { t, i18n } = useTranslation();

  const getDisplayCategory = (category) => {
    if (!category) return '';
    return String(category).trim().toLowerCase() === 'drink' ? 'Drinks' : category;
  };

  const [hasImageError, setHasImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setHasImageError(false);
    setShowDetails(false);
  }, [product.image]);

  const handleViewDetails = (event) => {
    event?.stopPropagation();
    if (typeof onViewDetails === 'function') return onViewDetails();
    setShowDetails((prev) => !prev);
  };

  const handleToggleLanguage = (event) => {
    event.stopPropagation();
    i18n.changeLanguage(i18n.language === 'km' ? 'en' : 'km');
  };

  return (
    <div 
      id={`menu-card-${product.id}`}
      className="bg-slate-900/60 rounded-3xl border border-slate-800/80 hover:border-slate-700/80 shadow-md hover:shadow-xl hover:bg-slate-900/80 transition-all duration-300 overflow-hidden flex flex-col group w-full min-w-0"
    >
      {/* Product Image */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleViewDetails}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleViewDetails(event);
          }
        }}
        className="menu-card-image-link group relative aspect-video w-full overflow-hidden bg-slate-950 border-b border-slate-800/50 cursor-pointer"
        id={`menu-image-container-${product.id}`}
        aria-label={t('view_details', 'View details')}
      >
        {product.image && !hasImageError ? (
          <img 
            src={product.image} 
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setHasImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3 bg-slate-900/80">
            {product.category?.toLowerCase().includes('drink') ? (
              <Coffee className="w-12 h-12 text-amber-300" />
            ) : (
              <Utensils className="w-12 h-12 text-emerald-300" />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">
              {t('tap_for_details', 'Tap for details')}
            </span>
          </div>
        )}
        <span className="absolute top-3 left-3 px-3 py-1 bg-slate-950/95 text-amber-300 border border-slate-800/80 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
          {getDisplayCategory(product.category)}
        </span>
        <button
          type="button"
          onClick={handleToggleLanguage}
          className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-slate-950/95 p-2 text-amber-300 border border-slate-800/80 shadow-sm transition duration-200 ease-out hover:bg-slate-900 hover:text-amber-200"
          aria-label={t('change_language', 'Change language')}
          tabIndex={0}
        >
          <Globe className="w-4 h-4" />
        </button>
        <span
          onClick={handleViewDetails}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleViewDetails(event);
            }
          }}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-slate-950/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-100 border border-slate-800/80 shadow-sm transition duration-200 ease-out opacity-90 hover:opacity-100 hover:border-amber-400 hover:text-amber-300 cursor-pointer menu-card-detail-link"
          aria-label={t('view_details', 'View details')}
        >
          <Info className="w-3 h-3 text-amber-400" />
          {t('view_details', 'View details')}
        </span>
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0" id={`menu-details-${product.id}`}>
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-slate-100 text-sm sm:text-base leading-snug group-hover:text-amber-400 transition-colors">
            {product.name}
          </h4>
          <p className={`text-xs leading-relaxed font-light text-slate-500 ${showDetails ? '' : 'line-clamp-2'}`}>
            {product.description}
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof onViewDetails === 'function') return onViewDetails();
              setShowDetails(prev => !prev);
            }}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-amber-400 hover:text-amber-300 transition-colors"
            id={`btn-view-details-${product.id}`}
          >
            <Info className="w-3.5 h-3.5" />
            {showDetails ? t('hide_details') : t('view_details')}
          </button>
        </div>

        {/* Pricing and Action control */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800/60">
          <div className="text-base sm:text-lg font-black text-slate-100">
            ${product.price.toFixed(2)}
          </div>

          {cartQty > 0 ? (
            <div className="flex items-center gap-1 bg-amber-500/10 p-1 rounded-xl border border-amber-500/20" id={`cart-qty-ctrl-${product.id}`}>
              <button 
                id={`btn-remove-${product.id}`}
                onClick={() => removeFromCart(product.id)}
                className="p-1.5 hover:bg-slate-900 text-amber-400 hover:text-amber-300 rounded-lg transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-black text-amber-300">{cartQty}</span>
              <button 
                id={`btn-add-more-${product.id}`}
                onClick={() => addToCart(product.id)}
                className="p-1.5 hover:bg-slate-900 text-amber-400 hover:text-amber-300 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              id={`btn-add-to-cart-${product.id}`}
              onClick={() => addToCart(product.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('add_to_cart')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
