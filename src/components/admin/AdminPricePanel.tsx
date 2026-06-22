'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export function AdminPricePanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    load();
  }, [user]);

  const load = () => {
    api.get('/api/admin/price-changes').then(r => {
      setGrouped(r.data.grouped || {});
    }).finally(() => setLoading(false));
  };

  const bulkAction = async (brand: string, action: string) => {
    setProcessing(brand + action);
    try {
      await api.post('/api/admin/price-changes/bulk', { brand, action });
      setGrouped(g => { const n = {...g}; delete n[brand]; return n; });
    } catch (e: any) {
      alert(e.response?.data?.error || 'შეცდომა');
    }
    setProcessing(null);
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div></AdminLayout>;

  const brands = Object.keys(grouped);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">💰 ფასების პანელი</h1>

        {brands.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            ✅ HOLD-ილი ფასები არ არის
          </div>
        ) : (
          <div className="space-y-4">
            {brands.map(brand => {
              const items = grouped[brand];
              const avgChange = items.reduce((s: number, i: any) => s + Number(i.changePercent), 0) / items.length;
              return (
                <div key={brand} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold">{brand}</h2>
                      <p className="text-sm text-gray-400">
                        {items.length} SKU · საშ. {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => bulkAction(brand, 'APPROVE')}
                        disabled={processing === brand + 'APPROVE'}
                        className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                        {processing === brand + 'APPROVE' ? '...' : '✅ Bulk Approve'}
                      </button>
                      <button
                        onClick={() => bulkAction(brand, 'REJECT')}
                        disabled={processing === brand + 'REJECT'}
                        className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50">
                        {processing === brand + 'REJECT' ? '...' : '❌ Reject'}
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {items.map((item: any) => (
                      <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.product.nameKa}</p>
                          <p className="text-xs text-gray-400">{item.product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="text-gray-400 line-through mr-2">{Number(item.oldPrice).toFixed(2)}₾</span>
                            <span className="font-bold">{Number(item.newPrice).toFixed(2)}₾</span>
                          </p>
                          <p className={`text-xs font-medium ${Number(item.changePercent) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Number(item.changePercent) > 0 ? '+' : ''}{Number(item.changePercent).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
