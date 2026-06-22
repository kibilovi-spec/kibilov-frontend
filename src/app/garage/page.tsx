'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/store';
import { useVehicleStore } from '@/store/vehicle';
import toast from 'react-hot-toast';

export default function GaragePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { setVehicleId } = useVehicleStore();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dropdown data
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [engines, setEngines] = useState<any[]>([]);

  // Selected values
  const [selMakeId, setSelMakeId] = useState('');
  const [selMakeName, setSelMakeName] = useState('');
  const [selModelId, setSelModelId] = useState('');
  const [selModelName, setSelModelName] = useState('');
  const [selYear, setSelYear] = useState('');
  const [selVehicleId, setSelVehicleId] = useState('');
  const [selEngineName, setSelEngineName] = useState('');

  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    loadVehicles();
    loadMakes();
  }, [user]);

  async function loadVehicles() {
    try {
      const r = await api.get('/api/garage');
      setVehicles(r.data.data || []);
    } catch {}
    setLoading(false);
  }

  async function loadMakes() {
    try {
      const r = await api.get('/api/vehicles/makes');
      setMakes((r.data.data||[]).map((name:string)=>({id:name,name})));
    } catch {}
  }

  async function onMakeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    const m = makes.find(x => x.id === id);
    setSelMakeId(id); setSelMakeName(m?.name || '');
    setSelModelId(''); setSelModelName('');
    setSelYear(''); setSelVehicleId(''); setSelEngineName('');
    setModels([]); setYears([]); setEngines([]);
    if (!id) return;
    setLoadingModels(true);
    try {
      const r = await api.get(`/api/vehicles/models?make=${encodeURIComponent(selMakeName||id)}`);
      setModels((r.data.data||[]).map((name:string)=>({id:name,name})));
    } catch {}
    setLoadingModels(false);
  }

  async function onModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    const m = models.find(x => x.id === id);
    setSelModelId(id); setSelModelName(m?.name || '');
    setSelYear(''); setSelVehicleId(''); setSelEngineName('');
    setYears([]); setEngines([]);
    if (!id) return;
    setLoadingYears(true);
    try {
      const r = await api.get(`/api/vehicles/years?make=${encodeURIComponent(selMakeName)}&model=${encodeURIComponent(selModelName||id)}`);
      setYears(r.data.data || []);
    } catch {}
    setLoadingYears(false);
  }

  async function onYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const y = e.target.value;
    setSelYear(y); setSelVehicleId(''); setSelEngineName('');
    setEngines([]);
    if (!y || !selModelId) return;
    setLoadingEngines(true);
    try {
      const r = await api.get(`/api/vehicles/engines?make=${encodeURIComponent(selMakeName)}&model=${encodeURIComponent(selModelName)}&year=${y}`);
      setEngines((r.data.data||[]).map((name:string)=>({vehicle_id:name,name,engine:name})));
    } catch {}
    setLoadingEngines(false);
  }

  async function onEngineChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const vid = e.target.value;
    const eng = engines.find(x => String(x.vehicle_id) === vid);
    setSelVehicleId(vid);
    setSelEngineName(eng?.engine || '');
  }

  async function handleAdd() {
    if (!selMakeName || !selModelName || !selYear) {
      toast.error('მარქა, მოდელი და წელი სავალდებულოა');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/garage', {
        brand: selMakeName,
        model: selModelName,
        year: parseInt(selYear),
        engine: selEngineName,
        vehicleId: selVehicleId || null,
      });
      toast.success('მანქანა დაემატა!');
      setAdding(false);
      setSelMakeId(''); setSelMakeName('');
      setSelModelId(''); setSelModelName('');
      setSelYear(''); setSelVehicleId(''); setSelEngineName('');
      setModels([]); setYears([]); setEngines([]);
      loadVehicles();
    } catch { toast.error('შეცდომა'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/garage/${id}`);
      toast.success('წაიშალა');
      loadVehicles();
    } catch {}
  }

  async function handleSelect(car: any) {
    if (car.vehicleId) setVehicleId(car.vehicleId);
    toast.success(`${car.make} ${car.model} არჩეულია`);
    router.push('/');
  }

  const sel = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <>
    <h1 className="sr-only">ჩემი გარაჟი — kibilov.ge</h1>
      <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">მთავარი</Link>
        <span>›</span>
        <span className="text-gray-800 font-medium">🚗 ჩემი ავტომობილები</span>
      </div>

      {/* Add Button */}
      {!adding && (
        <button onClick={() => setAdding(true)}
          className="w-full mb-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
          + ახალი მანქანის დამატება
        </button>
      )}

      {/* Add Form */}
      {adding && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">ახალი მანქანა</h2>
          <div className="space-y-3">
            {/* Make */}
            <select value={selMakeId} onChange={onMakeChange} className={sel}>
              <option value="">მარქა (VW, BMW...) *</option>
              {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            {/* Model */}
            <select value={selModelId} onChange={onModelChange} className={sel} disabled={!selMakeId || loadingModels}>
              <option value="">{loadingModels ? 'იტვირთება...' : 'მოდელი *'}</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            {/* Year */}
            <select value={selYear} onChange={onYearChange} className={sel} disabled={!selModelId || loadingYears}>
              <option value="">{loadingYears ? 'იტვირთება...' : 'წელი *'}</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Engine */}
            <select value={selVehicleId} onChange={onEngineChange} className={sel} disabled={!selYear || loadingEngines}>
              <option value="">{loadingEngines ? 'იტვირთება...' : 'ძრავი (არასავალდებულო)'}</option>
              {engines.map(e => (
                <option key={e.vehicle_id} value={e.vehicle_id}>
                  {e.engine}{e.fuel ? ` · ${e.fuel}` : ''}{e.power_hp ? ` · ${e.power_hp}hp` : ''}
                </option>
              ))}
            </select>

            <div className="flex gap-2 pt-2">
              <button onClick={handleAdd} disabled={saving || !selMakeName || !selModelName || !selYear}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'ინახება...' : '✅ შენახვა'}
              </button>
              <button onClick={() => setAdding(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cars List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🚗</p>
          <p>მანქანები არ დაგამატებია</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(car => (
            <div key={car.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {(() => {
                  const m = (car.make||'').toLowerCase().replace(/\s+/g,'-');
                  const mod = (car.model||'').toLowerCase().replace(/\s+/g,'-');
                  const url = `https://media.autodoc.eu/images/cars/${m}/${mod}/${m}_${mod}.jpg`;
                  return <img src={url} alt={car.make+' '+car.model} className="w-full h-full object-cover"
                    onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />;
                })()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{car.make} {car.model} · {car.year}</p>
                {car.engine && <p className="text-sm text-gray-500">{car.engine}</p>}
                {car.isMain && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">მთავარი</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSelect(car)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                  არჩევა
                </button>
                <button onClick={() => handleDelete(car.id)}
                  className="px-3 py-1.5 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
