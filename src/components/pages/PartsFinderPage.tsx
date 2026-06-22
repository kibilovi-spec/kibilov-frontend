'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useLang } from '@/store';
import { ProductCard } from '@/components/shop/index';
import type { Product } from '@/types';

function SearchableSelect({ value, onChange, options, placeholder, disabled = false }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { if (!disabled) setOpen(o => !o); }}
        className={`input-field w-full text-left flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <span className={value ? 'text-dark' : 'text-gray-400'}>{value || placeholder}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-primary"
              placeholder="ძებნა..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button type="button" onClick={() => { onChange(''); setOpen(false); setQ(''); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50">
              {placeholder}
            </button>
            {filtered.map(o => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); setQ(''); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-primary ${o === value ? 'bg-blue-50 text-primary font-medium' : 'text-dark'}`}>
                {o}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-center py-3 text-sm text-gray-400">ვერ მოიძებნა</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    mq.addEventListener('change', e => setIsMobile(e.matches));
  }, []);
  return { isMobile };
}

const YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i);

function VINDecoder({ onVehicle }: { onVehicle: (make: string, model: string, year: string) => void }) {
  const [vin, setVin] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const decode = async () => {
    if (vin.length !== 17) return;
    setLoading(true);
    try {
      const r = await api.get(`/api/vehicles/vin?vin=${vin}`);
      const d = r.data.data;
      setResult(d);
      if (d?.vehicle?.make) onVehicle(d.vehicle.make, d.vehicle.model || '', d.vehicle.year || '');
    } catch { setResult({ error: true }); } finally { setLoading(false); }
  };
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
      <p className="text-sm font-bold text-blue-800 mb-2">VIN კოდით სწრაფი ძებნა</p>
      <div className="flex gap-2">
        <input className="input-field flex-1 text-sm" placeholder="17 სიმბოლო" maxLength={17} value={vin} onChange={e => setVin(e.target.value.toUpperCase())} />
        <button onClick={decode} disabled={vin.length !== 17 || loading} className="btn-primary px-3 text-sm whitespace-nowrap">{loading ? '...' : 'დეკოდირება'}</button>
      </div>
      {result && !result.error && (
        <div className="mt-2 text-sm">
          <p className={`font-bold ${result.confidence === 'high' ? 'text-green-700' : result.confidence === 'medium' ? 'text-yellow-700' : 'text-red-700'}`}>{result.confidenceMsg}</p>
          <p className="text-gray-600">{result.vehicle?.make} {result.vehicle?.model} {result.vehicle?.year}</p>
        </div>
      )}
      {result?.error && <p className="mt-2 text-sm text-red-600">VIN ვერ მოიძებნა</p>}
    </div>
  );
}

export default function PartsFinderPage() {
  const { lang } = useLang();
  const { isMobile } = useBreakpoint();
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const POPULAR_MAKES = [
    'Toyota','Hyundai','Kia','Mercedes-Benz','BMW','Volkswagen','Audi',
    'Honda','Nissan','Mitsubishi','Ford','Chevrolet','Opel','Renault',
    'Peugeot','Citroen','Fiat','Mazda','Subaru','Suzuki','Lexus',
    'Infiniti','Jeep','Land Rover','Volvo','Skoda','SEAT','Porsche',
    'Dodge','Chrysler','Buick','Cadillac','Lincoln','Acura','Genesis',
    'Lada','UAZ','GAZ','ZAZ','Daewoo','Dacia','Alfa Romeo','Jaguar',
    'Mini','Smart','Isuzu','SsangYong','Daihatsu','Chery','Geely',
    'BYD','Great Wall','Haval','Lifan','JAC',
  ];
  useEffect(() => { setMakes(POPULAR_MAKES); }, []);

  useEffect(() => {
    if (!make) { setModels([]); setModel(''); return; }
    api.get(`/api/vehicles/models?make=${encodeURIComponent(make)}`).then(({ data }) => {
      setModels(data.data || []); setModel('');
    }).catch(() => {});
  }, [make]);

  useEffect(() => {
    if (!make || !model || !year) { setEngines([]); return; }
    api.get(`/api/vehicles/engines?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`).then(({ data }) => {
      setEngines(data.data || []);
    }).catch(() => {});
  }, [make, model, year]);

  const search = useCallback(async () => {
    if (!make || !model || !year) return;
    setLoading(true); setSearched(true);
    try {
      const r = await api.get(`/api/parts/search?makeId=${encodeURIComponent(make)}&modelId=${encodeURIComponent(model)}&year=${year}&limit=20`);
      setProducts(r.data.products || []);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [make, model, year]);

  const reset = () => { setMake(''); setModel(''); setYear(''); setEngine(''); setProducts([]); setSearched(false); setStep(1); };
  const handleVehicle = (m: string, mo: string, y: string) => { setMake(m); setModel(mo); setYear(y); };

  const Results = () => (
    <div className="mt-6">
      {loading && <div className="text-center py-12 text-gray-400">იტვირთება...</div>}
      {searched && !loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-2xl mb-3">😕</p>
          <p className="font-bold text-gray-700 mb-2">ნაწილი ვერ მოიძებნა</p>
          <p className="text-sm text-gray-500 mb-4">{make} {model} {year}-ისთვის კატალოგში ჯერ არ გვაქვს</p>
          <div className="flex gap-3 justify-center">
            <Link href="/products" className="btn-primary">ყველა ნაწილი</Link>
            <a href="tel:+995577575052" className="btn-secondary">დარეკე</a>
          </div>
        </div>
      )}
      {searched && !loading && products.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-4"><span className="font-bold text-dark">{products.length}</span> ნაწილი — {make} {model} {year}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="page-container py-4">
        <h1 className="text-xl font-bold text-dark mb-4">ნაწილების ძებნა</h1>
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">ნაბიჯი 1/3 — აირჩიე მარკა</p>
            <select className="input-field text-lg p-4" value={make} onChange={e => { setMake(e.target.value); setStep(2); }}>
              <option value="">— მარკა —</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <VINDecoder onVehicle={handleVehicle} />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(1)} className="text-primary text-sm">← უკან</button>
              <p className="text-sm text-gray-500">{make}</p>
            </div>
            <select className="input-field text-lg p-4" value={model} onChange={e => { setModel(e.target.value); setStep(3); }}>
              <option value="">— მოდელი —</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(2)} className="text-primary text-sm">← უკან</button>
              <p className="text-sm text-gray-500">{make} {model}</p>
            </div>
            <select className="input-field" value={year} onChange={e => setYear(e.target.value)}>
              <option value="">— წელი —</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="input-field" value={engine} onChange={e => setEngine(e.target.value)}>
              <option value="">— ძრავი (არასავ.) —</option>
              {engines.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button onClick={search} disabled={!year || loading} className="btn-primary w-full text-lg p-4">{loading ? 'ვეძებ...' : 'ძებნა'}</button>
          </div>
        )}
        <Results />
      </div>
    );
  }

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold text-dark mb-6">ნაწილების ძებნა მანქანის მიხედვით</h1>
      <div className="grid md:grid-cols-[320px_1fr] gap-6">
        <div>
          <div className="card p-5">
            <h2 className="font-bold text-dark mb-4">მანქანის არჩევა</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">მარკა</label>
                <SearchableSelect value={make} onChange={v => setMake(v)} options={makes} placeholder="— აირჩიე მარკა —" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">მოდელი</label>
                <SearchableSelect value={model} onChange={v => setModel(v)} options={models} placeholder="— აირჩიე მოდელი —" disabled={!make} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">წელი</label>
                  <SearchableSelect value={year} onChange={v => setYear(v)} options={YEARS.map(String)} placeholder="— წელი —" disabled={!model} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ძრავი</label>
                  <SearchableSelect value={engine} onChange={v => setEngine(v)} options={engines} placeholder="— ძრავი —" disabled={!year} />
                </div>
              </div>
              <button onClick={search} disabled={!make || !model || !year || loading} className="btn-primary w-full">
                {loading ? 'ვეძებ...' : 'ნაწილების ძებნა'}
              </button>
              {(make || model || year) && (
                <button onClick={reset} className="w-full text-sm text-gray-500 hover:text-gray-700 underline">გასუფთავება</button>
              )}
            </div>
            <VINDecoder onVehicle={handleVehicle} />
          </div>
          {(make || model || year) && (
            <div className="card p-4 mt-4 bg-blue-50 border-blue-200">
              <p className="text-sm font-bold text-blue-800">არჩეული:</p>
              <p className="text-sm text-blue-700">{make} {model} {year} {engine}</p>
            </div>
          )}
        </div>
        <div>
          {!searched && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="text-5xl mb-4">🔧</p>
              <p className="text-lg">აირჩიეთ მანქანა და ვნახოთ შესაბამისი ნაწილები</p>
            </div>
          )}
          <Results />
        </div>
      </div>
    </div>
  );
}
