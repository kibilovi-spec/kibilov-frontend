'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function OrderPage() {
  const { id } = useParams();
  const sp = useSearchParams();
  const success = sp?.get('success') === '1';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) api.get(`/api/orders/${id}`).then(r => setOrder(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">შეკვეთა ვერ მოიძებნა</div>;

  const statusColors: any = { PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700', PROCESSING:'bg-purple-100 text-purple-700', SHIPPED:'bg-indigo-100 text-indigo-700', DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-700' };
  const statusNames: any = { PENDING:'განხილვაში', CONFIRMED:'დადასტურებული', PROCESSING:'მზადდება', SHIPPED:'გაგზავნილი', DELIVERED:'მიტანილი', CANCELLED:'გაუქმებული' };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h1 className="text-xl font-bold text-green-800 mb-1">შეკვეთა მიღებულია!</h1>
            <p className="text-green-600 text-sm">მენეჯერი 30 წუთში დაგიკავშირდება</p>
          </div>
        )}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">შეკვეთის ნომერი</p>
              <p className="font-mono font-bold text-gray-800">#{order.orderNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[order.status]}`}>{statusNames[order.status]}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">📍 მისამართი</p>
              <p className="font-medium">{order.deliveryAddress}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">📞 ტელეფონი</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3">📦 პროდუქტები</h2>
          <div className="space-y-2">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.product?.nameKa || item.product?.nameEn}</p>
                  <p className="text-xs text-gray-400">{item.product?.brand} × {item.qty}</p>
                </div>
                <p className="font-semibold">{(Number(item.price) * item.qty).toFixed(2)}₾</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>მიტანა</span>
              <span>{order.deliveryFee === '0' ? 'უფასო' : order.deliveryFee+'₾'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>სულ</span>
              <span className="text-blue-600">{Number(order.total).toFixed(2)}₾</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-center hover:bg-blue-700 transition">მთავარი</Link>
          <Link href="/orders" className="flex-1 border border-gray-200 py-3 rounded-xl font-bold text-center hover:bg-gray-50 transition text-gray-700">ჩემი შეკვეთები</Link>
        </div>
      </div>
    </div>
  );
}
