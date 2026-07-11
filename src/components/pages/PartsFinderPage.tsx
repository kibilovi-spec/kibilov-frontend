'use client';
import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useLang } from '@/store';
import { AutodocCategoryTree } from '@/components/AutodocCategoryTree';
import { ModelSelector } from '@/components/ModelSelector';

const POPULAR_MAKES = [
  'Toyota','Hyundai','Kia','Mercedes-Benz','BMW','Volkswagen','Audi',
  'Honda','Nissan','Mitsubishi','Ford','Chevrolet','Opel','Renault',
  'Peugeot','Citroen','Mazda','Subaru','Suzuki','Lexus','Skoda',
  'Volvo','Land Rover','Jeep','Porsche','SEAT','Fiat','Alfa Romeo',
  'Lada','UAZ','Daewoo','Dacia','Chery','Geely','BYD','Haval',
];

export default function PartsFinderPage() {
  const [makes] = useState<string[]>(POPULAR_MAKES);
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const [models, setModels] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [modelObj, setModelObj] = useState<any>(null);
  const [engine, setEngine] = useState('');
  const [engineObj, setEngineObj] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resolvedVehicleId, setResolvedVehicleId] = useState<string|null>(null);
  const [searched, setSearched] = useState(false);

  // მოდელები
  useEffect(() => {
    if (!make) { setModels([]); setModel(''); setModelObj(null); setEngines([]); setEngine(''); return; }
    api.get(`/api/vehicles/models?make=${encodeURIComponent(make)}`)
      .then(r => setModels(r.data.data || []))
      .catch(() => {});
  }, [make]);

  // ძრავები
  useEffect(() => {
    if (!make || !modelObj) { setEngines([]); setEngine(''); setEngineObj(null); return; }
    const yearFrom = modelObj.yearFrom || 2000;
    const yearTo = modelObj.yearTo || new Date().getFullYear();
    const midYear = Math.floor((yearFrom + yearTo) / 2);
    api.get(`/api/vehicles/engines?make=${encodeURIComponent(make)}&model=${encodeURIComponent(modelObj.nameRaw || modelObj.name)}&year=${midYear}`)
      .then(r => setEngines(r.data.data || []))
      .catch(() => {});
  }, [make, modelObj]);

  const search = useCallback(async () => {
    if (!make || !modelObj || !engineObj) return;
    setLoading(true);
    setSearched(true);
    try {
      if (engineObj.vehicle_id) {
        setResolvedVehicleId(String(engineObj.vehicle_id));
      } else {
        const r = await api.get(`/api/vehicles/resolve?make=${encodeURIComponent(make)}&model=${encodeURIComponent(modelObj.nameRaw || modelObj.name)}`);
        if (r.data.success && r.data.vehicleId) {
          setResolvedVehicleId(String(r.data.vehicleId));
        }
      }
    } catch {}
    setLoading(false);
  }, [make, modelObj, engineObj]);

  const reset = () => {
    setMake(''); setModel(''); setModelObj(null);
    setEngine(''); setEngineObj(null);
    setEngines([]); setModels([]);
    setResolvedVehicleId(null); setSearched(false);
  };

  return (
    <div className="page-container py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-dark mb-6">ნაწილების ძებნა მანქანის მიხედვით</h1>

      {/* Vehicle Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <p className="text-sm font-medium text-gray-500 mb-4">იპოვე ნაწილები შენი მანქანისთვის</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* მარკა */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs mr-1">1</span>
              {t('მარკა','Make','Марка')}
            </label>
            <select
              value={make}
              onChange={e => { setMake(e.target.value); setModel(''); setModelObj(null); setEngine(''); setEngineObj(null); setResolvedVehicleId(null); setSearched(false); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white">
              <option value="">— მარკა —</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* მოდელი */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs mr-1 ${make ? 'bg-blue-600' : 'bg-gray-300'}`}>2</span>
              {t('მოდელი','Model','Модель')}
            </label>
            <ModelSelector
              models={models}
              value={model}
              disabled={!make || models.length === 0}
              onChange={(name, obj) => {
                setModel(name);
                setModelObj(obj);
                setEngine(''); setEngineObj(null);
                setResolvedVehicleId(null); setSearched(false);
              }}
            />
          </div>

          {/* ძრავი */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs mr-1 ${modelObj ? 'bg-blue-600' : 'bg-gray-300'}`}>3</span>
              {t('ძრავი','Engine','Двигатель')}
            </label>
            <select
              value={engine}
              onChange={e => {
                const val = e.target.value;
                setEngine(val);
                const obj = engines.find(en => en.name === val || en.engine === val);
                setEngineObj(obj || null);
              }}
              disabled={!modelObj || engines.length === 0}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">— ძრავი —</option>
              {engines.map((e, i) => <option key={i} value={e.name || e.engine}>{e.name || e.engine}{e.powerKw ? ` · ${e.powerKw}kW` : ''}{e.fuelType ? ` · ${e.fuelType}` : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={search}
            disabled={!make || !modelObj || !engineObj || loading}
            className="flex-1 md:flex-none md:px-12 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? t('⏳ ვეძებ...','⏳ Searching...','⏳ Поиск...') : t('🔍 ძებნა','🔍 Search','🔍 Найти')}
          </button>
          {(make || model || engine) && (
            <button onClick={reset} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
              გასუფთავება
            </button>
          )}
        </div>

        {make && model && engine && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <span className="text-blue-600">✓</span>
            <span>{make} {model} {engine && `· ${engine}`}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {searched && !loading && resolvedVehicleId && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <span className="text-green-600 text-lg">✅</span>
            <p className="text-sm font-bold text-green-800">{make} {model} — კატეგორიები</p>
          </div>
          <AutodocCategoryTree vehicleId={resolvedVehicleId} className="w-full" />
        </div>
      )}

      {searched && !loading && !resolvedVehicleId && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-3xl mb-3">😕</p>
          <p className="font-bold text-gray-700 mb-2">მანქანა ვერ მოიძებნა</p>
          <p className="text-sm text-gray-500">{make} {model}</p>
        </div>
      )}
    </div>
  );
}
