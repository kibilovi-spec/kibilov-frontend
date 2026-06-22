'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function SearchQualityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/api/admin/search-quality').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);
  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;
  const d = data || {};

  const Metric = ({ label, value, rate, color }: any) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className={`text-3xl font-bold ${color}`}>{rate}%</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{value}</p>
      <div className="bg-gray-100 rounded-full h-2 mt-2">
        <div className={`h-2 rounded-full ${rate>=90?'bg-green-500':rate>=70?'bg-yellow-500':'bg-red-500'}`} style={{width:`${rate}%`}}/>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Search Quality Dashboard</h1>
        <p className="text-sm text-gray-500">AUTODOC-ის სიზუსტის შედარება — 3 მეტრიკა</p>

        <div className="grid grid-cols-3 gap-4">
          <Metric label="Vehicle Resolution" value={`${d.vehicleResolution?.resolved}/${d.vehicleResolution?.total} მანქანა`} rate={d.vehicleResolution?.rate||0} color="text-blue-600"/>
          <Metric label="OEM Coverage" value={`${d.oemCoverage?.withOem}/${d.oemCoverage?.total} პროდუქტი`} rate={d.oemCoverage?.rate||0} color="text-purple-600"/>
          <Metric label="Search Success Rate" value={`${d.searchSuccess?.successful}/${d.searchSuccess?.total} ძებნა`} rate={d.searchSuccess?.rate||0} color="text-green-600"/>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-red-50"><h2 className="font-semibold text-red-800">❌ წარუმატებელი ძებნები</h2></div>
            {(d.topFailed||[]).map((f:any,i:number) => (
              <div key={i} className="flex justify-between p-3 border-b border-gray-50 text-sm">
                <span className="font-medium">{f.query}</span>
                <span className="text-red-600 font-bold">{f.cnt}x</span>
              </div>
            ))}
            {!d.topFailed?.length && <p className="p-4 text-sm text-green-600">✅ წარუმატებელი ძებნა არ არის</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-green-50"><h2 className="font-semibold text-green-800">✅ წარმატებული ძებნები</h2></div>
            {(d.topSuccess||[]).map((f:any,i:number) => (
              <div key={i} className="flex justify-between p-3 border-b border-gray-50 text-sm">
                <span className="font-medium">{f.query}</span>
                <div className="text-right">
                  <span className="text-green-600 font-bold">{f.cnt}x</span>
                  <span className="text-gray-400 text-xs ml-2">avg: {f.avg_results}</span>
                </div>
              </div>
            ))}
            {!d.topSuccess?.length && <p className="p-4 text-sm text-gray-400">ჯერ ძებნები არ არის</p>}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-bold text-blue-800">🎯 AUTODOC-თან შედარება</p>
          <div className="grid grid-cols-3 gap-4 mt-3">
            {[
              ['Vehicle Resolution', d.vehicleResolution?.rate||0, 95],
              ['OEM Coverage', d.oemCoverage?.rate||0, 99],
              ['Search Success', d.searchSuccess?.rate||0, 90],
            ].map(([label, ours, theirs]) => (
              <div key={label as string} className="text-center">
                <p className="text-xs text-blue-600 font-bold">{label}</p>
                <p className="text-lg font-bold text-blue-800">ჩვენ: {ours}%</p>
                <p className="text-xs text-gray-500">Autodoc: ~{theirs}%</p>
                <div className="bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${Math.min(Number(ours)/Number(theirs)*100,100)}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
