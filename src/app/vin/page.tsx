'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AutodocCategoryTree } from '@/components/AutodocCategoryTree';
import { useAuth } from '@/store';
import api2 from '@/lib/api';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Vehicle {
  make: string|null; model: string|null; year: string|null;
  engine: string|null; fuel: string|null; chassis: string|null;
}
interface Category { id: number; name: string; parent: string|null; imageUrl?: string; nameKa?: string; }
interface Part {
  articleId: number; articleNo: string; supplierName: string;
  articleProductName: string; s3image: string|null;
  image?: string|null; altCodes?: string[]; inStock?: boolean;
  product?: { id: string; nameKa: string; price: number; stock: number; images?: string[] };
}

function VINPageInner() {
  const searchParams = useSearchParams();
  const [vin, setVin] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle|null>(null);
  const [vehicleId, setVehicleId] = useState<string|null>(null);
  const [multiVehicles, setMultiVehicles] = useState<any[]>([]);
  const { user } = useAuth();
  const [savingGarage, setSavingGarage] = useState(false);
  usePageTitle('VIN ძებნა | kibilov.ge');
  const [savedToGarage, setSavedToGarage] = useState(false);
  const [confMsg, setConfMsg] = useState('');
  const [carImage, setCarImage] = useState<string|null>(null);
  const [confColor, setConfColor] = useState('green');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'manual'|'camera'|'history'>('manual');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [selCat, setSelCat] = useState<Category|null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [partsCount, setPartsCount] = useState(0);
  const [partsLoading, setPartsLoading] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = localStorage.getItem('vin_history');
    if (h) try { setHistory(JSON.parse(h)); } catch {}
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'camera' || tabParam === 'manual' || tabParam === 'history') {
      setTab(tabParam as 'manual'|'camera'|'history');
    }
    const vinParam = params.get('vin');
    const vehicleIdParam = params.get('vehicleId');
    const makeParam = params.get('make');
    const modelParam = params.get('model');
    const yearParam = params.get('year');
    if (vehicleIdParam) {
      // პირდაპირ vehicleId გვაქვს — VIN decode გარეშე
      setVehicleId(vehicleIdParam);
      if (makeParam && modelParam) {
        setVehicle({
          make: makeParam, model: modelParam,
          year: yearParam||null, engine: null, fuel: null, chassis: null
        });
        setConfMsg('✅ match დადასტურებულია');
        setConfColor('green');
      }
      loadCats(vehicleIdParam);
    } else if (vinParam && vinParam.length === 17) {
      setVin(vinParam);
      search(vinParam);
    }
  }, []);

  const saveHist = (v: string, info: Vehicle, vId: string) => {
    const e = { vin: v, make: info.make||'', model: info.model||'', year: info.year||'', vehicleId: vId };
    const u = [e, ...history.filter(h => h.vin !== v)].slice(0, 10);
    setHistory(u);
    localStorage.setItem('vin_history', JSON.stringify(u));
  };

  const search = async (vinCode?: string) => {
    const v = (vinCode || vin).trim().toUpperCase();
    if (v.length !== 17) return setError('VIN კოდი 17 სიმბოლო უნდა იყოს');
    setLoading(true); setError(''); setVehicle(null); setVehicleId(null);
    setCategories([]); setSelCat(null); setParts([]);
    try {
      const r = await api.get(`/api/vehicles/vin?vin=${v}`);
      const d = r.data.data || r.data;
      if (d?.invalidFormat) { setError(d.error || 'VIN ფორმატი არასწორია'); }
      else if (d?.source === 'tecdoc_multi' && d?.vehicles?.length > 0) {
          setError('');
          setMultiVehicles(d.vehicles);
        }

      else if (d?.notFound || !d?.vehicle) { setError(d?.error || 'VIN ვერ მოიძებნა'); }
      else {
        const info: Vehicle = {
          make: d.vehicle.make||null, model: d.vehicle.model||null,
          year: d.vehicle.year ? String(d.vehicle.year) : null,
          engine: d.vehicle.displacement||d.vehicle.engine||null,
          fuel: d.vehicle.fuelType||d.vehicle.fuel||null,
          chassis: d.vehicle.chassis||null,
        };
        setVehicle(info);
        setVehicleId(d.vehicleId||null);
        setConfMsg(d.confidenceLabel || '✅ ამოცნობილია');
        setConfColor(d.confidenceColor || 'green');
        setCarImage(d.carImage || null);
        saveHist(v, info, d.vehicleId||'');
        if (d.vehicleId) {
          loadCats(d.vehicleId);
          api.post('/api/vin/prefetch-oem', { vehicleId: d.vehicleId }).catch(() => {});
        }
      }
    } catch(e: any) { setError(e.response?.data?.error || 'სერვერთან კავშირი ვერ მოხდა'); }
    setLoading(false);
  };
  useEffect(() => {
    const q = searchParams.get('vin');
    if (q && q.trim().length === 17) {
      setVin(q.trim().toUpperCase());
      setTab('manual');
      search(q.trim().toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCats = async (vId: string) => {
    setCatsLoading(true);
    try {
      const r = await api.get(`/api/categories?lang=en&limit=200`);
      const cats = (r.data.data || []).map((c: any) => ({ id: c.autodocId || c.id, name: c.nameEn || c.name, parent: c.parentId ? String(c.parentId) : null, parentId: c.parentId, imageUrl: c.imageUrl }));
      setCategories(cats);
    } catch {}
    setCatsLoading(false);
  };

  const loadParts = async (cat: Category) => {
    if (!vehicleId) return;
    setSelCat(cat); setParts([]); setPartsLoading(true);
    // parent category-ზე კლიკი — sub-cats გაშლა, არა parts
    const subs = childCats(cat.name);
    if (!cat.parent && subs.length > 0) {
      setPartsLoading(false);
      return;
    }
    try {
      const r = await api.get(`/api/autodoc/parts?vehicleId=${vehicleId}&categoryId=${cat.id}`);
      setParts(r.data.articles || []);
      setPartsCount(r.data.count || 0);
    } catch {}
    setPartsLoading(false);
  };

  const handleOCR = async (file: File) => {
    setOcrLoading(true); setError('');
    try {
      const buf = await file.arrayBuffer();
      const r = await api.post('/api/vin/ocr', buf, { headers: { 'Content-Type': file.type } });
      if (r.data.vin) { setVin(r.data.vin); setTab('manual'); await search(r.data.vin); }
      else setError(r.data.message || 'VIN ვერ მოიძებნა');
    } catch { setError('OCR შეცდომა'); }
    setOcrLoading(false);
  };

  const confCls = confColor === 'green' ? 'text-green-700 bg-green-50 border-green-200'
    : confColor === 'yellow' ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-red-700 bg-red-50 border-red-200';

  // group categories by parent
  const parentCats = categories.filter(c => !c.parent);
  const childCats = (parent: string) => categories.filter(c => c.parent === parent);

  const saveToGarage = async () => {
    if (!user) { window.location.href = "/auth"; return; }
    if (!vehicle) return;
    setSavingGarage(true);
    try {
      await api2.post("/api/garage", {
        brand: vehicle.make,
        model: vehicle.model,
        year: vehicle.year ? parseInt(vehicle.year) : null,
        engine: vehicle.engine,
        vehicleId: vehicleId || null,
      });
      setSavedToGarage(true);
      toast.success("garage saved");
    } catch (e) { toast.error("error"); }
    setSavingGarage(false);
  };

  return (
    <div className="page-container py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-2xl font-extrabold text-dark">🔍 VIN ძებნა</h1>
        <Link href="/vin-batch" className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">📋 Batch B2B</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {[{key:'manual',label:'⌨️ ხელით'},{key:'camera',label:'📷 სკანი'},{key:'history',label:'🕐 ისტორია'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t.key?'bg-white shadow text-dark':'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Manual */}
      {tab === 'manual' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">VIN კოდი</label>
          <div className="flex gap-2">
            <input value={vin} onChange={e => { setVin(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={e => e.key==='Enter' && search()} maxLength={17}
              placeholder="1HGCM82633A004352"
              className="input-field flex-1 font-mono text-sm tracking-widest" />
            <button onClick={() => search()} disabled={loading || vin.length !== 17}
              className="btn-primary px-5 disabled:opacity-50">
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">{vin.length}/17</span>
            {vin.length === 17 && <span className="text-xs text-green-600">✓ სწორი სიგრძე</span>}
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {/* Camera */}
      {tab === 'camera' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 space-y-3">
          <p className="text-sm text-gray-500">სურათიდან ავტომატურად წავიკითხავთ VIN კოდს</p>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => e.target.files?.[0] && handleOCR(e.target.files[0])} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleOCR(e.target.files[0])} />
          <button onClick={() => cameraRef.current?.click()} disabled={ocrLoading}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
            {ocrLoading ? '⏳ იკითხება...' : '📷 კამერით გადაღება'}
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={ocrLoading}
            className="w-full border border-gray-200 rounded-xl py-3 text-sm font-medium hover:bg-gray-50">
            🖼️ გალერეიდან არჩევა
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-700 font-medium mb-1">📍 VIN სად არის?</p>
            <ul className="text-xs text-blue-600 space-y-0.5">
              <li>• მძღოლის კარის ჩარჩოზე</li>
              <li>• საქარე მინის ქვედა ნაწილში</li>
              <li>• სადაზღვევო პოლისში</li>
            </ul>
          </div>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-400"><p className="text-3xl mb-2">🕐</p><p>ისტორია ცარიელია</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((h, i) => (
                <button key={i} onClick={() => { setVin(h.vin); setTab('manual'); search(h.vin); }}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 text-left">
                  <div>
                    <p className="font-mono text-xs text-gray-400">{h.vin}</p>
                    <p className="font-medium text-sm">{h.make} {h.model} {h.year}</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multi Vehicle Selector */}

      {multiVehicles.length > 0 && !vehicle && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm font-bold text-blue-700 mb-3">🚗 აირჩიეთ თქვენი მანქანის ვარიანტი:</p>
          <div className="space-y-2">
            {multiVehicles.map((v: any) => (
              <button key={v.vehicleId}
                onClick={() => {
                  const vid = String(v.vehicleId);
                  setMultiVehicles([]);
                  setVehicleId(vid);
                  setVehicle({ make: v.make || v.carName.split(' ')[0], model: v.model || v.carName.split(' ').slice(1,3).join(' '), year: v.year || null, engine: v.engine || null, fuel: null, chassis: null });
                  loadCats(vid);
                  setConfMsg('✅ match დადასტურებულია');
                }}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium text-gray-800">
                {v.carName}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Vehicle Result */}
      {vehicle && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className={`rounded-xl px-4 py-2 border text-sm font-medium mb-3 ${confCls}`}>{confMsg}</div>
            <div className="flex items-center gap-4 mb-3">
              {carImage ? (
                <img src={carImage} alt={vehicle.make || ''} 
                  className="w-24 h-16 object-contain rounded-xl bg-white border border-gray-100 p-1 flex-shrink-0"
                  onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
              ) : vehicle.make ? (
                <img src={`https://img.autodoc.de/logo/${vehicle.make.toLowerCase().replace(/\s+/g,'-')}.png`}
                  alt={vehicle.make}
                  className="w-16 h-16 object-contain rounded-xl bg-white border border-gray-100 p-2 flex-shrink-0"
                  onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
              ) : null}
              <p className="text-xl font-extrabold text-dark">{vehicle.make} {vehicle.model} {vehicle.year}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                {label:'⚙️ ძრავი', value: vehicle.engine ? vehicle.engine.replace(/\s+/g,' · ') : null},
                {label:'⛽ საწვავი', value: vehicle.fuel},
                {label:'🚗 კუზოვი', value: vehicle.chassis},
                {label:'💪 სიმძლავრე', value: (vehicle as any).engineDetails ? (vehicle as any).engineDetails.powerKw+'kW / '+(vehicle as any).engineDetails.powerPs+'PS' : null},
                {label:'🔄 მომენტი', value: (vehicle as any).engineDetails ? (vehicle as any).engineDetails.torqueNm+'Nm' : null},
                {label:'🔩 ცილინდრი', value: (vehicle as any).engineDetails ? (vehicle as any).engineDetails.cylinders+' cyl' : null},
              ].filter(x=>x.value).map(x => (
                <div key={x.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{x.label}</p>
                  <p className="text-sm font-medium">{x.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-bold text-dark mb-3">🔩 ამ მანქანის ნაწილები</h2>
            <AutodocCategoryTree className="w-full" vehicleId={vehicleId || undefined} />
          </div>

          {/* Parts */}
          {selCat && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-dark">{selCat.name}</h3>
                {partsCount > 0 && <span className="text-xs text-gray-400">{partsCount} ნაწილი</span>}
              </div>
              {/* Supplier Filter */}
              {parts.length > 0 && !partsLoading && (() => {
                const suppliers = Array.from(new Set(parts.map((p:any)=>p.supplierName).filter(Boolean))).slice(0,8) as string[];
                return (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">ბრენდი:</span>
                    <button onClick={()=>setSupplierFilter('')}
                      className={`px-2 py-1 text-xs rounded-lg border transition-colors ${!supplierFilter?'border-blue-500 bg-blue-50 text-blue-600':'border-gray-200 text-gray-500'}`}>
                      ყველა
                    </button>
                    {suppliers.map((s:string)=>(
                      <button key={s} onClick={()=>setSupplierFilter(s===supplierFilter?'':s)}
                        className={`px-2 py-1 text-xs rounded-lg border transition-colors ${supplierFilter===s?'border-blue-500 bg-blue-50 text-blue-600':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                );
              })()}
              {partsLoading ? (
                <div className="text-center py-6 text-gray-400">⏳ იტვირთება...</div>
              ) : parts.length === 0 ? (
                <div className="text-center py-6 text-gray-400">ნაწილები ვერ მოიძებნა</div>
              ) : (
                <>
                {/* Best/Budget/Premium cards */}
                {(() => {
                  const inStockParts = parts.filter((p:any) => p.inStock && p.product);
                  if (inStockParts.length < 2) return null;
                  const sorted = [...inStockParts].sort((a:any,b:any) => Number(a.product?.price||0) - Number(b.product?.price||0));
                  const budget = sorted[0];
                  const premium = sorted[sorted.length-1];
                  const best = sorted[Math.floor(sorted.length/2)] || sorted[0];
                  const budgetId = budget.product ? budget.product.id : null;
                  const premiumId = premium.product ? premium.product.id : null;
                  const options = budgetId === premiumId
                    ? [{label:'✅ საუკეთესო', color:'blue', p: best}]
                    : [{label:'✅ საუკეთესო', color:'blue', p: best},{label:'💰 იაფი', color:'green', p: budget},{label:'⭐ პრემიუმ', color:'purple', p: premium}];
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {options.map(({label,color,p}:any) => (
                        <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3`}>
                          <p className={`text-xs font-bold text-${color}-700 mb-1`}>{label}</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.supplierName}</p>
                          <p className="text-xs text-gray-500 truncate">{p.articleNo}</p>
                          <p className={`text-lg font-bold text-${color}-700 mt-1`}>{p.product?.price}₾</p>
                          <div className="flex gap-1 mt-2">
                            <a href={`/products/${p.product?.id}`} target="_blank"
                              className={`flex-1 text-center text-xs bg-${color}-600 text-white px-2 py-1.5 rounded-lg`}>
                              ნახვა
                            </a>
                            <a href={`https://wa.me/995577575052?text=${encodeURIComponent(`${label}: ${p.product?.nameKa} - ${p.product?.price}₾`)}`}
                              target="_blank" className="flex-1 text-center text-xs bg-green-500 text-white px-2 py-1.5 rounded-lg">
                              📱
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="space-y-3">
                  {parts.filter((p:any)=>!supplierFilter||p.supplierName===supplierFilter).slice(0, 20).map((p: any, idx: number) => (
                    <div key={idx} className={`flex gap-3 p-3 border rounded-xl ${p.inStock ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                      {p.image ? (
                        <img src={p.image} alt={p.articleProductName} className="w-16 h-16 object-contain rounded-lg bg-white border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">🔩</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-dark truncate">{p.articleProductName}</p>
                        {p.altCodes && p.altCodes.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">{p.altCodes.slice(0,2).join(' · ')}</p>
                        )}
                        {p.inStock && p.product ? (
                          <div className="mt-1">
                            <p className="text-xs text-gray-600 truncate">{p.product.nameKa?.slice(0,50)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-bold text-green-700">{p.product.price} ₾</span>
                              <span className="text-xs text-green-600">✓ მარაგშია ({p.product.stock})</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <a href={`/products/${p.product.id}`} target="_blank"
                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                                ნახვა
                              </a>
                              <a href={`https://wa.me/995577575052?text=${encodeURIComponent(`გამარჯობა! ${p.product.nameKa} - ${p.product.price}₾ - ${vehicle?.make} ${vehicle?.model} ${vehicle?.year}`)}`}
                                target="_blank" className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">
                                📱 შეკვეთა
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <p className="text-xs text-gray-400">სტოქში არ არის</p>
                            <a href={`https://wa.me/995577575052?text=${encodeURIComponent(`გამარჯობა! გინდა შეკვეთო: ${p.articleProductName} - ${vehicle?.make} ${vehicle?.model} ${vehicle?.year}`)}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 mt-1.5 bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800">
                              📱 შეკვეთა
                              </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function VINPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>}>
      <VINPageInner />
    </Suspense>
  );
}
