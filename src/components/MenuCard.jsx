import { useTranslation } from 'react-i18next';
import { Plus, Minus, Coffee, Utensils } from 'lucide-react';

export default function MenuCard({ product, cartQty, addToCart, removeFromCart }) {
  const { t } = useTranslation();

  const getDisplayCategory = (category) => {
    if (!category) return '';
    return String(category).trim().toLowerCase() === 'drink' ? 'Drinks' : category;
  };

  return (
    <div 
      id={`menu-card-${product.id}`}
      className="bg-slate-900/60 rounded-3xl border border-slate-800/80 hover:border-slate-700/80 shadow-md hover:shadow-xl hover:bg-slate-900/80 transition-all duration-300 overflow-hidden flex flex-col group w-full min-w-0"
    >
      {/* Product Image */}
      <div className="aspect-video w-full overflow-hidden relative bg-slate-950 border-b border-slate-800/50" id={`menu-image-container-${product.id}`}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2.5 bg-slate-900/80">
            {product.category.toLowerCase().includes('drink') ? (
              <Coffee className="w-10 h-10 text-slate-800 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <Utensils className="w-10 h-10 text-slate-800 group-hover:scale-110 transition-transform duration-300" />
            )}
            <span className="text-[9px] font-bold text-slate-700 tracking-widest uppercase">{t('delicious_choice', 'Delicious choice')}</span>
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/90 text-amber-400 border border-slate-800/80 text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
          {getDisplayCategory(product.category)}
        </span>
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0" id={`menu-details-${product.id}`}>
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-slate-100 text-sm sm:text-base leading-snug group-hover:text-amber-400 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
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
