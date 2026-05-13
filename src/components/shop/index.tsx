'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart, useAuth, useLang } from '@/store';
import { useT } from '@/lib/i18n';
import { openAuth } from '@/components/layout/Header';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

// ── ProductCard ───────────────────────────────────────────────────────────────
export function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useCart();
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT(lang);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const inCart = items.some(i => i.productId === product.id);
  const name = product.nameKa || product.nameEn
    ? (lang==='en' ? (product.nameEn||product.nameKa) : lang==='ru' ? (product.nameRu||product.nameKa) : product.nameKa)
    : (product as any).name || '';

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { openAuth(); return; }
    if (inCart || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      toast.success(lang==='en'?'Added to cart!':lang==='ru'?'Добавлено в корзину!':'კალათაში დაემატა!');
      setTimeout(() => setAdded(false), 2000);
    } catch(e: any) {
      toast.error(e.response?.data?.error || (lang==='en'?'Error':lang==='ru'?'Ошибка':'შეცდომა'));
    } finally { setAdding(false); }
  };

  const discountPct = product.priceOld ? Math.round((1-product.price/product.priceOld)*100) : product.discount;

  return (
    <Link href={`/products/${product.id}`}
      className="group card hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative bg-gray-bg aspect-square overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-3">🔧</div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`badge-${product.badge}`}>{product.badge}</span>
          )}
          {discountPct && discountPct > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              -{discountPct}%
            </span>
          )}
        </div>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-text3">
              {lang==='en'?'Out of Stock':lang==='ru'?'Нет в наличии':'ამოიწურა'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <div className="text-xs text-text3 mb-1">{product.brand}</div>
        <div className="text-sm font-medium text-dark leading-snug mb-2 flex-1 line-clamp-2">{name}</div>
        <div className="text-xs text-text3 mb-2">SKU: {product.sku}</div>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-dark">{product.price} ₾</div>
            {product.priceOld && (
              <div className="text-xs text-text3 line-through">{product.priceOld} ₾</div>
            )}
          </div>
          <div className={`text-xs font-medium px-2 py-0.5 rounded-full
            ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {product.stock > 0 ? (lang==='en'?'In Stock':lang==='ru'?'В наличии':'მარაგშია') : (lang==='en'?'Out of Stock':lang==='ru'?'Нет в наличии':'არ არის')}
          </div>
        </div>

        {/* Add Button */}
        <button onClick={handleAdd}
          disabled={product.stock <= 0 || adding}
          className={`w-full py-2 rounded-xl text-sm font-semibold transition-all
            ${inCart || added
              ? 'bg-green-500 text-white'
              : product.stock <= 0
              ? 'bg-gray-1 text-text3 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-hover text-white active:scale-95'}`}>
          {adding ? '⏳' : inCart || added ? `✓ ${t.inCart}` : `🛒 ${t.addToCart}`}
        </button>
      </div>
    </Link>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────────
export interface Filters {
  q: string; category: string; brand: string;
  minPrice: string; maxPrice: string;
  inStock: boolean; onSale: boolean; badge: string;
  sort: string;
}

const SORT_OPTIONS = (t: any) => [
  { value:'createdAt_desc', label:t.newest },
  { value:'price_asc', label:t.priceLow },
  { value:'price_desc', label:t.priceHigh },
];

export function FilterBar({
  filters, onChange, brands, categories, onClear
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  brands: string[];
  categories: any[];
  onClear: () => void;
}) {
  const { lang } = useLang();
  const t = useT(lang);
  const [showMobile, setShowMobile] = useState(false);

  const getCatName = (c: any) => {
    if (c.nameKa || c.nameEn) return lang==='en'?(c.nameEn||c.nameKa):lang==='ru'?(c.nameRu||c.nameKa):c.nameKa;
    return c.name || c.slug || '';
  };

  const hasFilters = filters.q || filters.category || filters.brand || filters.minPrice ||
    filters.maxPrice || filters.inStock || filters.onSale || filters.badge;

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-text3 uppercase tracking-wide mb-2">{t.category}</div>
          <div className="space-y-1">
            <button onClick={()=>onChange({category:''})}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors
                ${!filters.category?'bg-primary text-white font-medium':'text-text2 hover:bg-gray-bg'}`}>
              {t.allCategories}
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={()=>onChange({category:c.id})}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2
                  ${filters.category===c.id?'bg-primary text-white font-medium':'text-text2 hover:bg-gray-bg'}`}>
                <span className="w-6 h-6 shrink-0">
                  <CategoryIcon slug={c.slug} className="w-6 h-6" color={filters.category===c.id?'text-white':'text-primary'}/>
                </span>
                <span className="flex-1 leading-tight">{getCatName(c)}</span>
                {c.productCount!==undefined && <span className="text-xs opacity-60 shrink-0">({c.productCount})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      <div>
        <div className="text-xs font-semibold text-text3 uppercase tracking-wide mb-2">{t.brand}</div>
        <select className="input-field text-sm" value={filters.brand} onChange={e=>onChange({brand:e.target.value})}>
          <option value="">{t.allBrands}</option>
          {brands.map(b=><option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Price */}
      <div>
        <div className="text-xs font-semibold text-text3 uppercase tracking-wide mb-2">{t.price} (₾)</div>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="input-field text-sm" min="0"
            value={filters.minPrice} onChange={e=>onChange({minPrice:e.target.value})} />
          <input type="number" placeholder="Max" className="input-field text-sm" min="0"
            value={filters.maxPrice} onChange={e=>onChange({maxPrice:e.target.value})} />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-primary"
            checked={filters.inStock} onChange={e=>onChange({inStock:e.target.checked})} />
          <span className="text-sm text-text2">{t.inStock}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-primary"
            checked={filters.onSale} onChange={e=>onChange({onSale:e.target.checked})} />
          <span className="text-sm text-text2">{t.onSale}</span>
        </label>
      </div>

      {hasFilters && (
        <button onClick={onClear}
          className="w-full py-2 text-sm border border-red-300 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
          ✕ {t.clearFilters}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="card p-4 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-dark">{t.filters}</span>
            <select className="text-xs border border-gray-2 rounded-lg px-2 py-1 text-text2"
              value={filters.sort} onChange={e=>onChange({sort:e.target.value})}>
              {SORT_OPTIONS(t).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter bar */}
      <div className="lg:hidden flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={()=>setShowMobile(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap shrink-0
            ${hasFilters?'border-primary bg-primary/5 text-primary':'border-gray-2 text-text2'}`}>
          ⚙️ {t.filters}
          {hasFilters && <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">!</span>}
        </button>

        <select className="border border-gray-2 rounded-xl px-3 py-2 text-sm text-text2 shrink-0"
          value={filters.sort} onChange={e=>onChange({sort:e.target.value})}>
          {SORT_OPTIONS(t).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Quick filter chips */}
        {[
          { key:'inStock', label:t.inStock, value:true },
          { key:'onSale', label:t.onSale, value:true },
        ].map(chip=>(
          <button key={chip.key}
            onClick={()=>onChange({[chip.key]: !(filters as any)[chip.key]})}
            className={`px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap shrink-0 transition-colors
              ${(filters as any)[chip.key]?'border-primary bg-primary text-white':'border-gray-2 text-text2'}`}>
            {chip.label}
          </button>
        ))}
      </div>

      {/* Mobile filter drawer */}
      {showMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-black/50" onClick={()=>setShowMobile(false)}/>
          <div className="w-72 bg-white h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-dark">{t.filters}</span>
              <button onClick={()=>setShowMobile(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1">✕</button>
            </div>
            <FilterContent />
            <button onClick={()=>setShowMobile(false)} className="btn-primary w-full mt-6">
              {lang==='en'?'Apply':lang==='ru'?'Применить':'გამოყენება'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
