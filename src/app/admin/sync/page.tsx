'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function SyncPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get('/api/admin/sync').then(r => setData(r.data)).finally(() => setLoading(false)); }, []);

  const runSync = async (type: string) => {
    setSyncing(true); setMsg('');
    try {
      if (type === 'fina') {
        const r = await api.post('/api/fina/sync');
        setMsg(`✅ FINA sync: ${r.data.synced || 0} განახლდა`);
      }
    } catch(e: any) {
      setMsg(`❌ შეცდომა: ${e.response?.data?.error || e.message}`);
    }
    setSyncing(false);
  };

  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">🔄 Supplier Sync</h1>

        {msg && <div className={`p-4 rounded-xl border ${msg.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>{msg}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          {/* FINA */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">📊 FINA ERP</h2>
              <button onClick={() => runSync('fina')} disabled={syncing}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50">
                {syncing ? '...' : '🔄 Sync'}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">სულ პროდუქტი</span><span className="font-bold">{data?.lastImport?.total?.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">ბოლო import</span><span className="font-bold">{data?.lastImport?.date ? new Date(data.lastImport.date).toLocaleDateString('ka-GE') : '-'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">მეთოდი</span><span className="font-bold">Excel Import</span></div>
            </div>
          </div>

          {/* Autodoc */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">🔗 Autodoc API</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="font-bold text-green-600">✅ {data?.autodoc?.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Plan</span><span className="font-bold">{data?.autodoc?.plan}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Requests</span><span className="font-bold">{data?.autodoc?.requests}</span></div>
            </div>
          </div>

          {/* Redis */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">⚡ Redis Cache</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="font-bold text-green-600">✅ {data?.redis?.status}</span></div>
              {(data?.redis?.caches || []).map((c: string) => (
                <div key={c} className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full"/><span className="text-sm">{c}</span></div>
              ))}
            </div>
          </div>

          {/* FINA logs */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">📋 Sync ისტორია</h2>
            {(data?.finaLogs || []).length > 0 ? (
              <div className="space-y-2">
                {data.finaLogs.slice(0, 5).map((log: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{new Date(log.syncedAt).toLocaleDateString('ka-GE')}</span>
                    <span className="font-bold">{log.synced || 0} განახლდა</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">ისტორია არ არის</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
