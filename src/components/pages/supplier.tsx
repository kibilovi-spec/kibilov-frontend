'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth, useLang } from '@/store';
import { SupplierNotificationBell } from './SupplierNotificationBell';
import dynamic from 'next/dynamic';
const SupplierSalesChart = dynamic(() => import('./SupplierChart').then(m=>({default:m.SupplierSalesChart})), {ssr:false, loading:()=><div className='h-48 flex items-center justify-center text-gray-400'>იტვირთება...</div>});



export function SupplierRegisterPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ companyName:'', contactName:'', phone:'', address:'', taxId:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const submit = async () => {
    if (!form.companyName || !form.contactName || !form.phone) return setError('შეავსეთ სავალდებულო ველები');
    if (!form.email || !form.password) return setError('Email და პაროლი სავალდებულოა');
    if (form.password.length < 6) return setError('პაროლი მინიმუმ 6 სიმბოლო');
    if (!agreed) return setError('გთხოვთ დაეთანხმოთ პირობებს');
    setLoading(true); setError('');
    try { await api.post('/api/supplier/register', form); setSuccess(true); }
    catch(e: any) { setError(e.response?.data?.error || e.response?.data?.message || 'შეცდომა'); }
    setLoading(false);
  };
  // public form — auth required only on submit
  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">მოთხოვნა გაიგზავნა!</h2>
        <p className="text-gray-500 mb-6">Admin განიხილავს 24 საათის განმავლობაში.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">მთავარი</Link>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🏪 მომწოდებლად რეგისტრაცია</h1>
        <p className="text-gray-500 text-sm mb-6">გაყიდეთ ავტონაწილები kibilov.ge-ზე</p>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">{error}</div>}
        <div className="space-y-4">
          {[['companyName','კომპანიის სახელი *','შპს ავტონაწილები...'],['contactName','საკონტაქტო პირი *','სახელი გვარი'],['phone','ტელეფონი *','+995...'],['address','მისამართი','ქ. თბილისი...'],['taxId','საიდენტიფიკაციო კოდი','123456789'],].map(([k,l,p])=>(
            <div key={k}>
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} />
            </div>
          ))}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3 font-medium">🔐 ანგარიშის შექმნა</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                <input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="company@email.com" autoComplete="off" />
              </div>
              <div className="relative">
                <label className="text-xs text-gray-500 mb-1 block">პაროლი * (მინ. 6 სიმბოლო)</label>
                <input type={showPass?'text':'password'} className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••" autoComplete="new-password" />
                <button type="button" onClick={()=>setShowPass((p:boolean)=>!p)}
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 text-lg">{showPass?'🙈':'👁️'}</button>
              </div>
            </div>
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0" />
            <span className="text-xs text-gray-500">
              ვეთანხმები <a href="/supplier-agreement" target="_blank" className="text-blue-600 hover:underline">მომწოდებლის ხელშეკრულებას</a> და <a href="/terms" target="_blank" className="text-blue-600 hover:underline">მომსახურების პირობებს</a>
            </span>
          </label>
          <button onClick={submit} disabled={loading || !agreed} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
            {loading ? 'იგზავნება...' : 'მოთხოვნის გაგზავნა'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SupplierDashboardPage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const { lang } = useLang();
  const t = (ka:string, en:string, ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/supplier/me').then(r=>{
      setSupplier(r.data.data);
      return r.data.data;
    }).then(s=>{
      if(s?.status==='APPROVED'){
        api.get('/api/supplier/listings').then(r=>setListings(r.data.data||[])).catch(()=>{});
        api.get('/api/supplier/payouts').then(r=>setPayouts(r.data.data||[])).catch(()=>{});
        api.get('/api/supplier/sales').then(r=>setSales(r.data.data||[])).catch(()=>{});
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (!supplier) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="text-5xl mb-4">🏪</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">მომწოდებელი არ ხართ</h2>
        <p className="text-gray-500 mb-6">დარეგისტრირდით მომწოდებლად</p>
        <Link href="/supplier/register" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">რეგისტრაცია</Link>
      </div>
    </div>
  );

  const sc: Record<string,string> = {PENDING:'bg-yellow-100 text-yellow-700',APPROVED:'bg-green-100 text-green-700',REJECTED:'bg-red-100 text-red-700',SUSPENDED:'bg-gray-100 text-gray-700'};
  const sl: Record<string,string> = {PENDING:'განხილვაში',APPROVED:'დამტკიცებული',REJECTED:'უარყოფილი',SUSPENDED:'შეჩერებული'};
  const lsc: Record<string,string> = {PENDING:'bg-yellow-100 text-yellow-700',APPROVED:'bg-green-100 text-green-700',REJECTED:'bg-red-100 text-red-700',ACTIVE:'bg-blue-100 text-blue-700',INACTIVE:'bg-gray-100 text-gray-700'};
  const lsl: Record<string,string> = {PENDING:'განხილვაში',APPROVED:'დამტკიცებული',REJECTED:'უარყოფილი',ACTIVE:'აქტიური',INACTIVE:'არააქტიური'};
  const psc: Record<string,string> = {PENDING:'bg-yellow-100 text-yellow-700',PAID:'bg-green-100 text-green-700',REJECTED:'bg-red-100 text-red-700'};
  const psl: Record<string,string> = {PENDING:'განხილვაში',PAID:'გადახდილი',REJECTED:'უარყოფილი'};

  const approved = listings.filter(l=>l.status==='APPROVED'||l.status==='ACTIVE').length;
  const pending = listings.filter(l=>l.status==='PENDING').length;
  const rejected = listings.filter(l=>l.status==='REJECTED').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{supplier.companyName}</h1>
            <p className="text-gray-500 text-sm mt-1">{supplier.contactName} · {supplier.phone}</p>
          </div>
          <div className="flex items-center gap-3">
<SupplierNotificationBell />
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${sc[supplier.status]}`}>{sl[supplier.status]}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['📦',t('განთავსებები','Listings','Товары'),listings.length],['🛒',t('გაყიდვები','Sales','Продажи'),supplier.totalSales],['💰',t('ბალანსი','Balance','Баланс'),supplier.balance.toFixed(2)+'₾'],['📊',t('კომისია','Commission','Комиссия'),supplier.commission+'%']].map(([icon,label,val])=>(
            <div key={String(label)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xl font-bold text-gray-800">{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Status banner */}
        {supplier.status==='PENDING' && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">⏳ თქვენი მოთხოვნა განხილვაშია. Admin დაადასტურებს 24 საათში.</div>}
        {supplier.status==='REJECTED' && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">❌ მოთხოვნა უარყოფილია. დაუკავშირდით ადმინს.</div>}

        {supplier.status==='APPROVED' && (
          <>
            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 sm:flex-wrap">
              <Link href="/supplier/listings" className="bg-blue-600 text-white px-3 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition text-sm text-center">{t('+ ახალი','+ New','+ Новый')}</Link>
              <Link href="/supplier/listings" className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition text-sm text-center">{t('📦 განთავსებები','📦 Listings','📦 Товары')}</Link>
              <Link href="/supplier/support" className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition text-sm text-center">{t('💬 მხარდაჭერა','💬 Support','💬 Поддержка')}</Link>
              <Link href="/supplier/profile" className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition text-sm text-center">{t('⚙️ პროფილი','⚙️ Profile','⚙️ Профиль')}</Link>
              <Link href="/supplier/integration" className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition text-sm text-center">{t('🔌 ინტეგრაცია','🔌 Integration','🔌 Интеграция')}</Link>
              {supplier.balance > 0 && (
                <button onClick={async()=>{
                  try{ await api.post('/api/supplier/payout-request'); alert('✅ მოთხოვნა გაიგზავნა!'); window.location.reload(); }
                  catch(e:any){ alert(e.response?.data?.message||'შეცდომა'); }
                }} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition text-sm">
                  💰 გამოტანა ({supplier.balance.toFixed(2)}₾)
                </button>
              )}
            </div>

            {/* Listings summary */}
            {listings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">📦 {t('განთავსებები','Listings','Товары')}</h2>
                  <div className="flex gap-3 text-xs">
                    {approved>0 && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">✓ {approved} აქტიური</span>}
                    {pending>0 && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">⏳ {pending} განხილვაში</span>}
                    {rejected>0 && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">✗ {rejected} უარყოფილი</span>}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    {['SKU','სახელი','ფასი','მარაგი','სტატუსი'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.slice(0,10).map((l:any)=>(
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{l.sku}</td>
                        <td className="px-4 py-3 font-medium">{l.nameKa}</td>
                        <td className="px-4 py-3 font-semibold">{parseFloat(l.price).toFixed(2)}₾</td>
                        <td className="px-4 py-3">{l.stock}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${lsc[l.status]}`}>{lsl[l.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {listings.length>10 && <div className="px-6 py-3 text-center"><Link href="/supplier/listings" className="text-blue-600 text-sm hover:underline">ყველა {listings.length} განთავსების ნახვა →</Link></div>}
              </div>
            )}

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">📈 გაყიდვების დინამიკა</h2>
              {(() => {
                const byDate: Record<string,number> = {};
                sales.forEach((s:any) => {
                  const d = new Date(s.order.createdAt).toLocaleDateString('ka-GE',{month:'short',day:'numeric'});
                  byDate[d] = (byDate[d]||0) + parseFloat(s.total);
                });
                const chartData = Object.entries(byDate).map(([date,amount])=>({date,amount:parseFloat((amount as number).toFixed(2))}));
                return <SupplierSalesChart data={chartData}/>;
              })()}
            </div>

            {/* Sales history */}
            {sales.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">🛒 {t('გაყიდვების ისტორია','Sales History','История продаж')}</h2>
                  <span className="text-xs text-gray-500">სულ: {sales.reduce((s:number,i:any)=>s+parseFloat(i.total),0).toFixed(2)}₾</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    {['თარიღი','შეკვეთა','პროდუქტი','რაოდ.','თანხა','სტატუსი'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {sales.map((s:any)=>(
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.order.createdAt).toLocaleDateString('ka-GE')}</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600">#{s.order.orderNumber}</td>
                        <td className="px-4 py-3 font-medium">{s.nameKa}</td>
                        <td className="px-4 py-3">{s.qty}</td>
                        <td className="px-4 py-3 font-semibold">{parseFloat(s.total).toFixed(2)}₾</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{s.order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payouts history */}
            {payouts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">💳 {t('გადახდების ისტორია','Payout History','История выплат')}</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    {['თარიღი','თანხა','სტატუსი','შენიშვნა'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {payouts.map((p:any)=>(
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString('ka-GE')}</td>
                        <td className="px-4 py-3 font-semibold">{parseFloat(p.amount).toFixed(2)}₾</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${psc[p.status]}`}>{psl[p.status]}</span></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.note||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SupplierListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({nameKa:'',sku:'',brand:'',price:'',stock:'',description:'',oem:'',barcode:'',categoryId:'',image0:''});
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    api.get('/api/supplier/listings').then(r=>setListings(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
    api.get('/api/categories/all-slugs').then(r=>setCategories(r.data.data||[])).catch(()=>{});
  }, []);

  const addListing = async () => {
    if (!form.nameKa||!form.sku||!form.brand||!form.price) return alert('შეავსეთ სავალდებულო ველები');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({...form, price: parseFloat(form.price), stock: parseInt(form.stock)||0, categoryId: form.categoryId?parseInt(form.categoryId):null}).forEach(([k,v])=>fd.append(k,String(v)));
      if (imageFile) fd.append('image', imageFile);
      const r = await api.post('/api/supplier/listings', fd, {headers:{'Content-Type':'multipart/form-data'}});
      setListings([r.data.data,...listings]); setAdding(false); setForm({nameKa:'',sku:'',brand:'',price:'',stock:'',description:'',oem:'',barcode:'',categoryId:'',image0:''}); setImagePreview(null);
    } catch(e:any){alert(e.response?.data?.error||'შეცდომა');}
    setSaving(false);
  };

  const importExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true);
    const fd = new FormData(); fd.append('file', file); fd.append('markup', '0');
    try {
      const r = await api.post('/api/supplier/upload', fd, {headers:{'Content-Type':'multipart/form-data'}});
      alert(`✅ დაემატა: ${r.data.added||0}, განახლდა: ${r.data.updated||0}, გამოტოვდა: ${r.data.skipped||0}`);
      api.get('/api/supplier/listings').then(r=>setListings(r.data.data||[]));
    } catch(e:any){alert(e.response?.data?.error||'Import შეცდომა');}
    setImporting(false);
    e.target.value = '';
  };
  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({nameKa:'',price:'',stock:'',description:''});

  const deleteListing = async (id: string, status: string) => {
    if (!confirm('წაშლა დაადასტურეთ')) return;
    try {
      await api.delete(`/api/supplier/listings/${id}`);
      setListings(listings.filter((l:any)=>l.id!==id));
    } catch(e:any){ alert(e.response?.data?.error||'შეცდომა'); }
  };

  const openEdit = (l: any) => {
    setEditItem(l);
    setEditForm({nameKa:l.nameKa, price:l.price, stock:l.stock, description:l.description||''});
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      const payload: any = { stock: editForm.stock };
      if (editItem.status==='PENDING'||editItem.status==='REJECTED') {
        payload.nameKa = editForm.nameKa;
        payload.price = editForm.price;
        payload.description = editForm.description;
      }
      const r = await api.patch(`/api/supplier/listings/${editItem.id}`, payload);
      setListings(listings.map((l:any)=>l.id===editItem.id?r.data.data:l));
      setEditItem(null);
    } catch(e:any){ alert(e.response?.data?.error||'შეცდომა'); }
  };

  const sc: Record<string,string>={PENDING:'bg-yellow-100 text-yellow-700',APPROVED:'bg-green-100 text-green-700',REJECTED:'bg-red-100 text-red-700',ACTIVE:'bg-blue-100 text-blue-700',INACTIVE:'bg-gray-100 text-gray-700'};
  const sl: Record<string,string>={PENDING:'განხილვაში',APPROVED:'დამტკიცებული',REJECTED:'უარყოფილი',ACTIVE:'აქტიური',INACTIVE:'არააქტიური'};
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {editItem && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="font-bold text-gray-800 mb-4">✏️ რედაქტირება</h3>
              <div className="space-y-3">
                {(editItem.status==='PENDING'||editItem.status==='REJECTED') && (
                  <>
                    <input className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full" placeholder="სახელი" value={editForm.nameKa} onChange={e=>setEditForm({...editForm,nameKa:e.target.value})}/>
                    <input type="number" className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full" placeholder="ფასი" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})}/>
                    <textarea className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full" placeholder="აღწერა" rows={2} value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})}/>
                  </>
                )}
                <input type="number" className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full" placeholder="მარაგი" value={editForm.stock} onChange={e=>setEditForm({...editForm,stock:e.target.value})}/>
                {(editItem.status==='APPROVED'||editItem.status==='ACTIVE') && <p className="text-xs text-amber-600">⚠️ დამტკიცებულ პროდუქტზე მხოლოდ მარაგის შეცვლა შეიძლება</p>}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={saveEdit} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold">შენახვა</button>
                <button onClick={()=>setEditItem(null)} className="border border-gray-200 px-5 py-2 rounded-xl text-sm">გაუქმება</button>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">📦 ჩემი განთავსებები</h1>
          <div className="flex gap-2">
            <a href="/api/supplier/sample" download="kibilov_import.xlsx" className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">📥 ნიმუში</a>
            <a href="/api/supplier/export" download className="bg-green-100 text-green-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-200">📊 Export</a>
            <label className={`bg-purple-600 text-white px-3 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-purple-700 ${importing?'opacity-60':''}`}>
              {importing?'⏳ იტვირთება...':'📊 Excel'}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} disabled={importing}/>
            </label>
            <button onClick={()=>setAdding(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold">+ ახალი</button>
          </div>
        </div>
        {adding && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold mb-4">ახალი პროდუქტის განთავსება</h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="სახელი *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm col-span-2" value={form.nameKa} onChange={e=>setForm({...form,nameKa:e.target.value})}/>
              <input placeholder="SKU *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/>
              <input placeholder="ბრენდი *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/>
              <input placeholder="ფასი (₾) *" type="number" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
              <input placeholder="მარაგი (ცალი)" type="number" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
              <input placeholder="OEM კოდები (მძიმით: GDB1205, TRW1015)" className="border border-gray-200 rounded-xl px-4 py-3 text-sm col-span-2" value={form.oem} onChange={e=>setForm({...form,oem:e.target.value})}/>
              <input placeholder="შტრიხკოდი (EAN, არჩევითი)" className="border border-gray-200 rounded-xl px-4 py-3 text-sm col-span-2" value={form.barcode} onChange={e=>setForm({...form,barcode:e.target.value})}/>
              <div className="col-span-2 relative">
                {(() => {
                  const byId: Record<string, any> = {};
                  categories.forEach((c:any) => { byId[String(c.id)] = c; });
                  const childrenOf: Record<string, any[]> = {};
                  categories.forEach((c:any) => {
                    const pid = c.parentId ? String(c.parentId) : 'root';
                    if (!childrenOf[pid]) childrenOf[pid] = [];
                    childrenOf[pid].push(c);
                  });
                  Object.values(childrenOf).forEach((arr:any) => arr.sort((a:any,b:any)=>(a.nameKa||a.nameEn||'').localeCompare(b.nameKa||b.nameEn||'')));

                  const buildPath = (id: string): string => {
                    const path: string[] = [];
                    let cur = byId[String(id)];
                    let guard = 0;
                    while (cur && guard < 10) {
                      path.unshift(cur.nameKa || cur.nameEn);
                      cur = cur.parentId ? byId[String(cur.parentId)] : null;
                      guard++;
                    }
                    return path.join(' / ');
                  };
                  const displayVal = form.categoryId ? buildPath(form.categoryId) : '';

                  const q = catSearch.trim().toLowerCase();
                  const searchResults = q
                    ? categories.filter((c:any) => (c.nameKa||'').toLowerCase().includes(q) || (c.nameEn||'').toLowerCase().includes(q)).slice(0, 50)
                    : null;

                  const renderNode = (c:any, depth:number): any => {
                    const kids = childrenOf[String(c.id)] || [];
                    const isExpanded = expandedIds.has(String(c.id));
                    const isSelected = form.categoryId === String(c.id);
                    return (
                      <div key={c.id}>
                        <div className={`flex items-center hover:bg-gray-50 ${isSelected?'bg-blue-50':''}`} style={{paddingLeft: 12 + depth*16}}>
                          {kids.length > 0 ? (
                            <button type="button"
                              onClick={()=>setExpandedIds(prev => { const n = new Set(prev); const k=String(c.id); n.has(k)?n.delete(k):n.add(k); return n; })}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                              {isExpanded?'−':'+'}
                            </button>
                          ) : <span className="w-6 h-6 flex-shrink-0" />}
                          <button type="button"
                            onClick={()=>{ setForm({...form,categoryId:String(c.id)}); setCatOpen(false); setCatSearch(''); }}
                            className={`flex-1 text-left py-2 pr-3 text-sm ${isSelected?'text-blue-700 font-medium':'text-gray-700'}`}>
                            {c.nameKa||c.nameEn}
                          </button>
                        </div>
                        {isExpanded && kids.map((k:any)=>renderNode(k, depth+1))}
                      </div>
                    );
                  };

                  return (
                    <>
                      <button type="button"
                        onClick={()=>setCatOpen(o=>!o)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center bg-white hover:border-blue-400 transition">
                        <span className={displayVal?'text-gray-800':'text-gray-400'}>{displayVal||'-- კატეგორია / Category --'}</span>
                        <span className="text-gray-400 text-xs">{catOpen?'▲':'▼'}</span>
                      </button>
                      {catOpen && (
                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-80 overflow-y-auto">
                          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                            <input autoFocus value={catSearch} onChange={e=>setCatSearch(e.target.value)}
                              placeholder="ძებნა..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                          </div>
                          {searchResults ? (
                            searchResults.length === 0 ? (
                              <div className="px-4 py-6 text-center text-gray-400 text-sm">ვერაფერი მოიძებნა</div>
                            ) : searchResults.map((c:any) => (
                              <button key={c.id} type="button"
                                onClick={()=>{ setForm({...form,categoryId:String(c.id)}); setCatOpen(false); setCatSearch(''); }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition border-b border-gray-50 ${form.categoryId===String(c.id)?'bg-blue-50 text-blue-700 font-medium':'text-gray-700'}`}>
                                <div>{c.nameKa||c.nameEn}</div>
                                <div className="text-xs text-gray-400">{buildPath(String(c.parentId||''))}</div>
                              </button>
                            ))
                          ) : (
                            (childrenOf['root']||[]).map((c:any)=>renderNode(c, 0))
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <textarea placeholder="აღწერა" className="border border-gray-200 rounded-xl px-4 py-3 text-sm col-span-2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}/>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-2">📷 სურათი (კომპიუტერიდან / ტელეფონიდან)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 text-sm text-center cursor-pointer hover:border-blue-400 transition bg-gray-50">
                    <input type="file" accept="image/*" className="hidden" onChange={async (e)=>{
                      const file = e.target.files?.[0]; if(!file) return;
                      const fd = new FormData(); fd.append('file', file);
                      try {
                        const r = await api.post('/api/upload/image', fd, {headers:{'Content-Type':'multipart/form-data'}});
                        setImagePreview(r.data.url);
                        setForm((f:any)=>({...f, image0: r.data.url}));
                      } catch(err:any){ alert(err.response?.data?.error||'ატვირთვის შეცდომა'); }
                    }}/>
                    {imagePreview ? <span className="text-green-600 font-medium">✓ სურათი ატვირთულია</span> : <span className="text-gray-400">აირჩიეთ სურათი...</span>}
                  </label>
                  {imagePreview && <img src={imagePreview} className="w-16 h-16 object-cover rounded-xl border border-gray-200" alt="preview"/>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addListing} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold disabled:opacity-60">{saving?'ინახება...':'შენახვა'}</button>
              <button onClick={()=>setAdding(false)} className="border border-gray-200 px-6 py-2 rounded-xl text-sm">გაუქმება</button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>{['SKU','სახელი','ბრენდი','ფასი','მარაგი','სტატუსი',''].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading?<tr><td colSpan={6} className="py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
              :listings.length===0?<tr><td colSpan={6} className="py-12 text-center text-gray-400">განთავსებები არ არის</td></tr>
              :listings.map((l:any)=>(
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{l.sku}</td>
                  <td className="px-4 py-3 font-medium">{l.nameKa}</td>
                  <td className="px-4 py-3 text-gray-500">{l.brand}</td>
                  <td className="px-4 py-3 font-semibold">{parseFloat(l.price).toFixed(2)}₾</td>
                  <td className="px-4 py-3">{l.stock}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${sc[l.status]}`}>{sl[l.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(l)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">✏️</button>
                      <button onClick={()=>deleteListing(l.id, l.status)} className="text-red-500 hover:text-red-700 text-xs font-medium">🗑️</button>
                      {l.productId && (l.status==='APPROVED'||l.status==='ACTIVE') && (
                        <a href={`/products/${l.productId}`} target="_blank" className="text-green-600 hover:text-green-800 text-xs font-medium">👁️</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Supplier Dashboard ────────────────────────────────────────────────────────

export function SupplierIntegrationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const load = () => {
    api.get('/api/supplier/integration').then(r=>setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const setLevel = async (level: string) => {
    try {
      await api.patch('/api/supplier/integration', { integrationLevel: level });
      setData((d:any)=>({...d, integrationLevel: level}));
    } catch { alert('შეცდომა'); }
  };

  const generateKey = async () => {
    if (data?.apiKey && !confirm('ძველი გასაღები გაუქმდება და აღარ იმუშავებს. გავაგრძელოთ?')) return;
    setGenerating(true);
    try {
      const r = await api.post('/api/supplier/integration/api-key');
      setData((d:any)=>({...d, apiKey: r.data.apiKey}));
      setShowKey(true);
    } catch { alert('შეცდომა'); }
    setGenerating(false);
  };

  const copyKey = () => {
    if (!data?.apiKey) return;
    navigator.clipboard.writeText(data.apiKey);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  const levels = [
    { id:'MANUAL', label:'ხელით / Excel', icon:'📊', desc:'ატვირთეთ Excel ფაილი დაშბორდიდან' },
    { id:'EMAIL', label:'Email', icon:'📧', desc:'გამოგზავნეთ Excel ფაილი ელფოსტაზე' },
    { id:'FTP', label:'FTP', icon:'📁', desc:'ავტომატური სინქრონიზაცია FTP საქაღალდიდან' },
    { id:'API', label:'API', icon:'🔌', desc:'პირდაპირი ინტეგრაცია API გასაღებით' },
  ];

  const sourceLabel: Record<string,string> = { MANUAL_EXCEL:'📊 Excel', EMAIL:'📧 Email', FTP:'📁 FTP', API:'🔌 API' };
  const statusColor: Record<string,string> = { SUCCESS:'bg-green-100 text-green-700', PARTIAL:'bg-yellow-100 text-yellow-700', FAILED:'bg-red-100 text-red-700' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">🔌 ინტეგრაციის პარამეტრები</h1>
          <Link href="/supplier/dashboard" className="text-sm text-blue-600 hover:underline">← დაშბორდი</Link>
        </div>

        {/* Level selector */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-1">ინტეგრაციის დონე</h2>
          <p className="text-sm text-gray-500 mb-4">აირჩიეთ თქვენთვის მოსახერხებელი გზა პროდუქტების განახლებისთვის</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {levels.map(l => (
              <button key={l.id} onClick={()=>setLevel(l.id)}
                className={`p-4 rounded-xl border-2 text-center transition ${data?.integrationLevel===l.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-2xl mb-1">{l.icon}</div>
                <div className="text-sm font-bold text-gray-800">{l.label}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">{levels.find(l=>l.id===data?.integrationLevel)?.desc}</p>
        </div>

        {/* Email */}
        {data?.integrationLevel === 'EMAIL' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-2">📧 Email Import</h2>
            {data?.importEmail ? (
              <>
                <p className="text-sm text-gray-600 mb-2">გამოგზავნეთ Excel/CSV ფაილი (მიმაგრებული) ამ მისამართზე:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-blue-700">{data.importEmail}</div>
                <p className="text-xs text-gray-400 mt-2">სისტემა ავტომატურად ცნობს თქვენს ანგარიშს გამომგზავნის ელფოსტის მიხედვით — გამოიყენეთ ის მისამართი, რომლითაც რეგისტრირებული ხართ.</p>
              </>
            ) : (
              <p className="text-sm text-amber-600">⚠️ Email import ჯერ არ არის კონფიგურირებული სისტემაში. დაუკავშირდით ადმინისტრაციას.</p>
            )}
          </div>
        )}

        {/* API Key */}
        {data?.integrationLevel === 'API' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-2">🔌 API გასაღები</h2>
            {data?.apiKey ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-gray-700 truncate">
                  {showKey ? data.apiKey : '•'.repeat(20) + data.apiKey.slice(-6)}
                </div>
                <button onClick={()=>setShowKey(v=>!v)} className="border border-gray-200 rounded-xl px-3 py-3 text-sm hover:bg-gray-50">{showKey?'🙈':'👁️'}</button>
                <button onClick={copyKey} className="border border-gray-200 rounded-xl px-3 py-3 text-sm hover:bg-gray-50">{copied?'✓':'📋'}</button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-3">გასაღები ჯერ არ არის გენერირებული.</p>
            )}
            <button onClick={generateKey} disabled={generating} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
              {generating ? 'გენერირდება...' : data?.apiKey ? '🔄 გასაღების განახლება' : '+ გასაღების გენერაცია'}
            </button>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 font-mono overflow-x-auto">
              curl -X POST https://kibilov.ge/api/supplier/products \<br/>
              &nbsp;&nbsp;-H &quot;x-api-key: YOUR_KEY&quot; \<br/>
              &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br/>
              &nbsp;&nbsp;-d &apos;{'{'}"products":[{'{'}"sku":"ABC123","name":"...","price":10,"stock":5{'}'}]{'}'}&apos;
            </div>
          </div>
        )}

        {/* Import History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">📋 Import ისტორია</h2>
          </div>
          {(!data?.logs || data.logs.length===0) ? (
            <div className="py-10 text-center text-gray-400 text-sm">Import ისტორია ცარიელია</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                {['წყარო','ფაილი','ნაპოვნი','დამატდა','განახლდა','ვერ','სტატუსი','თარიღი'].map(h=>
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.logs.map((l:any)=>(
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{sourceLabel[l.source]||l.source}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-[120px]">{l.fileName||'—'}</td>
                    <td className="px-3 py-2">{l.itemsFound}</td>
                    <td className="px-3 py-2 text-green-600">{l.itemsCreated}</td>
                    <td className="px-3 py-2 text-blue-600">{l.itemsUpdated}</td>
                    <td className="px-3 py-2 text-red-500">{l.itemsFailed}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[l.status]||'bg-gray-100 text-gray-600'}`}>{l.status}</span></td>
                    <td className="px-3 py-2 text-xs text-gray-400">{new Date(l.createdAt).toLocaleString('ka-GE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
