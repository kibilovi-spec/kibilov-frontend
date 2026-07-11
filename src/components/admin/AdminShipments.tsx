'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: 'ველოდებით დადასტურებას',
  READY_FOR_PICKUP: 'მზადაა აღებისთვის',
  COURIER_SEARCHING: 'კურიერს ვეძებთ',
  COURIER_ASSIGNED: 'კურიერი მინიჭებულია',
  PICKED_UP: 'აღებულია',
  DELIVERED: 'ჩაბარებულია',
  FAILED: 'ვერ ჩაბარდა',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-700',
  READY_FOR_PICKUP: 'bg-blue-100 text-blue-700',
  COURIER_SEARCHING: 'bg-purple-100 text-purple-700',
  COURIER_ASSIGNED: 'bg-indigo-100 text-indigo-700',
  PICKED_UP: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};
const VEHICLE_ICON: Record<string, string> = { BIKE: '🛵', CAR: '🚗', VAN: '🚐' };

export function AdminShipments() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const load = () => {
    api.get('/api/shipments/admin/all').then(r => setShipments(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const markReady = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/api/shipments/admin/${id}/ready`);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'შეცდომა');
    }
    setProcessingId(null);
  };

  const filtered = filter === 'ALL' ? shipments : shipments.filter((s: any) => s.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">🚛 შეკვეთების მიწოდება</h1>

        <div className="flex gap-2 flex-wrap">
          {['ALL', ...Object.keys(STATUS_LABELS)].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'ALL' ? 'ყველა' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <p className="text-gray-400">ამ ფილტრით შედეგი არ არის</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                {['შეკვეთა', 'წყარო', 'აღების მისამართი', 'ჩაბარების მისამართი', 'ტრანსპორტი', 'სტატუსი', 'ქმედება'].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{s.order?.orderNumber?.slice(0, 8) || s.orderId.slice(0, 8)}</td>
                    <td className="px-4 py-3">{s.pickupType === 'OWN_SHOP' ? '🏪 საკუთარი მაღაზია' : `🏭 ${s.supplier?.companyName || 'მომწოდებელი'}`}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{s.pickupAddress}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{s.deliveryAddress}</td>
                    <td className="px-4 py-3">{VEHICLE_ICON[s.vehicleType] || '📦'} {s.vehicleType}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[s.status] || s.status}</span></td>
                    <td className="px-4 py-3">
                      {s.status === 'PENDING_CONFIRMATION' && s.pickupType === 'OWN_SHOP' && (
                        <button onClick={() => markReady(s.id)} disabled={processingId === s.id}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-60">
                          {processingId === s.id ? '...' : '✅ მზადაა'}
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
