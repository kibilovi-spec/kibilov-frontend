'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

const STATUS_COLORS: Record<string,string> = {
  PENDING:'bg-yellow-100 text-yellow-800', CONFIRMED:'bg-blue-100 text-blue-800',
  PROCESSING:'bg-purple-100 text-purple-800', SHIPPED:'bg-indigo-100 text-indigo-800',
  DELIVERED:'bg-green-100 text-green-800', CANCELLED:'bg-red-100 text-red-800',
};
const STATUS_KA: Record<string,string> = {
  PENDING:'მოლოდინში', CONFIRMED:'დადასტურებული', PROCESSING:'მუშავდება',
  SHIPPED:'გაიგზავნა', DELIVERED:'ჩაბარდა', CANCELLED:'გაუქმდა',
};
const ALL_STATUSES = Object.keys(STATUS_KA);
const PAYMENT_KA: Record<string,string> = { BOG:'BOG', TBC:'TBC', CASH:'ნაღდი' };

export function AdminOrders() {
  const sp = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(sp?.get('status') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const r = await api.get('/api/admin/orders', { params });
      setOrders(r.data.orders || []);
      setTotalPages(Math.ceil((r.data.total || 0) / 20) || 1);
    } catch(e){ console.error(e); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      setSelected((prev: any) => prev ? { ...prev, status } : prev);
      fetchOrders();
    } catch(e){ alert('შეცდომა'); } finally { setUpdatingStatus(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">📦 შეკვეთები</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="🔍 მომხმარებელი, ტელ, ID..." className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">ყველა სტატუსი</option>
            {ALL_STATUSES.map(s=><option key={s} value={s}>{STATUS_KA[s]}</option>)}
          </select>
          <button onClick={fetchOrders} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">განახლება</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['#','მომხმარებელი','სულ','ზონა','გადახდა','სტატუსი','თარიღი',''].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">შეკვეთები ვერ მოიძებნა</td></tr>
                ) : orders.map((o:any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o.id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{o.user?.name||'—'}</p>
                      <p className="text-gray-400 text-xs">{o.user?.phone||''}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{parseFloat(o.total).toFixed(2)}₾</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.deliveryZone}</td>
                    <td className="px-4 py-3 text-gray-500">{PAYMENT_KA[o.paymentMethod]||o.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]||'bg-gray-100'}`}>
                        {STATUS_KA[o.status]||o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleString('ka-GE')}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>setSelected(o)} className="text-blue-600 hover:underline text-xs">დეტალები</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded border text-sm disabled:opacity-50">←</button>
              <span className="text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50">→</button>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">შეკვეთა #{selected.id.slice(-6).toUpperCase()}</h2>
              <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">მომხმარებელი</p><p className="font-medium">{selected.user?.name||'—'}</p></div>
                <div><p className="text-xs text-gray-500">ტელეფონი</p><p className="font-medium">{selected.user?.phone||'—'}</p></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{selected.user?.email||'—'}</p></div>
                <div><p className="text-xs text-gray-500">ზონა</p><p className="font-medium">{selected.deliveryZone}</p></div>
                <div><p className="text-xs text-gray-500">გადახდა</p><p className="font-medium">{selected.paymentMethod}</p></div>
                <div><p className="text-xs text-gray-500">თარიღი</p><p className="font-medium">{new Date(selected.createdAt).toLocaleString('ka-GE')}</p></div>
              </div>
              {selected.address && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">მისამართი</p>
                  <p className="text-sm">{selected.address.street}, {selected.address.city}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-2">პროდუქტები</p>
                <div className="space-y-2">
                  {(selected.items||[]).map((item:any,i:number)=>(
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm">{item.product?.nameKa||item.product?.nameEn||'—'}</p>
                        <p className="text-xs text-gray-500">{item.product?.sku||''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{item.qty} ც.</p>
                        <p className="font-semibold">{(parseFloat(item.price)*item.qty).toFixed(2)}₾</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
                <span className="text-sm text-gray-600">მიტანა</span>
                <span className="font-semibold">{parseFloat(selected.deliveryFee||0).toFixed(2)}₾</span>
              </div>
              <div className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                <span className="font-bold text-lg">სულ</span>
                <span className="font-bold text-xl text-green-600">{parseFloat(selected.total).toFixed(2)}₾</span>
              </div>
              {/* Status change */}
              <div>
                <p className="text-xs text-gray-500 mb-2">სტატუსის შეცვლა</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map(s=>(
                    <button key={s} onClick={()=>updateStatus(selected.id,s)} disabled={updatingStatus||selected.status===s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selected.status===s?'ring-2 ring-blue-500':''} ${STATUS_COLORS[s]||'bg-gray-100'} hover:opacity-80 disabled:opacity-50`}>
                      {STATUS_KA[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
