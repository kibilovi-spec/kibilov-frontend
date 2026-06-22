'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/store';

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
                  value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="company@email.com" />
              </div>
              <div className="relative">
                <label className="text-xs text-gray-500 mb-1 block">პაროლი * (მინ. 6 სიმბოლო)</label>
                <input type={showPass?'text':'password'} className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••" />
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
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/supplier/me').then(r=>setSupplier(r.data.data)).catch(()=>{}).finally(()=>setLoading(false)); }, []);
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
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div><h1 className="text-2xl font-bold text-gray-800">{supplier.companyName}</h1><p className="text-gray-500 text-sm mt-1">{supplier.contactName} · {supplier.phone}</p></div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${sc[supplier.status]}`}>{sl[supplier.status]}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['📦','განთავსებები',supplier.listings?.length||0],['🛒','გაყიდვები',supplier.totalSales],['💰','ბალანსი',supplier.balance.toFixed(2)+'₾'],['📊','კომისია',supplier.commission+'%']].map(([icon,label,val])=>(
            <div key={String(label)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{icon}</div><div className="text-xl font-bold text-gray-800">{val}</div><div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        {supplier.status==='APPROVED' && <Link href="/supplier/listings" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">📦 ჩემი განთავსებები</Link>}
        {supplier.status==='APPROVED' && supplier.balance > 0 && (
          <button onClick={async () => {
            try {
              await api.post('/api/supplier/payout-request');
              alert('✅ მოთხოვნა გაიგზავნა! ადმინი 1-2 სამუშაო დღეში გადარიცხავს.');
              window.location.reload();
            } catch(e: any) { alert(e.response?.data?.message || 'შეცდომა'); }
          }} className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">
            💰 ბალანსის გამოტანა ({supplier.balance.toFixed(2)}₾)
          </button>
        )}
        {supplier.status==='PENDING' && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">⏳ თქვენი მოთხოვნა განხილვაშია.</div>}
      </div>
    </div>
  );
}

export function SupplierListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({nameKa:'',sku:'',brand:'',price:'',stock:'',description:''});
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get('/api/supplier/listings').then(r=>setListings(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  const addListing = async () => {
    if (!form.nameKa||!form.sku||!form.brand||!form.price) return alert('შეავსეთ სავალდებულო ველები');
    setSaving(true);
    try {
      const r = await api.post('/api/supplier/listings',{...form,price:parseFloat(form.price),stock:parseInt(form.stock)||0});
      setListings([r.data.data,...listings]); setAdding(false); setForm({nameKa:'',sku:'',brand:'',price:'',stock:'',description:''});
    } catch(e:any){alert(e.response?.data?.error||'შეცდომა');}
    setSaving(false);
  };
  const sc: Record<string,string>={PENDING:'bg-yellow-100 text-yellow-700',APPROVED:'bg-green-100 text-green-700',REJECTED:'bg-red-100 text-red-700',ACTIVE:'bg-blue-100 text-blue-700',INACTIVE:'bg-gray-100 text-gray-700'};
  const sl: Record<string,string>={PENDING:'განხილვაში',APPROVED:'დამტკიცებული',REJECTED:'უარყოფილი',ACTIVE:'აქტიური',INACTIVE:'არააქტიური'};
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">📦 ჩემი განთავსებები</h1>
          <button onClick={()=>setAdding(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold">+ ახალი</button>
        </div>
        {adding && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold mb-4">ახალი პროდუქტის განთავსება</h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="სახელი *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm col-span-2" value={form.nameKa} onChange={e=>setForm({...form,nameKa:e.target.value})}/>
              <input placeholder="SKU *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/>
              <input placeholder="ბრენდი *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/>
              <input placeholder="ფასი" type="number" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
              <input placeholder="მარაგი" type="number" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
              <textarea placeholder="აღწერა" className="border border-gray-200 rounded-xl px-4 py-3 text-sm col-span-2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}/>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addListing} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold disabled:opacity-60">{saving?'ინახება...':'შენახვა'}</button>
              <button onClick={()=>setAdding(false)} className="border border-gray-200 px-6 py-2 rounded-xl text-sm">გაუქმება</button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>{['SKU','სახელი','ბრენდი','ფასი','მარაგი','სტატუსი'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
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
