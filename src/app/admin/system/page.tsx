'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function SystemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    api.get('/api/admin/system').then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

  if (loading && !data) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  const d = data || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">⚙️ System Observability</h1>
          <button onClick={refresh} className="text-sm text-blue-600 hover:underline">🔄 განახლება</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['DB Latency', `${d.db?.latency || 0}ms`, d.db?.latency < 100 ? 'text-green-600' : 'text-red-600'],
            ['Redis Latency', d.redis?.latency ? `${d.redis.latency}ms` : 'DOWN', d.redis?.status === 'ok' ? 'text-green-600' : 'text-red-600'],
            ['Memory', `${d.process?.memory || 0}MB`, d.process?.memory < 200 ? 'text-green-600' : 'text-yellow-600'],
            ['Uptime', `${Math.round((d.process?.uptime || 0) / 60)}წთ`, 'text-blue-600'],
          ].map(([l,v,c]) => (
            <div key={l as string} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className={`text-2xl font-bold ${c}`}>{v}</p>
              <p className="text-sm text-gray-500 mt-1">{l}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">🗄️ Database</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-gray-600">Status</span><span className={`text-sm font-bold ${d.db?.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{d.db?.status === 'ok' ? '✅ Online' : '❌ Slow'}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Latency</span><span className="text-sm font-bold">{d.db?.latency}ms</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">⚡ Redis Cache</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-gray-600">Status</span><span className={`text-sm font-bold ${d.redis?.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{d.redis?.status === 'ok' ? '✅ Online' : '❌ Down'}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Cached Keys</span><span className="text-sm font-bold">{d.redis?.keys || 0}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Latency</span><span className="text-sm font-bold">{d.redis?.latency || '-'}ms</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">🖥️ Process</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-gray-600">Memory Used</span><span className="text-sm font-bold">{d.process?.memory}MB / {d.process?.memoryTotal}MB</span></div>
              <div className="mt-2 bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.round((d.process?.memory / d.process?.memoryTotal) * 100)}%`}}/></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Environment</span><span className="text-sm font-bold">{d.env}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">🔗 Services</h2>
            {[
              ['Autodoc API', true, 'Pro Plan'],
              ['Claude AI', true, 'API'],
              ['Cloudinary CDN', true, 'Free 25GB'],
              ['Telegram Bot', true, 'Webhook'],
              ['BOG/TBC', false, 'Pending'],
            ].map(([name, ok, note]) => (
              <div key={name as string} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm">{name as string}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{note as string}</span>
                  <span>{ok ? '✅' : '🔴'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-right">ბოლო განახლება: {d.ts ? new Date(d.ts).toLocaleTimeString('ka-GE') : '-'} · ავტო-განახლება 30წმ</p>
      </div>
    </AdminLayout>
  );
}
