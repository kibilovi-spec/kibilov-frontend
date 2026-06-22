'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import Link from 'next/link';

export default function OemGapsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/oem-gaps').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  const coverage = data ? Math.round(((data.total - data.missingOem) / data.total) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">🔗 OEM Gap Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['სულ პროდუქტი', data?.total || 0, 'text-gray-800'],
            ['OEM Coverage', `${coverage}%`, coverage >= 95 ? 'text-green-600' : 'text-yellow-600'],
            ['OEM-ის გარეშე', data?.missingOem || 0, 'text-red-600'],
            ['Cross Ref-ის გარეშე', data?.missingCross || 0, 'text-orange-600'],
          ].map(([label, val, color]) => (
            <div key={label as string} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className={`text-3xl font-bold ${color}`}>{val}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">OEM Coverage</span>
            <span className={`font-bold ${coverage >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>{coverage}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full ${coverage >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${coverage}%`}}/>
          </div>
          <p className="text-xs text-gray-400 mt-1">მიზანი: 99% | დარჩა: {data?.missingOem || 0} პროდუქტი</p>
        </div>

        {/* By Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold">OEM ხარვეზი კატეგორიების მიხედვით</h2>
          </div>
          {(data?.byCategory || []).map((cat: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50">
              <span className="text-sm font-medium">{cat.category || 'სხვა'}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">სულ: {cat.total}</span>
                <span className={`text-sm font-bold ${cat.missing_oem > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {cat.missing_oem > 0 ? `❌ ${cat.missing_oem} აკლია` : '✅ სრული'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Missing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold">OEM-ის გარეშე პროდუქტები</h2>
          </div>
          {(data?.topMissing || []).map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium">{p.nameKa}</p>
                <p className="text-xs text-gray-400">{p.sku} · {p.brand}</p>
              </div>
              <Link href={`/admin/products?q=${p.sku}`} className="text-xs text-blue-600 hover:underline">რედაქტირება →</Link>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
