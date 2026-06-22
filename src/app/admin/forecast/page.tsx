'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function ForecastPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/admin/forecast').then(r => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">🔮 Demand Forecast</h1>
        <p className="text-sm text-gray-500">ბოლო 7 დღის ძებნების ანალიზი</p>

        {/* Low stock high demand */}
        {data?.lowStockHighDemand?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-4 border-b bg-red-50">
              <h2 className="font-semibold text-red-800">🚨 დიდი მოთხოვნა + დაბალი მარაგი — სასწრაფოდ შეავსე!</h2>
            </div>
            {data.lowStockHighDemand.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50">
                <div>
                  <p className="text-sm font-bold">{p.nameKa}</p>
                  <p className="text-xs text-gray-400">{p.sku} · {p.brand}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div><p className="text-xs text-gray-400">მარაგი</p><p className="text-red-600 font-bold">{p.stock} ცალი</p></div>
                  <div><p className="text-xs text-gray-400">ძებნა</p><p className="text-blue-600 font-bold">{p.search_count}x</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top searched */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b"><h2 className="font-semibold">🔥 ყველაზე ძებნადი (7 დღე)</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {(data?.topSearched || []).slice(0, 12).map((s: any, i: number) => (
              <div key={i} className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-bold text-blue-800 truncate">{s.query}</p>
                <p className="text-xs text-blue-500 mt-1">{s.cnt}x ძებნა</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
