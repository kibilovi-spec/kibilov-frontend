'use client';
// This file contains all page-level components
// Each is used by the corresponding page.tsx

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLang } from '@/store';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';
import { ProductCard, FilterBar, type Filters } from '@/components/shop/index';
import { Loader, Pagination } from '@/components/ui/index';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { Product, Category } from '@/types';

// ══════════════════════════════════════════
// HomePage
// ══════════════════════════════════════════
export function HomePage() {
  const { lang } = useLang();
  const t = useT(lang);
  const [categories, setCats] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.get(`/api/categories?lang=${lang}`).then(({data})=>setCats(data.data||[])).catch(()=>{});
    api.get(`/api/products?featured=true&lang=${lang}&limit=8`).then(({data})=>setFeatured(data.data||[])).catch(()=>{});
  }, [lang]);

  const BRANDS = ['BOSCH','BREMBO','BILSTEIN','SACHS','FEBI','LuK','NGK','MANN','MAHLE','TRW','ATE','DENSO','VALEO','CASTROL'];

  const MAKES: Record<string,string[]> = {
    Toyota:['Camry','Corolla','RAV4','Land Cruiser','Prius'],Hyundai:['Tucson','Santa Fe','Elantra','Sonata'],
    Kia:['Sportage','Sorento','Rio','Ceed'],'Mercedes-Benz':['C-Class','E-Class','GLE','Sprinter'],
    BMW:['3 Series','5 Series','X3','X5'],Volkswagen:['Golf','Passat','Tiguan'],
    Nissan:['X-Trail','Qashqai','Patrol'],Chevrolet:['Cruze','Captiva','Tahoe'],
  };
  const [make,setMake]=useState(''); const [model,setModel]=useState('');

  const PROMOS = [
    {icon:'🚚',title:t.freeDelivery,desc:t.freeDeliveryDesc},
    {icon:'✅',title:t.originalParts,desc:t.originalDesc},
    {icon:'🔄',title:t.returnPolicy,desc:t.returnDesc},
    {icon:'🔧',title:t.expertHelp,desc:t.expertDesc},
  ];

  return (
    <div className="page-container py-4 space-y-8">
      {/* Hero */}
      <div className="grid md:grid-cols-[300px_1fr] gap-5 mt-2">
        {/* Vehicle finder */}
        <div className="card overflow-hidden">
          <div className="bg-primary px-4 py-3 flex items-center gap-2">
            <span className="text-white">🔍</span>
            <span className="text-white font-bold text-sm">{t.vfTitle}</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              [t.vfMake, <select key="make" className="input-field" value={make} onChange={e=>{setMake(e.target.value);setModel('');}}>
                <option value="">—</option>{Object.keys(MAKES).map(m=><option key={m}>{m}</option>)}</select>],
              [t.vfModel, <select key="model" className="input-field" value={model} onChange={e=>setModel(e.target.value)} disabled={!make}>
                <option value="">—</option>{(MAKES[make]||[]).map(m=><option key={m}>{m}</option>)}</select>],
              [t.vfYear, <select key="year" className="input-field"><option>—</option>{Array.from({length:25},(_,i)=>2024-i).map(y=><option key={y}>{y}</option>)}</select>],
              [t.vfEngine, <select key="eng" className="input-field"><option>—</option>{['1.4','1.6','1.8','2.0','2.4','3.0','1.9 TDI','2.0 TDI','Hybrid','Electric'].map(e=><option key={e}>{e}</option>)}</select>],
            ].map(([label,ctrl],i)=>(
              <div key={i}>
                <div className="text-[10px] font-bold text-text3 uppercase tracking-wider mb-1">{label}</div>
                {ctrl}
              </div>
            ))}
            <Link href={`/products${make?`?q=${encodeURIComponent(make+(model?` ${model}`:''))}`:''}` }
              className="btn-primary w-full text-sm py-2.5 mt-1">🔍 {t.vfSearch}</Link>
            <div className="text-xs text-primary text-center cursor-pointer hover:underline">{t.vfCant}</div>
          </div>
        </div>

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden min-h-64 bg-primary-dark flex items-center shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary/60 to-transparent z-10"/>
          <div className="relative z-20 p-8 md:p-12">
            <div className="inline-flex items-center gap-2 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">🇬🇪 kibilov.ge — {lang==='ka'?'რუსთავი':lang==='ru'?'Рустави':'Rustavi'}</div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
              {lang==='ka'?<>ავტონაწილები<br/><span className="text-yellow-300">ყველა მარკისთვის</span></>
               :lang==='ru'?<>Автозапчасти<br/><span className="text-yellow-300">для любой марки</span></>
               :<>Auto Parts<br/><span className="text-yellow-300">for Every Make</span></>}
            </h1>
            <p className="text-white/75 text-sm md:text-base mb-6 max-w-md">{t.heroDesc}</p>
            <div className="flex flex-wrap gap-6">
              {[['500K+',t.pieces.replace('ც.','ნაწ.')],['2500+',t.popularBrands.split(' ')[0]],['85K+','მოდელი'],['24/7','Support']].map(([n,l])=>(
                <div key={n}><div className="text-2xl font-extrabold text-white">{n}</div><div className="text-xs text-white/60">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Address block */}
      <div className="bg-white border border-gray-2 rounded-xl p-4 shadow-sm flex items-center gap-4 flex-wrap">
        <span className="text-3xl shrink-0">📍</span>
        <div className="flex-1"><div className="font-bold text-dark text-sm">{t.addrTitle}</div><div className="text-xs text-text2 mt-0.5">{t.addrSub}</div></div>
        <a href="tel:+995577575052" className="flex items-center gap-2 bg-primary-light border border-primary/20 rounded-xl px-4 py-2.5">
          <span className="text-primary text-lg">📞</span>
          <div><div className="font-extrabold text-primary text-sm">+995 577 575052</div><div className="text-[10px] text-text3">09:00–19:00</div></div>
        </a>
      </div>

      {/* Promo strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PROMOS.map(p=>(
          <div key={p.title} className="bg-white border border-gray-2 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl shrink-0">{p.icon}</span>
            <div><div className="text-xs font-bold text-dark">{p.title}</div><div className="text-[10px] text-text3">{p.desc}</div></div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title"><span className="w-1 h-6 bg-primary rounded-full"/>{t.categories}</h2>
          <Link href="/products" className="text-xs font-bold text-primary hover:underline">{t.seeAll}</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.length === 0
            ? Array(8).fill(0).map((_,i) => (
                <div key={i} className="bg-white border border-gray-2 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"/>
                    <div className="flex-1"><div className="h-3 bg-gray-200 rounded w-3/4 mb-1"/><div className="h-2 bg-gray-100 rounded w-1/2"/></div>
                  </div>
                  <div className="space-y-1">{[1,2,3].map(j=><div key={j} className="h-2 bg-gray-100 rounded"/>)}</div>
                </div>
              ))
            : categories.map(cat=>(
            <Link key={cat.id} href={`/products?category=${cat.slug}`}
              className="bg-white border border-gray-2 rounded-xl p-4 hover:border-primary hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-1">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0 text-primary p-2">
                  <CategoryIcon slug={cat.slug} className="w-full h-full" color="text-primary"/>
                </div>
                <div>
                  <div className="text-sm font-bold text-dark leading-tight">{cat.name}</div>
                  {cat.productCount!==undefined&&<div className="text-[10px] text-text3">{cat.productCount} {lang==='ka'?'ნაწ.':'pcs'}</div>}
                </div>
              </div>
              {cat.children?.slice(0,4).map(c=>(
                <div key={c.id} className="text-[11px] text-text2 flex items-center gap-1 mb-1">
                  <span className="text-primary font-bold">›</span>{c.name}
                </div>
              ))}
            </Link>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title"><span className="w-1 h-6 bg-primary rounded-full"/>{t.popularBrands}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map(b=>(
            <Link key={b} href={`/products?brand=${b}`}
              className="bg-white border border-gray-2 rounded-lg px-4 py-2.5 text-xs font-extrabold text-gray-500 hover:border-primary hover:text-primary hover:-translate-y-0.5 hover:shadow-sm transition-all tracking-wide">
              {b}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title"><span className="w-1 h-6 bg-primary rounded-full"/>{t.popularParts}</h2>
          <Link href="/products" className="text-xs font-bold text-primary hover:underline">{t.seeAll}</Link>
        </div>
        {featured.length===0 ? <Loader/> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p=><ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </section>
    </div>
  );
}

// ══════════════════════════════════════════
// ProductsPage
// ══════════════════════════════════════════
export function ProductsPage({ searchParams }: { searchParams?: Record<string,string> }) {
  const { lang } = useLang();
  const t = useT(lang);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [brands, setBrands] = useState<string[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ ...searchParams, page:1 });

  useEffect(() => {
    api.get(`/api/categories?lang=${lang}`).then(({data}) => setCats(data.data || [])).catch(() => {});
  }, [lang]);

  const load = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      Object.entries({...f, lang}).forEach(([k,v])=>{ if(v!==undefined&&v!==''&&v!==false) p.append(k,String(v)); });
      const {data} = await api.get(`/api/products?${p}`);
      setProducts(data.data||[]);
      setPagination(data.pagination||{page:1,pages:1,total:0});
      setBrands(data.meta?.brands||[]);
    } catch {}
    finally { setLoading(false); }
  }, [lang]);

  useEffect(() => { load(filters); }, [filters, load]);

  const update = (patch: Partial<Filters>) => setFilters(f=>({...f,...patch,page:1}));
  const reset = () => setFilters({page:1});

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-dark">{t.shop}</h1>
        <span className="text-sm text-text3">{pagination.total} {lang==='en'?'results':lang==='ru'?'результатов':'შედეგი'}</span>
      </div>
      <div className="flex gap-6 items-start">
        <FilterBar filters={filters} brands={brands} categories={cats} onChange={update} onClear={reset}/>
        <div className="flex-1 min-w-0">
          {loading ? <Loader/> : (
            <>
              {products.length===0 ? (
                <div className="text-center py-20 text-text3">
                  <div className="text-5xl mb-4">🔍</div>
                  <div className="font-semibold">{t.noResults}</div>
                  <button onClick={reset} className="btn-primary mt-4">გასუფთავება</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(p=><ProductCard key={p.id} product={p}/>)}
                </div>
              )}
              <Pagination page={pagination.page} total={pagination.total} limit={12} onPage={pg=>setFilters(f=>({...f,page:pg}))}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
