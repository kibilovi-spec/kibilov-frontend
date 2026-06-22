'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function InventoryPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'slow'|'fast'|'brands'>('brands');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/inventory').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  const s = data?.stats || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Inventory Intelligence</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['🏪 კატალოგის ღირებულება', `${(s.totalValue||0).toLocaleString()}₾`, 'text-blue-600'],
            ['📦 სულ მარაგი', (s.totalStock||0).toLocaleString() + ' ცალი', 'text-gray-800'],
            ['✅ მარაგშია', s.inStock||0, 'text-green-600'],
            ['❌ გათავდა', s.outOfStock||0, 'text-red-600'],
          ].map(([label, val, color]) => (
            <div key={label as string} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className={`text-2xl font-bold ${color}`}>{val}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="grid md:grid-cols-2 gap-4">
          {data?.stockRisk > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-800">{data.stockRisk} პროდუქტი — stock = 0</p>
                <p className="text-sm text-red-600">FINA import-ით განაახლე</p>
              </div>
            </div>
          )}
          {data?.overstock > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-bold text-yellow-800">{data.overstock} პროდუქტი — stock &gt; 50</p>
                <p className="text-sm text-yellow-600">Overstock — ფასდაკლება გაუკეთე</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([['brands','🏷️ ბრენდები'],['fast','🔥 ბოლოვდება'],['slow','📦 Overstock']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              background: tab === key ? '#0f172a' : '#f1f5f9',
              color: tab === key ? '#fff' : '#64748b',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer'
            }}>{label}</button>
          ))}
        </div>

        {/* Brands */}
        {tab === 'brands' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-4 p-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <span>ბრენდი</span><span className="text-center">პროდუქტი</span><span className="text-center">მარაგი</span><span className="text-center">ღირებულება</span>
            </div>
            {(data?.byBrand || []).map((b: any, i: number) => (
              <div key={i} className="grid grid-cols-4 p-3 border-t border-gray-50 hover:bg-gray-50">
                <span className="font-medium text-sm">{b.brand}</span>
                <span className="text-center text-sm">{b.total}</span>
                <span className="text-center text-sm">{b.total_stock}</span>
                <span className="text-center text-sm font-bold text-blue-600">{(b.total_value||0).toLocaleString()}₾</span>
              </div>
            ))}
          </div>
        )}

        {/* Fast movers */}
        {tab === 'fast' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-orange-50"><h2 className="font-semibold text-orange-800">🔥 ბოლოვდება (stock 1-5)</h2></div>
            {(data?.fastMovers || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border-t border-gray-50">
                <div>
                  <p className="text-sm font-medium">{p.nameKa}</p>
                  <p className="text-xs text-gray-400">{p.sku} · {p.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-600 font-bold">{p.stock} ცალი</p>
                  <p className="text-xs text-gray-400">{parseFloat(p.price).toFixed(0)}₾</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slow movers */}
        {tab === 'slow' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-blue-50"><h2 className="font-semibold text-blue-800">📦 Overstock (stock &gt; 10)</h2></div>
            {(data?.slowMovers || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border-t border-gray-50">
                <div>
                  <p className="text-sm font-medium">{p.nameKa}</p>
                  <p className="text-xs text-gray-400">{p.sku} · {p.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 font-bold">{p.stock} ცალი</p>
                  <p className="text-xs text-gray-400">{parseFloat(p.price).toFixed(0)}₾</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
