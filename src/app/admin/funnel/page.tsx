'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function FunnelPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/admin/funnel').then(r => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  const funnel = data?.funnel || [];
  const maxVal = Math.max(...funnel.map((f: any) => f.value), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📈 Conversion Funnel</h1>

        <div className="grid grid-cols-3 gap-4">
          {[
            ['კონვერსია', `${data?.convRate}%`, 'text-green-600'],
            ['კალათის მიტოვება', `${data?.cartAbandon}%`, 'text-red-600'],
            ['შეკვეთის კონვერსია', `${data?.orderConv}%`, 'text-blue-600'],
          ].map(([l,v,c]) => (
            <div key={l as string} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className={`text-3xl font-bold ${c}`}>{v}</p>
              <p className="text-sm text-gray-500 mt-1">{l}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-6">Conversion Funnel</h2>
          <div className="space-y-4">
            {funnel.map((stage: any, i: number) => {
              const pct = Math.round((stage.value / maxVal) * 100);
              const dropoff = i > 0 && funnel[i-1].value > 0
                ? Math.round((1 - stage.value / funnel[i-1].value) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.icon} {stage.stage}</span>
                    <div className="flex items-center gap-3">
                      {dropoff > 0 && <span className="text-xs text-red-500">-{dropoff}%</span>}
                      <span className="text-sm font-bold">{stage.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div className="h-8 rounded-full flex items-center pl-3"
                      style={{
                        width: `${Math.max(pct, 5)}%`,
                        background: `hsl(${220 - i * 30}, 80%, ${50 + i * 5}%)`
                      }}>
                      <span className="text-white text-xs font-bold">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-800">⚠️ BOG/TBC გადახდა pending — გადახდის კონვერსია 0%-ია</p>
          <p className="text-xs text-amber-600 mt-1">credentials-ის შემდეგ ეს მეტრიკა გააქტიურდება</p>
        </div>
      </div>
    </AdminLayout>
  );
}
