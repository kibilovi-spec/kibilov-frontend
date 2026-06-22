'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function SearchFailuresPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/search-failures').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  const rate = data?.successRate?.rate || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">🔍 Search Failures Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className={`text-3xl font-bold ${rate >= 90 ? 'text-green-600' : rate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{rate}%</p>
            <p className="text-sm text-gray-500 mt-1">Search Success Rate</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-blue-600">{data?.successRate?.total || 0}</p>
            <p className="text-sm text-gray-500 mt-1">სულ ძებნა</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-red-600">{(data?.failures || []).length}</p>
            <p className="text-sm text-gray-500 mt-1">0 შედეგიანი ძებნა</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Search Intelligence</span>
            <span className={`font-bold ${rate >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>{rate}% → მიზანი: 99%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full ${rate >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${rate}%`}}/>
          </div>
        </div>

        {/* Trending today */}
        {data?.trending?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b"><h2 className="font-semibold">🔥 დღეს პოპულარული ძებნები</h2></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
              {data.trending.map((t: any, i: number) => (
                <div key={i} className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-blue-800">{t.query}</p>
                  <p className="text-xs text-blue-500">{t.cnt}x</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failures */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-red-50">
            <h2 className="font-semibold text-red-800">❌ 0 შედეგიანი ძებნები — CATEGORY_MAP-ში დასამატებელია</h2>
          </div>
          {(data?.failures || []).map((f: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-800">{f.query}</p>
                {f.normalized !== f.query && <p className="text-xs text-gray-400">→ {f.normalized}</p>}
              </div>
              <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-lg">{f.cnt}x</span>
            </div>
          ))}
          {!data?.failures?.length && (
            <div className="p-8 text-center text-green-600 font-bold">✅ ყველა ძებნა შედეგს პოულობს!</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
