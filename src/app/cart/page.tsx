'use client';
import { useState, useEffect } from 'react';
import { useCart, useAuth } from '@/store';
import { useLang } from '@/store';
import { useT } from '@/lib/i18n';
import Link from 'next/link';
import { openAuth } from '@/components/layout/Header';
import { usePageTitle } from '@/hooks/usePageTitle';

// ჯავშნის დარჩენილი დროის ფორმატირება (MM:SS), null თუ ჯავშანი არ არსებობს/ამოიწურა
function formatReservation(reservedUntil?: string | null): { text: string; urgent: boolean } | null {
  if (!reservedUntil) return null;
  const diffMs = new Date(reservedUntil).getTime() - Date.now();
  if (diffMs <= 0) return { text: 'ჯავშანი ამოიწურა', urgent: true };
  const totalSec = Math.floor(diffMs / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return { text: `${mm}:${ss.toString().padStart(2, '0')}`, urgent: totalSec < 180 };
}

export default function CartPage() {
  const { items, removeItem, updateItem, fetchCart } = useCart();
  const total = items.reduce((s:number, i:any) => s + (Number(i.price||i.product?.price||0) * i.quantity), 0);
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT(lang);
  usePageTitle('კალათა | kibilov.ge');

  // ყოველ წამში "tick" — countdown-ების განახლებისთვის
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-6xl mb-4">🛒</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">კალათა ცარიელია</h1>
      <p className="text-gray-500 mb-6">დაამატეთ პროდუქტები სავაჭროდ</p>
      <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">
        პროდუქტები →
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 კალათა ({items.length} ნაწილი)</h1>

        <div className="space-y-4 mb-6">
          {items.map((item: any) => (
            <div key={item.productId} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
              {(item.images?.[0]||item.product?.images?.[0]) && (
                <img src={item.images?.[0]||item.product?.images?.[0]} alt={(item.name||item.product?.nameKa||'')} className="w-16 h-16 object-contain rounded-xl bg-gray-50"/>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                <p className="text-blue-600 font-bold">{Number((item.price||item.product?.price||0)).toFixed(2)}₾</p>
                {(() => {
                  const r = formatReservation(item.reservedUntil);
                  if (!r) return null;
                  return (
                    <p className={`text-xs mt-1 font-medium ${r.urgent ? 'text-red-600' : 'text-gray-400'}`}>
                      ⏱ დაცულია: {r.text}
                    </p>
                  );
                })()}
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => updateItem(item.productId, Math.max(1, item.quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 text-lg">−</button>
                <span className="px-3 py-2 font-semibold border-x border-gray-200">{item.quantity}</span>
                <button onClick={() => updateItem(item.productId, item.quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50 text-lg">+</button>
              </div>
              <p className="font-bold text-gray-800 min-w-16 text-right">{((Number(item.price||item.product?.price||0) * item.quantity)).toFixed(2)}₾</p>
              <button onClick={() => removeItem(item.productId)}
                className="text-red-400 hover:text-red-600 text-xl ml-2">✕</button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">სულ:</span>
            <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)}₾</span>
          </div>
          <div className="space-y-3">
            <a href={`https://wa.me/995577575052?text=${encodeURIComponent(`გამარჯობა! მინდა შეძენა: ${items.map((i:any)=>`${i.product?.nameKa || i.name || ''} x${i.quantity}`).join(', ')} | სულ: ${total.toFixed(2)}₾`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600">
              📱 WhatsApp-ით შეკვეთა
            </a>
            <button onClick={() => { if (!user) { openAuth(); return; } }}
              className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-xl font-bold hover:bg-blue-50">
              💳 ონლაინ გადახდა (მალე)
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xl">🚚</p>
              <p className="text-xs text-gray-600 mt-1">უფასო მიტანა</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xl">🔄</p>
              <p className="text-xs text-gray-600 mt-1">14 დღე დაბრუნება</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xl">✅</p>
              <p className="text-xs text-gray-600 mt-1">გარანტია</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
