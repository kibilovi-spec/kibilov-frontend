'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import api from '@/lib/api';

export default function VehicleCoveragePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/vehicle-coverage').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center">იტვირთება...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">🚗 Vehicle Coverage Dashboard</h1>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-blue-600">{data?.totalVehicles || 0}</p>
            <p className="text-sm text-gray-500 mt-1">სულ Vehicle ID</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-green-600">{data?.garageTop?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Top Garage მოდელი</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-purple-600">{data?.vinSearches?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">VIN ძებნის მარკა</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top vehicles by parts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b"><h2 className="font-semibold">🏆 ყველაზე მეტი ნაწილი</h2></div>
            {(data?.topVehicles || []).slice(0, 10).map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5">{i+1}</span>
                  <span className="text-sm font-medium">{v.manufacturer} {v.model}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{v.parts_count} ნაწ.</span>
              </div>
            ))}
          </div>

          {/* Garage top */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b"><h2 className="font-semibold">🚗 My Garage — Top მოდელები</h2></div>
            {(data?.garageTop || []).map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50">
                <span className="text-sm font-medium">{v.make} {v.model}</span>
                <span className="text-sm font-bold text-green-600">{v.garage_count} მომხ.</span>
              </div>
            ))}
            {(!data?.garageTop?.length) && <p className="p-4 text-sm text-gray-400">Garage მონაცემები არ არის</p>}
          </div>
        </div>

        {/* VIN searches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b"><h2 className="font-semibold">🔍 VIN ძებნა — მარკების მიხედვით</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
            {(data?.vinSearches || []).map((v: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="font-bold text-gray-800">{v.manufacturer}</p>
                <p className="text-xs text-gray-500">{v.searches} ძებნა</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
