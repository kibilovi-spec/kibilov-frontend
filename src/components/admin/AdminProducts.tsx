'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

export function AdminProducts() {
  const sp = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLow, setFilterLow] = useState(sp?.get('filter')==='lowStock');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<any>(null);
  const [stockVal, setStockVal] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({nameKa:'',nameEn:'',sku:'',brand:'',price:'',stock:'',description:''});
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.q = search;
      if (filterLow) params.inStock = 'false';
      const r = await api.get('/api/products', { params });
      setProducts(r.data.data || r.data.products || []);
      setTotalPages(r.data.pagination?.pages || r.data.totalPages || 1);
    } catch(e){ console.error(e); } finally { setLoading(false); }
  }, [page, search, filterLow]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStock = async () => {
    if (!editing) return;
    try {
      await api.patch(`/api/admin/products/${editing.id}/stock`, { stock: parseInt(stockVal) });
      setEditing(null); fetch();
    } catch { alert('შეცდომა'); }
  };

  const syncFina = async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const r = await api.post('/api/fina/sync');
      setSyncMsg(`✅ სინქრ.: ${r.data.synced} პროდ. | ${r.data.updated} განახლ.`);
      fetch();
    } catch { setSyncMsg('❌ სინქრ. შეცდომა'); } finally { setSyncing(false); }
  };

  const addProduct = async () => {
    if (!newProduct.nameKa || !newProduct.sku) return alert('სახელი და SKU სავალდებულოა');
    setSaving(true);
    try {
      await api.post('/api/products', {
        ...newProduct,
        price: parseFloat(newProduct.price)||0,
        stock: parseInt(newProduct.stock)||0,
      });
      setAdding(false);
      setNewProduct({nameKa:'',nameEn:'',sku:'',brand:'',price:'',stock:'',description:''});
      fetch();
    } catch(e:any){ alert('შეცდომა: '+e.message); } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800">🛍️ პროდუქტები</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={syncFina} disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60">
              {syncing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : '🔄'}
              FINA სინქრ.
            </button>
            <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-green-700 transition">
              📥 Excel Import
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={async(e)=>{
                const file = e.target.files?.[0]; if(!file) return;
                const fd = new FormData(); fd.append('file', file);
                try {
                  const r = await api.post('/api/admin/products/import', fd, {headers:{'Content-Type':'multipart/form-data'}});
                  alert(`დამატდა: ${r.data.added}, განახლდა: ${r.data.updated}`);
                  fetch();
                } catch(e:any){ alert('შეცდომა: '+e.message); }
              }} />
            </label>
            <button onClick={()=>setAdding(true)}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition">
              ➕ პროდუქტის დამატება
            </button>
          </div>
        </div>
        {syncMsg && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">{syncMsg}</div>}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="🔍 სახელი, SKU, ბრენდი..."
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={filterLow} onChange={e=>{ setFilterLow(e.target.checked); setPage(1); }} className="rounded"/>
            ⚠️ ბოლოვდება
          </label>
          <button onClick={fetch} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">განახლება</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['SKU','სახელი','ბრენდი','ფასი','მარაგი','სტატუსი',''].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">პროდუქტები ვერ მოიძებნა</td></tr>
                ) : products.map((p:any) => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${p.stock <= 3 ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 object-cover rounded-lg" alt=""/>}
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{p.nameKa||p.nameEn||'—'}</p>
                          <p className="text-xs text-gray-400">{p.category?.nameKa||''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.brand||'—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{parseFloat(p.price).toFixed(2)}₾</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.stock === 0 ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">გათავდა</span>
                      : p.stock <= 3 ? <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">ბოლოვდება</span>
                      : <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">მარაგშია</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={()=>{setEditing(p);setStockVal(String(p.stock));}} className="text-blue-600 hover:underline text-xs">მარაგი</button>
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

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setEditing(null)}>
