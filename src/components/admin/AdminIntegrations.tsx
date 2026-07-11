'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

export function AdminIntegrations() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/supplier/admin/integrations')
      .then(r => setSuppliers(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const levelBadge: Record<string,string> = {
    MANUAL: 'bg-gray-100 text-gray-700',
    EMAIL: 'bg-blue-100 text-blue-700',
    FTP: 'bg-purple-100 text-purple-700',
    API: 'bg-green-100 text-green-700',
  };
  const levelIcon: Record<string,string> = { MANUAL:'📊', EMAIL:'📧', FTP:'📁', API:'🔌' };
  const statusColor: Record<string,string> = { SUCCESS:'bg-green-100 text-green-700', PARTIAL:'bg-yellow-100 text-yellow-700', FAILED:'bg-red-100 text-red-700' };

  const counts = suppliers.reduce((acc:any, s:any) => { acc[s.integrationLevel] = (acc[s.integrationLevel]||0)+1; return acc; }, {});

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">🔌 ინტეგრაციების მიმოხილვა</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['MANUAL','EMAIL','FTP','API'].map(lvl => (
            <div key={lvl} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{levelIcon[lvl]}</div>
              <div className="text-xl font-bold text-gray-800">{counts[lvl]||0}</div>
              <div className="text-xs text-gray-500">{lvl}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {['კომპანია','სტატუსი','დონე','API Key','FTP საქაღალდე','ბოლო Import','თარიღი'].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">მომწოდებლები არ არის</td></tr>
              ) : suppliers.map((s:any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.companyName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.status}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelBadge[s.integrationLevel]||'bg-gray-100 text-gray-600'}`}>
                      {levelIcon[s.integrationLevel]} {s.integrationLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.hasApiKey ? <span className="text-green-600">✓</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.ftpFolder || '—'}</td>
                  <td className="px-4 py-3">
                    {s.lastImport ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.lastImport.status]||'bg-gray-100 text-gray-600'}`}>
                        {s.lastImport.source} · {s.lastImport.itemsCreated}+{s.lastImport.itemsUpdated}
                      </span>
                    ) : <span className="text-gray-300 text-xs">არასდროს</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {s.lastImport ? new Date(s.lastImport.createdAt).toLocaleString('ka-GE') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
