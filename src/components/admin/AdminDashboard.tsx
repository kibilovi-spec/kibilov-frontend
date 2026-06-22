'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from './AdminLayout';
import { useLang, useAuth } from '@/store';
import api from '@/lib/api';
import Link from 'next/link';
import { useAdminSocket } from '@/hooks/useAdminSocket';

interface DashboardData {
  totalOrders: number; todayOrders: number;
  totalRevenue: number; todayRevenue: number;
  totalUsers: number; totalProducts: number;
  lowStock: number; pendingOrders: number;
  recentOrders: any[]; ordersByStatus: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED:    'bg-indigo-100 text-indigo-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
};
const STATUS_KA: Record<string, string> = {
  PENDING:'მოლოდინში', CONFIRMED:'დადასტურებული', PROCESSING:'მუშავდება',
  SHIPPED:'გაიგზავნა', DELIVERED:'ჩაბარდა', CANCELLED:'გაუქმდა',
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<any>(null);

  useEffect(() => {
    api.get('/api/admin/daily-visitors').then(r => setVisitors(r.data)).catch(() => {});
  }, []);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useAdminSocket((order) => {
    setLiveOrders(prev => [order, ...prev].slice(0, 5));
    // browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🛒 ახალი შეკვეთა!', {
        body: `${order.customer} — ${parseFloat(String(order.total)).toFixed(2)}₾`,
      });
    }
  });

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    api.get('/api/admin/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const StatCard = ({ icon, label, value, sub, color }: any) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color || 'text-gray-800'}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    </AdminLayout>
  );

  const d = data || {} as DashboardData;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard</h1>

        {/* Daily Visitors Widget */}
        {visitors && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['👥 დღეს სტუმარი', visitors.today, 'text-blue-600'],
              ['📅 კვირაში', visitors.week, 'text-purple-600'],
              ['🔍 დღეს ძებნა', visitors.todaySearches, 'text-green-600'],
              ['📦 დღეს შეკვეთა', visitors.todayOrders, 'text-orange-600'],
            ].map(([label, val, color]) => (
              <div key={label as string} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className={`text-3xl font-bold ${color}`}>{val || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Live Orders */}
        {liveOrders.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-bold text-green-800 mb-3">🔴 Live — ახალი შეკვეთები</p>
            <div className="space-y-2">
              {liveOrders.map((o, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-green-100">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 text-lg">🛒</span>
                    <span className="text-sm font-medium">{o.customer}</span>
                    <span className="text-xs text-gray-400">{o.items} ნაწ.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-green-700">{parseFloat(o.total).toFixed(2)}₾</span>
                    <span className="text-xs text-gray-400">{new Date(o.ts).toLocaleTimeString('ka-GE')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="📦" label="სულ შეკვეთები" value={d.totalOrders ?? 0} sub={`დღეს: ${d.todayOrders ?? 0}`} />
          <StatCard icon="💰" label="შემოსავალი" value={`${(d.totalRevenue ?? 0).toFixed(0)}₾`} sub={`დღეს: ${(d.todayRevenue ?? 0).toFixed(0)}₾`} color="text-green-600" />
          <StatCard icon="👥" label="მომხმარებლები" value={d.totalUsers ?? 0} />
          <StatCard icon="🛍️" label="პროდუქტები" value={d.totalProducts ?? 0} sub={d.lowStock ? `⚠️ ${d.lowStock} ბოლოვდება` : undefined} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(d.pendingOrders ?? 0) > 0 && (
            <Link href="/admin/orders?status=PENDING" className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 hover:bg-yellow-100 transition">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-semibold text-yellow-800">{d.pendingOrders} მოლოდინის შეკვეთა</p>
                <p className="text-sm text-yellow-600">დამუშავება სჭირდება</p>
              </div>
              <span className="ml-auto text-yellow-600">→</span>
            </Link>
          )}
          {(d.lowStock ?? 0) > 0 && (
            <Link href="/admin/products?filter=lowStock" className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 hover:bg-red-100 transition">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-800">{d.lowStock} პროდუქტი ბოლოვდება</p>
                <p className="text-sm text-red-600">მარაგის განახლება საჭიროა</p>
              </div>
              <span className="ml-auto text-red-600">→</span>
            </Link>
          )}
        </div>
        {d.ordersByStatus && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">შეკვეთები სტატუსის მიხედვით</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(d.ordersByStatus).map(([st, cnt]) => (
                <Link key={st} href={`/admin/orders?status=${st}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${STATUS_COLORS[st] || 'bg-gray-100 text-gray-700'} hover:opacity-80 transition`}>
                  {STATUS_KA[st] || st}: <strong>{cnt}</strong>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">ბოლო შეკვეთები</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">ყველა →</Link>
            <Link href="/admin/analytics" className="text-sm text-purple-600 hover:underline ml-4">📊 AI ანალიტიკა →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['#','მომხმარებელი','სულ','გადახდა','სტატუსი','თარიღი'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(d.recentOrders||[]).map((o:any)=>(
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-500">#{o.id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3"><p className="font-medium">{o.user?.name||'—'}</p><p className="text-gray-400 text-xs">{o.user?.phone||''}</p></td>
                    <td className="px-4 py-3 font-semibold">{parseFloat(o.total).toFixed(2)}₾</td>
                    <td className="px-4 py-3 text-gray-500">{o.paymentMethod}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]||'bg-gray-100'}`}>{STATUS_KA[o.status]||o.status}</span></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString('ka-GE')}</td>
                  </tr>
                ))}
                {!(d.recentOrders?.length)&&<tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">შეკვეთები არ არის</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}