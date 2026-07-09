'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/store';
import { useRouter } from 'next/navigation';

interface Vehicle { id: string; make: string; model: string; year: number; engine?: string; fuelType?: string; displacement?: string; isMain: boolean; vehicleId?: string; }

const POPULAR = ['Toyota','BMW','Mercedes-Benz','Hyundai','Kia','Volkswagen','Audi','Ford','Chevrolet','Opel','Nissan','Honda','Mazda','Subaru','Mitsubishi','Lexus','Porsche','Jeep','Land Rover','Renault','Peugeot','Citroen','Skoda','Volvo','Infiniti','LADA','UAZ','GAZ'];
const YEARS = Array.from({length: 35}, (_, i) => 2024 - i);
const VOLUMES = ['—','0.8L','1.0L','1.2L','1.3L','1.4L','1.5L','1.6L','1.8L','2.0L','2.2L','2.4L','2.5L','2.7L','3.0L','3.2L','3.5L','3.6L','4.0L','4.2L','4.4L','4.7L','5.0L','5.5L','6.0L'];
const FUELS = [{key:'ბენზინი',icon:'⛽'},{key:'დიზელი',icon:'🛢️'},{key:'ჰიბრიდი',icon:'🔋'},{key:'ელექტრო',icon:'⚡'},{key:'გაზი (LPG)',icon:'🔵'},{key:'პლაგინი',icon:'🔌'}];

export default function MyCarPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [makes, setMakes] = useState<string[]>(POPULAR);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [form, setForm] = useState({ make: 'Toyota', model: '', year: 2020, displacement: '2.0L', fuelType: 'ბენზინი' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.push('/'); return; }
    fetchVehicles();
    fetchMakes();
  }, [user, initialized]);

  const fetchMakes = async () => {
    try {
      const r = await api.get('/api/vehicles/makes');
      const all: string[] = r.data.data || [];
      const pop = POPULAR.filter(m => all.some(a => a.toUpperCase() === m.toUpperCase()));
      const rest = all.filter(m => !POPULAR.some(p => p.toUpperCase() === m.toUpperCase()));
      setMakes([...pop, '---', ...rest]);
    } catch {}
  };

  const fetchModels = useCallback(async (make: string) => {
    if (!make || make === '---') return;
    setLoadingModels(true);
    setModels([]);
    try {
      const r = await api.get(`/api/vehicles/models?make=${encodeURIComponent(make)}`);
      const list: string[] = r.data.data || [];
      setModels(list);
      setForm(p => ({...p, model: list[0] || ''}));
    } catch {}
    setLoadingModels(false);
  }, []);

  useEffect(() => { if (showForm) fetchModels(form.make); }, [showForm]);

  const fetchVehicles = async () => {
    try { const r = await api.get('/api/vehicles'); setVehicles(r.data.data || []); } catch {}
    setLoading(false);
  };

  const save = async () => {
    if (!form.model) return setMsg('მოდელი სავალდებულოა');
    setSaving(true);
    try {
      await api.post('/api/vehicles', {
        ...form,
        displacement: form.displacement === '—' ? '' : form.displacement,
        isMain: vehicles.length === 0
      });
      await fetchVehicles();
      setShowForm(false);
      setMsg('მანქანა დაემატა!');
      setTimeout(() => setMsg(''), 3000);
    } catch(e: any) { setMsg(e.response?.data?.message || 'შეცდომა'); }
    setSaving(false);
  };

  const setMain = async (id: string) => { await api.put(`/api/vehicles/${id}/main`); fetchVehicles(); };
  const remove = async (id: string) => { if (!confirm('წაშლა?')) return; await api.delete(`/api/vehicles/${id}`); fetchVehicles(); };

  const fuelIcon = (f?: string) => FUELS.find(x => x.key === f)?.icon || '🚗';

  return (
    <div className="page-container py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold text-dark mb-6">🚗 ჩემი მანქანა</h1>
      {msg && <div className={`rounded-xl px-4 py-3 mb-4 text-sm ${msg.includes('შეცდომა')||msg.includes('სავალდებულო') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
      {loading ? <div className="text-center py-12 text-text2">იტვირთება...</div> : (
        <>
          <div className="space-y-3 mb-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-white border border-gray-2 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{fuelIcon(v.fuelType)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm">{v.make} {v.model}</p>
                  <p className="text-xs text-text2">{v.year}{v.displacement && v.displacement !== '—' ? ` · ${v.displacement}` : ''}{v.fuelType ? ` · ${v.fuelType}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {v.isMain ? <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">✓ მთავარი</span>
                    : <button onClick={() => setMain(v.id)} className="text-xs text-primary hover:underline">მთავარი</button>}
                  <button onClick={() => remove(v.id)} className="text-red-400 hover:text-red-600 text-xl ml-1">×</button>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && !showForm && <div className="text-center py-8 text-text2 text-sm">მანქანა არ არის დამატებული</div>}
          </div>

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full border border-dashed border-gray-3 rounded-xl py-3 text-sm text-text2 hover:border-primary hover:text-primary transition-colors">+ მანქანის დამატება</button>
          ) : (
            <div className="bg-white border border-gray-2 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-dark">მანქანის დამატება</h3>

              <div>
                <label className="text-xs font-medium text-text2 uppercase tracking-wide mb-1.5 block">მარკა</label>
                <select className="input-field" value={form.make} onChange={e => { if(e.target.value==='---') return; setForm(p=>({...p,make:e.target.value,model:''})); fetchModels(e.target.value); }}>
                  {makes.map((m,i) => m==='---' ? <option key="sep" disabled>──────────</option> : <option key={i}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text2 uppercase tracking-wide mb-1.5 block">მოდელი {loadingModels && <span className="text-primary normal-case">(იტვირთება...)</span>}</label>
                <select className="input-field" value={form.model} onChange={e=>setForm(p=>({...p,model:e.target.value}))} disabled={loadingModels}>
                  {models.length===0 && <option value="">აირჩიე მარკა</option>}
                  {models.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text2 uppercase tracking-wide mb-1.5 block">წელი</label>
                  <select className="input-field" value={form.year} onChange={e=>setForm(p=>({...p,year:parseInt(e.target.value)}))}>
                    {YEARS.map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text2 uppercase tracking-wide mb-1.5 block">მოცულობა</label>
                  <select className="input-field" value={form.displacement} onChange={e=>setForm(p=>({...p,displacement:e.target.value}))}>
                    {VOLUMES.map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text2 uppercase tracking-wide mb-2 block">საწვავის ტიპი</label>
                <div className="grid grid-cols-3 gap-2">
                  {FUELS.map(f => (
                    <button key={f.key} type="button" onClick={()=>setForm(p=>({...p,fuelType:f.key}))}
                      className={`py-2.5 px-2 rounded-xl border text-xs transition-all ${form.fuelType===f.key ? 'border-primary bg-blue-50 text-primary font-medium' : 'border-gray-2 text-text2 hover:border-gray-3'}`}>
                      <span className="block text-base mb-0.5">{f.icon}</span>
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={save} disabled={saving||loadingModels} className="btn-primary flex-1">{saving ? '...' : 'შენახვა'}</button>
                <button onClick={()=>setShowForm(false)} className="flex-1 border border-gray-2 rounded-xl text-sm py-2 hover:bg-gray-bg">გაუქმება</button>
              </div>
            </div>
          )}

          {vehicles.length > 0 && (() => {
            const main = vehicles.find(v => v.isMain) || vehicles[0];
            return (
              <div className="mt-6 rounded-2xl p-5 border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔍</div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">პერსონალიზებული კატალოგი</p>
                    <p className="text-sm font-semibold text-blue-900">ჩემი მანქანის ნაწილები</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-3 py-1.5 text-xs font-medium text-blue-700 mb-3">
                  <span>🚗</span>
                  <span>{main.make} {main.model}</span>
                  <span className="text-blue-500">· {main.year}{main.displacement && main.displacement !== '—' ? ` · ${main.displacement}` : ''}{main.fuelType ? ` · ${main.fuelType}` : ''}</span>
                </div>
                <a href={main.vehicleId ? `/products?vehicleId=${main.vehicleId}` : `/products?vehicle=${encodeURIComponent(`${main.make} ${main.model}`)}`}
                  className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
                  <span>ნაწილების ნახვა</span>
                  <span>→</span>
                </a>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
