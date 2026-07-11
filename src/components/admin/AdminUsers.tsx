'use client';
import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      const r = await api.get('/api/admin/users', { params });
      setUsers(r.data.users || []);
      setTotalPages(Math.ceil((r.data.total || 0) / 20) || 1);
    } catch(e){ console.error(e); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (!confirm(isAdmin ? 'ადმინი გახდეს?' : 'ადმინი ამოიღოს?')) return;
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: isAdmin ? 'ADMIN' : 'USER' });
      fetch();
    } catch { alert('შეცდომა'); }
  };
  const [garageCityDraft, setGarageCityDraft] = useState<Record<string,string>>({});
  const toggleGarage = async (userId: string, isPartnerGarage: boolean) => {
    try {
      await api.patch(`/api/admin/users/${userId}/garage`, { isPartnerGarage });
      setUsers(us => us.map((u:any)=>u.id===userId?{...u, isPartnerGarage}:u));
    } catch { alert('შეცდომა'); }
  };
  const saveGarageCity = async (userId: string) => {
    const garageCity = garageCityDraft[userId];
    if (garageCity === undefined) return;
    try {
      await api.patch(`/api/admin/users/${userId}/garage`, { garageCity });
      setUsers(us => us.map((u:any)=>u.id===userId?{...u, garageCity}:u));
    } catch { alert('შეცდომა'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">👥 მომხმარებლები</h1>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-3">
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="🔍 სახელი, Email, ტელ..."
            className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button onClick={fetch} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">ძებნა</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['სახელი','Email','ტელ.','რეგ. თარიღი','შეკვეთები','როლი','🔧 გარაჟი',''].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={8} className="py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-400">მომხმარებლები ვერ მოიძებნა</td></tr>
                ) : users.map((u:any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {(u.name||'?')[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email||'—'}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone||'—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('ka-GE')}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>setSelected(u)} className="text-blue-600 hover:underline text-xs">
                        {u._count?.orders ?? 0} შეკვ.
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role==='ADMIN'?'bg-purple-100 text-purple-800':u.role==='WHOLESALE'?'bg-blue-100 text-blue-800':u.role==='DEALER'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-600'}`}>
                        {u.role==='ADMIN'?'ადმინი':u.role==='WHOLESALE'?'საბითუმო':u.role==='DEALER'?'დილერი':'მომხ.'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" checked={!!u.isPartnerGarage}
                          onChange={e=>toggleGarage(u.id, e.target.checked)}
                          className="w-4 h-4 accent-green-600 cursor-pointer" title="პარტნიორი გარაჟი" />
                        <input value={garageCityDraft[u.id] ?? u.garageCity ?? ''}
                          onChange={e=>setGarageCityDraft(d=>({...d,[u.id]:e.target.value}))}
                          onBlur={()=>saveGarageCity(u.id)}
                          placeholder="ქალაქი"
                          className="w-20 text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role||'USER'}
                        onChange={async (e) => {
                          await api.patch(`/api/admin/users/${u.id}/role`, { role: e.target.value });
                          window.location.reload();
                        }}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 cursor-pointer">
                        <option value="USER">მომხმარებელი</option>
                        <option value="WHOLESALE">საბითუმო</option>
                        <option value="DEALER">დილერი</option>
                        <option value="ADMIN">ადმინი</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded border text-sm disabled:opacity-50">←</button>
              <span className="text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50">→</button>
            </div>
          )}
        </div>
      </div>

      {/* User Orders Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{selected.name} — შეკვეთები</h3>
              <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(selected.orders||[]).length === 0
                ? <p className="text-center text-gray-400 py-8">შეკვეთები არ არის</p>
                : (selected.orders||[]).map((o:any)=>(
                  <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="font-mono text-xs text-gray-500">#{o.id.slice(-6).toUpperCase()}</span>
                    <span className="text-sm font-semibold">{parseFloat(o.total).toFixed(2)}₾</span>
                    <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('ka-GE')}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
