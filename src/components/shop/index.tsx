'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useCart, useAuth, useLang } from '@/store';
import { useT } from '@/lib/i18n';
import { openAuth } from '@/components/layout/Header';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

// ── ProductCard ─────────────────────────────────────────────────────────────
export function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useCart();
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT(lang);
  const [adding, setAdding] = useState(false);

  const inCart = items.some(i => i.productId === product.id);

  const rawName = lang==='en' ? (product.nameEn||product.nameKa)
    : lang==='ru' ? (product.nameRu||product.nameKa)
    : product.nameKa || (product as any).name || '';
  const name = rawName.replace(/\s*\|[^|]*\|\s*/g, ' ').replace(/\s*\|.*$/, '').trim();

  const price    = Number(product.price);
  const oldPrice = product.priceOld ? Number(product.priceOld) : null;
  const discount = oldPrice && oldPrice > price ? Math.round((1-price/oldPrice)*100) : (product.discount||0);
  const isB2B    = user?.b2bStatus === 'APPROVED';
  const isLow    = product.stock > 0 && product.stock <= 3;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { openAuth(); return; }
    if (inCart || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, 1);
      toast.success(lang==='en'?'Added!':lang==='ru'?'Добавлено!':'კალათაში!');
    } catch(err: any) {
      toast.error(err.response?.data?.error || 'შეცდომა');
    } finally { setAdding(false); }
  };

  return (
    <Link href={`/products/${product.id}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      {/* IMAGE */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={name} width={300} height={300}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <span className="text-4xl">🔧</span>
            {product.brand && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{product.brand}</span>}
          </div>
        )}

        {/* BADGES top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">-{discount}%</span>
          )}
          {product.badge && product.badge !== 'SALE' && (
            <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{product.badge}</span>
          )}
        </div>

        {/* Stock dot top-right */}
        <div className="absolute top-2 right-2">
          <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {lang==='en'?'Out of Stock':lang==='ru'?'Нет в наличии':'ამოიწურა'}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col flex-1 gap-1">

        {/* Brand */}
        {product.brand && product.brand.toLowerCase() !== 'generic' && (
          <div className="h-5 flex items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{product.brand}</span>
          </div>
        )}


        {/* Name */}
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1 min-h-[40px]">{name}</p>

        {/* SKU / OEM codes */}
        {(product.sku || (product.oemCodes && product.oemCodes.length > 0)) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.sku && <span className="text-[11px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">{product.sku}</span>}
            {product.oemCodes && product.oemCodes.filter((c:string)=>c.length>=4&&c.length<=15&&!c.startsWith('SKU')&&!c.includes(':')).slice(0,2).map((c:string)=>(
              <span key={c} className="text-[11px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">{c}</span>
            ))}
          </div>
        )}

        {/* Price + Stock */}
        <div className="flex items-end justify-between mt-1">
          <div>
            {isB2B && product.b2bPrice ? (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-blue-600">{product.b2bPrice} ₾</span>
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">B2B</span>
                </div>
                <span className="text-xs text-gray-400 line-through">{price} ₾</span>
              </div>
            ) : (product as any).source === 'autodoc' || product.price === null ? (
              <div>
                <span className="text-sm font-bold text-orange-500">ფასი გასარკვევია</span>
              </div>
            ) : (
              <div>
                <span className="text-xl font-extrabold text-gray-900">{price} ₾</span>
                {oldPrice && oldPrice > price && (
                  <div className="text-xs text-gray-400 line-through">{oldPrice} ₾</div>
                )}
              </div>
            )}
          </div>

          <div className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
            product.stock <= 0 ? 'bg-red-50 text-red-600'
            : isLow ? 'bg-amber-50 text-amber-700'
            : 'bg-green-50 text-green-700'
          }`}>
            {product.stock <= 0
              ? (lang==='en'?'Out':lang==='ru'?'Нет':'არ არის')
              : ''}
          </div>
        </div>

        {/* CTA */}
        {(product as any).source === 'autodoc' || product.price === null ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(`https://wa.me/995577575052?text=${encodeURIComponent('გამარჯობა! ' + (product.nameKa||product.nameEn||'') + ' (' + (product.sku||'') + ') - ფასი მაინტერესებს')}`, '_blank', 'noopener,noreferrer');
            }}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all mt-1 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-1">
            📱 შეკვეთა
          </button>
        ) : (
          <button onClick={handleAdd}
            disabled={product.stock <= 0 || adding}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] mt-1
              ${inCart ? 'bg-green-500 text-white'
                : product.stock <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark text-white'}`}>
            {adding ? '...' : inCart
              ? `✓ ${t.inCart||'კალათაში'}`
              : `🛒 ${t.addToCart||'კალათაში'}`}
          </button>
        )}
      </div>
    </Link>
  );
}


// ── AutodocCatFilter ──────────────────────────────────────────────────────────
interface ANode { id:number; nameKa:string; nameEn:string; slug:string; level:number; imageUrl:string|null; children:ANode[]; }
function ANodeItem({node,selected,onSelect,depth=0}:{node:ANode;selected:string;onSelect:(s:string)=>void;depth?:number;}) {
  const [open,setOpen]=useState(false);
  const has=node.children.length>0;
  const sel=selected===node.slug;
  const handleClick=()=>{ if(has){ setOpen(o=>!o); } else { onSelect(sel?'':node.slug); } };
  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 rounded-lg cursor-pointer transition-colors ${sel?'bg-primary text-white':'hover:bg-gray-bg text-text2'}`}
        style={{paddingLeft:depth*14+10,paddingRight:10}}
        onClick={handleClick}>
        <span className="w-3.5 h-3.5 flex-shrink-0 opacity-40">
          {has?(open
            ?<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6l5 5 5-5"/></svg>
            :<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3l5 5-5 5"/></svg>
          ):null}
        </span>
        {depth===0&&node.imageUrl&&(
          <img src={node.imageUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0"/>
        )}
        <span className={`truncate leading-snug ${depth===0?'text-sm font-semibold':'text-xs font-medium'}`}>
          {node.nameKa}
        </span>
      </div>
      {has&&open&&(
        <div className="border-l-2 border-gray-100 ml-5">
          {node.children.map(c=><ANodeItem key={c.id} node={c} selected={selected} onSelect={onSelect} depth={depth+1}/>)}
        </div>
      )}
    </div>
  );
}
function AutodocCatFilter({selected,onSelect}:{selected:string;onSelect:(s:string)=>void;}) {
  const [tree,setTree]=useState<ANode[]>([]);
  const { lang } = useLang();
  const t = useT(lang);
  useEffect(()=>{
    fetch('/api/categories').then(r=>r.json()).then(d=>{
      if(d.success) {
        const cats = (d.data||[]).map((c:any)=>({
          ...c,
          children: (c.subcategories||c.children||[]).map((s:any)=>({...s, children:[]}))
        }));
        setTree(cats);
      }
    }).catch(()=>{});
  },[]);
  return (
    <div>
      <div className="space-y-0.5 pr-1">
        <div
          className={`text-[15px] py-2.5 px-3 rounded-xl cursor-pointer font-semibold transition-all mb-1 ${!selected?'bg-primary text-white shadow-sm':'hover:bg-blue-50 text-gray-700'}`}
          onClick={()=>onSelect('')}
        >{t.allCategories}</div>
        {tree.map(node=><ANodeItem key={node.id} node={node} selected={selected} onSelect={onSelect} depth={0}/>)}
      </div>
    </div>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────────
export interface Filters {
  page?: number | string;
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
    <div className="space-y-5">
      <AutodocCatFilter selected={filters.category||''} onSelect={s=>onChange({category:s})}/>

      {/* Price Range */}
      <div>
        <p className="text-sm font-bold text-dark mb-2">💰 ფასი (₾)</p>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="მინ" value={filters.minPrice}
            onChange={e=>onChange({minPrice:e.target.value})}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"/>
          <span className="text-gray-400">—</span>
          <input type="number" placeholder="მაქს" value={filters.maxPrice}
            onChange={e=>onChange({maxPrice:e.target.value})}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"/>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {[['0','50'],['50','100'],['100','200'],['200','500']].map(([mn,mx])=>(
            <button key={mn+mx} onClick={()=>onChange({minPrice:mn,maxPrice:mx})}
              className={`px-2 py-1 text-xs rounded-lg border transition-colors ${filters.minPrice===mn&&filters.maxPrice===mx?'border-blue-500 bg-blue-50 text-blue-600':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
              {mn}–{mx}₾
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div>
          <p className="text-sm font-bold text-dark mb-2">🏷️ ბრენდი</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {brands.slice(0,20).map(b=>(
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="brand" value={b}
                  checked={filters.brand===b}
                  onChange={()=>onChange({brand:b})}
                  className="w-3.5 h-3.5 accent-blue-600"/>
                <span className="text-sm text-gray-700">{b}</span>
              </label>
            ))}
            {filters.brand && (
              <button onClick={()=>onChange({brand:''})} className="text-xs text-blue-600 mt-1">გასუფთავება ✕</button>
            )}
          </div>
        </div>
      )}

      {/* Stock & Sale */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.inStock}
            onChange={e=>onChange({inStock:e.target.checked})}
            className="w-4 h-4 accent-blue-600"/>
          <span className="text-sm text-gray-700">✅ მარაგშია</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.onSale}
            onChange={e=>onChange({onSale:e.target.checked})}
            className="w-4 h-4 accent-blue-600"/>
          <span className="text-sm text-gray-700">🔥 ფასდაკლება</span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <p className="text-sm font-bold text-dark mb-2">↕️ დალაგება</p>
        <select value={filters.sort} onChange={e=>onChange({sort:e.target.value})}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {SORT_OPTIONS(t).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Clear All */}
      {hasFilters && (
        <button onClick={onClear}
          className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50">
          🗑️ ყველა ფილტრის გასუფთავება
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="card p-4 sticky top-0 overflow-y-auto" style={{maxHeight:"100vh"}}>
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

        <select aria-label="დალაგება" className="border border-gray-2 rounded-xl px-3 py-2 text-sm text-text2 shrink-0"
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
          <div className="bg-black/50 absolute inset-0" onClick={()=>setShowMobile(false)}/>
          <div className="relative w-80 max-w-full bg-white h-full overflow-y-auto p-5 ml-auto">
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
