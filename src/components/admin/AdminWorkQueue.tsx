'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  UNKNOWN_BRAND:    'bg-orange-100 text-orange-800',
  INVALID_OEM:      'bg-red-100 text-red-800',
  DUPLICATE_SKU:    'bg-purple-100 text-purple-800',
  MISSING_CATEGORY: 'bg-yellow-100 text-yellow-800',
  PRICE_ANOMALY:    'bg-pink-100 text-pink-800',
  LOW_STOCK:        'bg-blue-100 text-blue-800',
  NO_IMAGE:         'bg-gray-100 text-gray-800',
};

export function AdminWorkQueue() {
  const { user } = useAuth();
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [zeroResults, setZeroResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    api.get('/api/admin/work-queue').then(r => {
      setQueue(r.data.queue || []);
      setZeroResults(r.data.zeroResults || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const resolve = async (id: string, syncStatus: string) => {
    await api.patch(`/api/admin/work-queue/${id}`, { syncStatus });
    setQueue(q => q.filter(p => p.id !== id));
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">⚙️ Work Queue</h1>

        {/* Queue */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold">პროდუქტები ({queue.length})</h2>
          </div>
          {queue.length === 0 ? (
            <div className="p-8 text-center text-gray-400">✅ ყველაფერი მოწესრიგებულია</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {queue.map(p => (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.nameKa}</p>
                    <p className="text-xs text-gray-400">{p.sku} · {p.brand}</p>
                    {p.syncNote && <p className="text-xs text-red-500 mt-1">{p.syncNote}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.syncStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {p.syncStatus}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => resolve(p.id, 'OK')}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">
                      ✅ OK
                    </button>
                    <button onClick={() => resolve(p.id, 'HIDDEN')}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200">
                      🙈 Hide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zero Results */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold">📊 Zero Results TOP ({zeroResults.length})</h2>
          </div>
          {zeroResults.length === 0 ? (
            <div className="p-8 text-center text-gray-400">ძებნები არ არის</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {zeroResults.map((z, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">"{z.query}"</p>
                    <p className="text-xs text-gray-400">
                      {z.makeId && `${z.makeId} `}{z.modelId && `${z.modelId} `}{z.year && z.year}
                    </p>
                  </div>
                  <a href={`/admin/products?q=${z.query}`}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">
                    + პროდუქტი
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
