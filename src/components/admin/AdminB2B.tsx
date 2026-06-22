'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const SLA_COLORS: Record<string, string> = {
  OK:           'bg-green-100 text-green-700',
  REMINDER_24H: 'bg-yellow-100 text-yellow-700',
  ESCALATE_48H: 'bg-orange-100 text-orange-700',
  SENIOR_72H:   'bg-red-100 text-red-700',
};

export function AdminB2B() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    load();
  }, [user]);

  const load = () => {
    api.get('/api/admin/b2b/requests').then(r => {
      setRequests(r.data.requests || []);
    }).finally(() => setLoading(false));
  };

  const action = async (id: string, act: string, tier?: string) => {
    await api.patch(`/api/admin/b2b/requests/${id}`, { action: act, tier });
    setRequests(r => r.filter(u => u.id !== id));
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">🏢 B2B მოთხოვნები</h1>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex gap-4 text-sm">
              <span className="font-bold">{requests.length} pending</span>
              <span className="text-yellow-600">{requests.filter(r=>r.slaStatus==='REMINDER_24H').length} over 24h</span>
              <span className="text-orange-600">{requests.filter(r=>r.slaStatus==='ESCALATE_48H').length} over 48h</span>
              <span className="text-red-600">{requests.filter(r=>r.slaStatus==='SENIOR_72H').length} over 72h</span>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-400">✅ მოთხოვნები არ არის</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map(u => (
                <div key={u.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{u.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SLA_COLORS[u.slaStatus]}`}>
                          {u.slaHours}სთ
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{u.email} · {u.phone}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {u.b2bAppliedAt ? new Date(u.b2bAppliedAt).toLocaleDateString('ka-GE') : ''}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5" id={`tier-${u.id}`}>
                        <option value="STANDARD">STANDARD</option>
                        <option value="HIGH_VALUE">HIGH_VALUE</option>
                        <option value="FOUNDING">FOUNDING</option>
                      </select>
                      <button
                        onClick={() => {
                          const tier = (document.getElementById(`tier-${u.id}`) as HTMLSelectElement)?.value;
                          action(u.id, 'APPROVE', tier);
                        }}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                        ✅ Approve
                      </button>
                      <button onClick={() => action(u.id, 'REJECT')}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200">
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
