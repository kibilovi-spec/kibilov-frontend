'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ModelSelector } from '@/components/ModelSelector';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useAuth } from '@/store';
import { useVehicleStore } from '@/store/vehicle';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function GaragePage() {
  usePageTitle('ჩემი გარაჟი | kibilov.ge');
  const { user, initialized } = useAuth();
  const router = useRouter();
  const { setVehicleId, setVehicle, vehicle } = useVehicleStore();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleCats, setVehicleCats] = useState<any[]>([]);
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
    if (!initialized) return;
    if (!user) { router.push('/auth'); return; }
    loadVehicles();
    loadMakes();
  }, [user, initialized]);

  async function loadVehicles() {
    try {
      const r = await api.get('/api/garage');
      const list = r.data.data || [];
      setVehicles(list);
      // პირველი მანქანა ავტომატურად active
      const stored = localStorage.getItem('kibilov-vehicle');
      const storedVehicle = stored ? JSON.parse(stored) : null;
      const hasVehicle = storedVehicle?.state?.vehicle?.vehicleId;
      const mainCar = list.find((c: any) => c.isMain) || list[0];
      // vehicle categories ჩავტვირთოთ main მანქანისთვის
      const mainForCats = list.find((c: any) => c.isMain) || list[0];
      if (mainForCats?.vehicleId) {
        api.get(`/api/garage/vehicle-categories/${mainForCats.vehicleId}`)
          .then(r => setVehicleCats(r.data.data || []))
          .catch(() => {});
      }
      if (mainCar && !hasVehicle && mainCar.vehicleId) {
        const car = mainCar;
        setVehicle({ vehicleId: car.vehicleId, make: car.brand||car.make||'', model: car.model||'', year: String(car.year||''), engine: car.engine||'', makeId: null, modelId: null, slug: '' });
      }
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
      setModels((r.data.data||[]).map((m:any)=> typeof m === 'string' ? {id:m,name:m,nameRaw:m} : {id:m.id||m.name,name:m.name,nameRaw:m.nameRaw||m.name,yearFrom:m.yearFrom,yearTo:m.yearTo}));
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
    if (!selMakeName || !selModelName || !selVehicleId) {
      toast.error('მარქა, მოდელი და ძრავი სავალდებულოა');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/garage', {
        brand: selMakeName,
        model: selModelName,
        year: selYear ? parseInt(selYear) : undefined,
        engine: selEngineName,
        vehicleId: selVehicleId || null,
      });
      toast.success('მანქანა დაემატა!');
      if (selVehicleId) {
        setVehicle({ vehicleId: selVehicleId, make: selMakeName, model: selModelName, year: selYear, engine: selEngineName, makeId: selMakeId, modelId: selModelId, slug: '' });
      }
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

  async function handleSetMain(id: string) {
    try {
      await api.patch(`/api/garage/${id}/main`);
      toast.success('მთავარ მანქანად დაყენდა');
      loadVehicles();
    } catch { toast.error('შეცდომა'); }
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
            <SearchableSelect
              value={selMakeName}
              onChange={(name, id) => {
                const m = makes.find((m:any) => m.name === name);
                if (m) onMakeChange({ target: { value: m.id } } as any);
              }}
              options={makes.map((m:any) => ({ id: m.id, name: m.name }))}
              placeholder="მარქა (VW, BMW...) *"
            />

            {/* Model */}
            <ModelSelector
              models={models}
              value={selModelName}
              disabled={!selMakeId || loadingModels}
              onChange={async (name, obj) => {
                setSelModelId(obj.id);
                setSelModelName((obj as any).nameRaw || name);
                setSelYear(''); setEngines([]);
                try {
                  const yFrom = (obj as any).yearFrom || 2000;
                  const yTo = (obj as any).yearTo || new Date().getFullYear();
                  const mid = Math.floor((yFrom + yTo) / 2);
                  const currentMake = makes.find((m:any) => m.id === selMakeId)?.name || selMakeName;
                  const r = await api.get(`/api/vehicles/engines?make=${encodeURIComponent(currentMake)}&model=${encodeURIComponent(name)}&year=${mid}`);
                  setEngines((r.data.data||[]).map((e:any) => typeof e==='string'?{vehicle_id:e,name:e,engine:e}:{vehicle_id:String(e.vehicle_id),name:e.name||e.engine,engine:e.engine,fuel:e.fuelType,power_hp:e.powerKw}));
                } catch {}
              }}
            />

            {/* Engine */}
            <select value={selVehicleId} onChange={onEngineChange} className={sel} disabled={engines.length === 0}>
              <option value="">— ძრავი * —</option>
              {engines.map(e => (
                <option key={e.vehicle_id} value={e.vehicle_id}>
                  {e.name}{e.fuel ? ` · ${e.fuel}` : ''}{e.power_hp ? ` · ${e.power_hp}kW` : ''}
                </option>
              ))}
            </select>

            <div className="flex gap-2 pt-2">
              <button onClick={handleAdd} disabled={saving || !selMakeName || !selModelName || !selVehicleId}
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
                  return car.modelImageUrl 
                    ? <img src={car.modelImageUrl} alt={car.make+' '+car.model} className="w-full h-full object-contain p-1"
                        onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">🚗</div>;
                })()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{car.make} {car.model} · {car.year}</p>
                {car.engine && <p className="text-sm text-gray-500">{car.engine}</p>}
                {car.isMain && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">მთავარი</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => handleSelect(car)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                  არჩევა
                </button>
                {car.vehicleId && (
                  <a href={`/vin/${car.vehicleId}/100001`}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition text-center">
                    🔧 ნაწილები
                  </a>
                )}
                {!car.isMain && (
                  <button onClick={() => handleSetMain(car.id)}
                    className="px-3 py-1.5 border border-blue-200 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition">
                    ⭐ მთავარი
                  </button>
                )}
                <button onClick={() => handleDelete(car.id)}
                  className="px-3 py-1.5 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    {vehicleCats.length > 0 && (
      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🔧 ჩემი მანქანისთვის კატეგორიები</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {vehicleCats.map((cat: any) => (
            <a key={cat.id} href={`/products?category=${cat.id}&vehicleId=${vehicles.find((v:any)=>v.isMain)?.vehicleId||''}`}
              className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-400 hover:shadow-sm transition-all">
              <p className="text-sm font-medium text-gray-800">{cat.name}</p>
            </a>
          ))}
        </div>
      </div>
    )}
    </div>
    </>
  );
}
