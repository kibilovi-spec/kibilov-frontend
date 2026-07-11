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
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [historyModal, setHistoryModal] = useState<any>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      api.get('/api/supplier/admin/all'),
      api.get('/api/supplier/admin/listings'),
      api.get('/api/supplier/admin/payouts'),
      api.get('/api/supplier/admin/integrations'),
    ]).then(([s,l,p,i]) => {
      setSuppliers(s.data.data||[]);
      setListings(l.data.data||[]);
      setPayouts(p.data.data||[]);
      setIntegrations(i.data.data||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const updateSupplierStatus = async (id: any, status: any, commission?: any, rating?: any) => {
    try {
      await api.patch('/api/supplier/admin/'+id+'/status', { status, commission, rating });
      setSuppliers(suppliers.map((s) => s.id===id ? {...s, status, commission:commission||s.commission, rating:rating||s.rating} : s));
    } catch { alert('შეცდომა'); }
  };

  const updateListingStatus = async (id: any, status: any, note?: string) => {
    try {
      await api.patch('/api/supplier/admin/listings/'+id+'/status', { status, note });
      setListings(listings.map((l) => l.id===id ? {...l, status} : l));
    } catch { alert('შეცდომა'); }
  };

  const openHistory = async (supplier: any) => {
    setHistoryModal(supplier);
    setHistoryLoading(true);
    try {
      const res = await api.get('/api/supplier/admin/'+supplier.id+'/import-logs');
      setHistoryLogs(res.data.data || []);
    } catch { setHistoryLogs([]); }
    setHistoryLoading(false);
  };

  const downloadRejectedReport = async (logId: string) => {
    try {
      const res = await api.get('/api/supplier/admin/import-logs/'+logId+'/rejected-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rejected_${logId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('რეპორტის ჩამოტვირთვა ვერ მოხერხდა'); }
  };

  const changeIntegrationLevel = async (id: any, integrationLevel: string) => {
    try {
      await api.patch('/api/supplier/admin/'+id+'/integration', { integrationLevel });
      setIntegrations(integrations.map((i)=> i.id===id ? {...i, integrationLevel} : i));
    } catch { alert('შეცდომა Integration Level-ის შეცვლისას'); }
  };

  const regenerateApiKey = async (id: any) => {
    if (!confirm('დარწმუნებული ხართ? ძველი API Key გაუქმდება.')) return;
    try {
      const res = await api.post('/api/supplier/admin/'+id+'/api-key/regenerate', {});
      setIntegrations(integrations.map((i)=> i.id===id ? {...i, hasApiKey: true, _newKey: res.data.data.apiKey} : i));
      setRevealedKeys({...revealedKeys, [id]: true});
    } catch { alert('შეცდომა API Key-ის გენერაციისას'); }
  };

  const feedStatusBadge = (lastImport: any) => {
    if (!lastImport) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">არასდროს</span>;
    const daysSince = (Date.now() - new Date(lastImport.createdAt).getTime()) / 86400000;
    if (lastImport.status === 'FAILED') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">❌ ჩავარდა</span>;
    if (lastImport.status === 'PARTIAL') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⚠️ ნაწილობრივი</span>;
    if (daysSince > 7) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⏱️ მოძველებული</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✅ აქტიური</span>;
  };

  const sc: any = {PENDING:'bg-yellow-100 text-yellow-700',APPROVED:'bg-green-100 text-green-700',REJECTED:'bg-red-100 text-red-700',SUSPENDED:'bg-gray-100 text-gray-700',ACTIVE:'bg-blue-100 text-blue-700',INACTIVE:'bg-gray-100 text-gray-600'};
  const sl: any = {PENDING:'განხილვაში',APPROVED:'დამტკიცებული',REJECTED:'უარყოფილი',SUSPENDED:'შეჩერებული',ACTIVE:'აქტიური',INACTIVE:'არააქტიური'};

  return (
    <AdminLayout>
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-800 mb-2">❌ უარყოფის მიზეზი</h3>
            <p className="text-sm text-gray-500 mb-4">{rejectModal.nameKa}</p>
            <textarea className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full mb-4" rows={3}
              placeholder="მიუთითეთ მიზეზი (სავალდებულო)..."
              value={rejectNote} onChange={e=>setRejectNote(e.target.value)}/>
            <div className="flex gap-3">
              <button onClick={async()=>{
                if(!rejectNote.trim()) return alert('მიზეზი სავალდებულოა');
                await updateListingStatus(rejectModal.id,'REJECTED',rejectNote);
                setRejectModal(null);
              }} className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold">უარყოფა</button>
              <button onClick={()=>setRejectModal(null)} className="border border-gray-200 px-5 py-2 rounded-xl text-sm">გაუქმება</button>
            </div>
          </div>
        </div>
      )}
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
          <button onClick={()=>setTab('integrations')} className={'px-4 py-2 rounded-lg text-sm font-bold '+(tab==='integrations'?'bg-purple-600 text-white':'bg-gray-100 text-gray-600')}>
            ინტეგრაციები
          </button>
        </div>

        {tab==='suppliers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['კომპანია','კონტაქტი','ტელ.','საბანკო','ბალანსი','კომისია','რეიტინგი','სტატუსი','მოქმედება'].map(h=>(
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
                    <td className="px-4 py-3 font-medium text-green-600">{Number(s.balance||0).toFixed(2)}₾</td>
                    <td className="px-4 py-3">
                      <input type="number" defaultValue={s.commission} min="0" max="50" className="w-16 border border-gray-200 rounded px-2 py-1 text-xs"
                        onBlur={(e)=>updateSupplierStatus(s.id, s.status, parseFloat(e.target.value))} />%
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star=>(
                          <button key={star} onClick={()=>updateSupplierStatus(s.id,s.status,undefined,star)}
                            className={`text-lg ${star<=(s.rating||0)?'text-yellow-400':'text-gray-200'} hover:text-yellow-400 transition`}>★</button>
                        ))}
                      </div>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
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
                            <button onClick={()=>{setRejectModal(l);setRejectNote('');}} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">უარი</button>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
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

        {tab==='integrations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['კომპანია','Integration Level','API Key','FTP საქაღალდე','ბოლო Feed სტატუსი','მოქმედება'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {integrations.length===0 ? <tr><td colSpan={6} className="py-12 text-center text-gray-400">მომწოდებლები არ არის</td></tr>
                : integrations.map((i)=>(
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{i.companyName}</td>
                    <td className="px-4 py-3">
                      <select value={i.integrationLevel} onChange={(e)=>changeIntegrationLevel(i.id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs">
                        <option value="MANUAL">MANUAL</option>
                        <option value="EXCEL">EXCEL</option>
                        <option value="API">API</option>
                        <option value="FTP">FTP</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {i._newKey ? (
                        <span className="text-green-700 break-all">{i._newKey}</span>
                      ) : i.hasApiKey ? (
                        <span className="text-gray-400">{revealedKeys[i.id] ? '••••••••••• (დამალული უსაფრთხოებისთვის)' : '••••••••••••••••'}</span>
                      ) : (
                        <span className="text-gray-300">არ არის</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{i.ftpFolder || '—'}</td>
                    <td className="px-4 py-3">{feedStatusBadge(i.lastImport)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={()=>openHistory(i)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">ისტორია</button>
                        <button onClick={()=>regenerateApiKey(i.id)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">Key რეგენერაცია</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {historyModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">📋 Import ისტორია — {historyModal.companyName}</h3>
                <button onClick={()=>setHistoryModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>
              {historyLoading ? (
                <div className="py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></div>
              ) : historyLogs.length===0 ? (
                <div className="py-12 text-center text-gray-400">ისტორია ცარიელია</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>{['თარიღი','წყარო','ფაილი','ნაპოვნი','დამატებული','განახლებული','ჩავარდნილი','სტატუსი','მოქმედება'].map(h=>(
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyLogs.map((log:any)=>(
                      <tr key={log.id}>
                        <td className="px-3 py-2 text-gray-500">{new Date(log.createdAt).toLocaleString('ka-GE')}</td>
                        <td className="px-3 py-2">{log.source}</td>
                        <td className="px-3 py-2 text-gray-500">{log.fileName || '—'}</td>
                        <td className="px-3 py-2">{log.itemsFound}</td>
                        <td className="px-3 py-2 text-green-600">{log.itemsCreated}</td>
                        <td className="px-3 py-2 text-blue-600">{log.itemsUpdated}</td>
                        <td className="px-3 py-2 text-red-600">{log.itemsFailed}</td>
                        <td className="px-3 py-2">
                          <span className={'px-2 py-0.5 rounded-full text-xs font-medium '+(log.status==='SUCCESS'?'bg-green-100 text-green-700':log.status==='FAILED'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700')}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {log.itemsFailed > 0 && (
                            <button onClick={()=>downloadRejectedReport(log.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 whitespace-nowrap">
                              📥 Rejected
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
// support tab added via separate component
