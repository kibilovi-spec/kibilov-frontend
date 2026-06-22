'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

export function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [tab, setTab] = useState('suppliers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/supplier/admin/all'),
      api.get('/api/supplier/admin/listings'),
      api.get('/api/supplier/admin/payouts'),
    ]).then(([s,l,p]) => {
      setSuppliers(s.data.data||[]);
      setListings(l.data.data||[]);
      setPayouts(p.data.data||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const updateSupplierStatus = async (id: any, status: any, commission?: any) => {
    try {
      await api.patch('/api/supplier/admin/'+id+'/status', { status, commission });
      setSuppliers(suppliers.map((s) => s.id===id ? {...s, status, commission:commission||s.commission} : s));
    } catch { alert('შეცდომა'); }
  };

  const updateListingStatus = async (id: any, status: any) => {
    try {
      await api.patch('/api/supplier/admin/listings/'+id+'/status', { status });
      setListings(listings.map((l) => l.id===id ? {...l, status} : l));
    } catch { alert('შეცდომა'); }
  };

  const sc: any = {PENDING:'bg-yellow-100 text-yellow-700',APPROVED:'bg-green-100 text-green-700',REJECTED:'bg-red-100 text-red-700',SUSPENDED:'bg-gray-100 text-gray-700',ACTIVE:'bg-blue-100 text-blue-700',INACTIVE:'bg-gray-100 text-gray-600'};
  const sl: any = {PENDING:'განხილვაში',APPROVED:'დამტკიცებული',REJECTED:'უარყოფილი',SUSPENDED:'შეჩერებული',ACTIVE:'აქტიური',INACTIVE:'არააქტიური'};

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">მომწოდებლები</h1>
        <div className="flex gap-2">
          <button onClick={()=>setTab('suppliers')} className={'px-4 py-2 rounded-lg text-sm font-bold '+(tab==='suppliers'?'bg-blue-600 text-white':'bg-gray-100 text-gray-600')}>
            მომწოდებლები ({suppliers.length})
          </button>
          <button onClick={()=>setTab('listings')} className={'px-4 py-2 rounded-lg text-sm font-bold '+(tab==='listings'?'bg-blue-600 text-white':'bg-gray-100 text-gray-600')}>
            განთავსებები ({listings.filter((l)=>l.status==='PENDING').length} ახალი)
          </button>
          <button onClick={()=>setTab('payouts')} className={'px-4 py-2 rounded-lg text-sm font-bold '+(tab==='payouts'?'bg-green-600 text-white':'bg-gray-100 text-gray-600')}>
            გადახდები ({payouts.filter((p)=>p.status==='PENDING').length} ახალი)
          </button>
        </div>

        {tab==='suppliers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['კომპანია','კონტაქტი','ტელ.','საბანკო','კომისია','სტატუსი','მოქმედება'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                : suppliers.length===0 ? <tr><td colSpan={7} className="py-12 text-center text-gray-400">მომწოდებლები არ არის</td></tr>
                : suppliers.map((s)=>(
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.companyName}</td>
                    <td className="px-4 py-3 text-gray-500">{s.contactName}<br/><span className="text-xs text-gray-400">{s.user?.email}</span></td>
                    <td className="px-4 py-3 text-gray-500">{s.phone}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.bankAccount||'—'}</td>
                    <td className="px-4 py-3">
                      <input type="number" defaultValue={s.commission} min="0" max="50" className="w-16 border border-gray-200 rounded px-2 py-1 text-xs"
                        onBlur={(e)=>updateSupplierStatus(s.id, s.status, parseFloat(e.target.value))} />%
                    </td>
                    <td className="px-4 py-3"><span className={'px-2 py-1 rounded-full text-xs font-medium '+(sc[s.status]||'')}>{sl[s.status]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {s.status!=='APPROVED' && <button onClick={()=>updateSupplierStatus(s.id,'APPROVED')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">დამტკიცება</button>}
                        {s.status!=='REJECTED' && <button onClick={()=>updateSupplierStatus(s.id,'REJECTED')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">უარი</button>}
                        {s.status!=='SUSPENDED' && <button onClick={()=>updateSupplierStatus(s.id,'SUSPENDED')} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">შეჩერება</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==='listings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['SKU','სახელი','მომწოდებელი','ფასი','მარაგი','სტატუსი','მოქმედება'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.length===0 ? <tr><td colSpan={7} className="py-12 text-center text-gray-400">განთავსებები არ არის</td></tr>
                : listings.map((l)=>(
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{l.sku}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{l.nameKa}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{l.supplier?.companyName}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-400">მომწ: {parseFloat(l.price).toFixed(2)}&#8382;</div>
                      <div className="font-semibold">{Math.round(parseFloat(l.price)*(parseFloat(l.price)<=500?1.70:1.50))}&#8382;</div>
                    </td>
                    <td className="px-4 py-3">{l.stock}</td>
                    <td className="px-4 py-3"><span className={'px-2 py-1 rounded-full text-xs font-medium '+(sc[l.status]||'')}>{sl[l.status]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {l.status==='PENDING' && (
                          <>
                            <button onClick={()=>updateListingStatus(l.id,'APPROVED')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">დამტკ.</button>
                            <button onClick={()=>updateListingStatus(l.id,'REJECTED')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">უარი</button>
                          </>
                        )}
                        {l.status==='APPROVED' && <button onClick={()=>updateListingStatus(l.id,'ACTIVE')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">გააქტ.</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==='payouts' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['კომპანია','საბანკო','თანხა','თარიღი','სტატუსი','მოქმედება'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.length===0 ? <tr><td colSpan={6} className="py-12 text-center text-gray-400">გადახდები არ არის</td></tr>
                : payouts.map((p)=>(
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.supplier?.companyName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.supplier?.bankAccount||'—'}</td>
                    <td className="px-4 py-3 font-bold text-green-700">{parseFloat(p.amount).toFixed(2)}&#8382;</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString('ka-GE')}</td>
                    <td className="px-4 py-3"><span className={'px-2 py-1 rounded-full text-xs font-medium '+(sc[p.status]||'bg-gray-100')}>{p.status==='PENDING'?'მოლოდინში':p.status==='PAID'?'გადახდილი':'—'}</span></td>
                    <td className="px-4 py-3">
                      {p.status==='PENDING' && (
                        <button onClick={async()=>{
                          await api.patch('/api/supplier/admin/payouts/'+p.id, {status:'PAID'});
                          setPayouts(payouts.map((x)=>x.id===p.id?{...x,status:'PAID'}:x));
                        }} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                          გადახდილია
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
