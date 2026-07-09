'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/store';
import { usePageTitle } from '@/hooks/usePageTitle';

const ZONES = [
  { id: 'RUSTAVI', name: 'რუსთავი', fee: 0 },
  { id: 'TBILISI', name: 'თბილისი', fee: 5 },
  { id: 'MTSKHETA', name: 'მცხეთა', fee: 7 },
  { id: 'GORI', name: 'გორი', fee: 8 },
  { id: 'KUTAISI', name: 'ქუთაისი', fee: 10 },
  { id: 'OTHER', name: 'სხვა', fee: 10 },
];

export default function CheckoutPage() {
  usePageTitle('შეკვეთის გაფორმება | kibilov.ge');
  const router = useRouter();
  const { clearCart } = useCart();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    city: 'რუსთავი',
    street: '',
    apartment: '',
    zone: 'RUSTAVI',
    phone: '',
    note: '',
  });

  useEffect(() => {
    api.get('/api/cart').then(r => setCart(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const zone = ZONES.find(z => z.id === form.zone);
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = subtotal >= 150 ? 0 : (zone?.fee || 0);
  const total = subtotal + deliveryFee;

  const submit = async () => {
    if (!form.street) return setError('შეიყვანეთ მისამართი');
    if (!form.phone) return setError('შეიყვანეთ ტელეფონი');
    setSubmitting(true); setError('');
    try {
      const r = await api.post('/api/orders', {
        deliveryZone: form.zone,
        address: { city: form.city, street: form.street, apartment: form.apartment },
        phone: form.phone,
        note: form.note,
        paymentMethod: 'CASH',
      });
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          transaction_id: r.data.order.id,
          value: parseFloat(r.data.order.total||0),
          currency: 'GEL',
        });
      }
      clearCart();
      router.push(`/orders/${r.data.order.id}?success=1`);
    } catch(e: any) {
      setError(e.response?.data?.message || 'შეცდომა');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (!cart?.items?.length) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl mb-4">🛒</p>
        <p className="text-gray-500 mb-4">კალათა ცარიელია</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-xl">მთავარი</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 შეკვეთის გაფორმება</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ფორმა */}
          <div className="lg:col-span-2 space-y-4">
            {/* მიტანის ზონა */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">📍 მიტანის მისამართი</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ქალაქი / რაიონი</label>
                  <select value={form.zone} onChange={e => {
                    const z = ZONES.find(x => x.id === e.target.value);
                    setForm({...form, zone: e.target.value, city: z?.name || ''});
                  }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {ZONES.map(z => <option key={z.id} value={z.id}>{z.name} {z.fee === 0 ? '— უფასო' : `— ${z.fee}₾`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ქუჩა, სახლი *</label>
                  <input value={form.street} onChange={e => setForm({...form, street: e.target.value})}
                    placeholder="მაგ: მშვიდობის გამზირი 5"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ბინა / სართული</label>
                  <input value={form.apartment} onChange={e => setForm({...form, apartment: e.target.value})}
                    placeholder="მაგ: ბინა 12"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ტელეფონი *</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+995 5XX XXX XXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">შენიშვნა კურიერისთვის</label>
                  <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
                    placeholder="სპეციალური მითითება..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
                </div>
              </div>
            </div>

            {/* გადახდა */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">💳 გადახდის მეთოდი</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-blue-500 rounded-xl cursor-pointer bg-blue-50">
                  <input type="radio" name="payment" value="CASH" defaultChecked className="w-4 h-4 accent-blue-600"/>
                  <div>
                    <p className="font-bold text-gray-800">💵 მიწოდებისას გადახდა</p>
                    <p className="text-xs text-gray-500">კურიერს გადაიხდით ნაღდად ან ბარათით მიღებისას</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-50">
                  <input type="radio" name="payment" value="CARD" disabled className="w-4 h-4"/>
                  <div>
                    <p className="font-bold text-gray-400">💳 ონლაინ გადახდა</p>
                    <p className="text-xs text-gray-400">მალე დაემატება — BOG / TBC</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* შეჯამება */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-4">
              <h2 className="font-bold text-gray-800 mb-4">📋 შეკვეთის შეჯამება</h2>
              <div className="space-y-3 mb-4">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex-1 mr-2">{item.nameKa || item.nameEn} × {item.qty}</span>
                    <span className="font-medium">{(Number(item.price) * item.qty).toFixed(2)}₾</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>პროდუქტი</span>
                  <span>{Number(subtotal).toFixed(2)}₾</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>მიტანა</span>
                  <span>{deliveryFee === 0 ? '🎉 უფასო' : `${deliveryFee}₾`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2">
                  <span>სულ</span>
                  <span className="text-blue-600">{total.toFixed(2)}₾</span>
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mt-3">{error}</div>}
              <button onClick={submit} disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-700 transition disabled:opacity-60">
                {submitting ? '⏳ მუშავდება...' : '✅ შეკვეთის დადასტურება'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">მენეჯერი დაგიკავშირდება 30 წუთში</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
