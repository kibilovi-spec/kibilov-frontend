'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/store';
import Link from 'next/link';

export function BulkOrderPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([{ sku: '', qty: '1' }]);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const addRow = () => setRows([...rows, { sku: '', qty: '1' }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, val: string) => {
    const r = [...rows];
    r[i] = { ...r[i], [field]: val };
    setRows(r);
  };

  const getQuote = async () => {
    const items = rows.filter(r => r.sku.trim());
    if (!items.length) return alert('შეავსეთ SKU');
    setLoading(true);
    try {
      const r = await api.post('/api/bulk/quote', { items: items.map(i => ({ sku: i.sku, qty: parseInt(i.qty)||1 })) });
      setQuote(r.data);
    } catch(e: any) { alert(e.response?.data?.error || 'შეცდომა'); }
    setLoading(false);
  };

  const placeOrder = async () => {
    const items = rows.filter(r => r.sku.trim());
    setLoading(true);
    try {
      await api.post('/api/bulk/order', { items: items.map(i => ({ sku: i.sku, qty: parseInt(i.qty)||1 })) });
      setOrdered(true);
    } catch(e: any) { alert(e.response?.data?.error || 'შეცდომა'); }
    setLoading(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">გთხოვთ გაიაროთ ავტორიზაცია</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">მთავარი</Link>
      </div>
    </div>
  );

  if (ordered) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">შეკვეთა გაიგზავნა!</h2>
        <p className="text-gray-500 mb-6">თქვენი Bulk შეკვეთა მიღებულია. მალე დაგიკავშირდებით.</p>
        <Link href="/orders" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">შეკვეთები</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">📋 Bulk შეკვეთა</h1>
          <p className="text-gray-500 text-sm">მრავალი პროდუქტი ერთდროულად — B2B ფასებით</p>
          {user.b2bStatus === 'APPROVED' && (
            <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              🏢 B2B — {user.b2bDiscount || 0}% ფასდაკლება
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">პროდუქტების სია</h2>
            <button onClick={addRow} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">+ სტრიქონი</button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
              <div className="col-span-7">SKU / კოდი</div>
              <div className="col-span-3">რაოდ.</div>
              <div className="col-span-2"></div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input value={row.sku} onChange={e => updateRow(i, 'sku', e.target.value)}
                  placeholder="SKU-001 ან OEM კოდი"
                  className="col-span-7 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <input value={row.qty} onChange={e => updateRow(i, 'qty', e.target.value)}
                  type="number" min="1" placeholder="1"
                  className="col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <button onClick={() => removeRow(i)} className="col-span-2 text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={getQuote} disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-60">
              {loading ? 'იტვირთება...' : '🔍 ფასის კალკულაცია'}
            </button>
            <button onClick={placeOrder} disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-60">
              {loading ? 'იგზავნება...' : '📦 შეკვეთა'}
            </button>
          </div>
        </div>

        {quote && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">💰 კალკულაცია</h2>
            <div className="space-y-2 mb-4">
              {quote.data.map((item: any, i: number) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${item.error ? 'bg-red-50' : item.inStock ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <div>
                    <span className="font-mono text-sm font-bold">{item.sku}</span>
                    {item.nameKa && <span className="text-sm text-gray-600 ml-2">{item.nameKa}</span>}
                    {item.error && <span className="text-sm text-red-600 ml-2">{item.error}</span>}
                  </div>
                  {!item.error && (
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{item.lineTotal}₾</div>
                      <div className="text-xs text-gray-500">{item.qty} × {item.unitPrice}₾</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <div>
                <span className="text-gray-500 text-sm">სულ:</span>
                {quote.discount > 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">B2B -{quote.discount}%</span>}
              </div>
              <span className="text-2xl font-extrabold text-gray-800">{quote.total}₾</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
