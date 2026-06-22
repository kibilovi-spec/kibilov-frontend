'use client';
import { useState } from 'react';
import { useLang, useAuth, useCart } from '@/store';
import { useT } from '@/lib/i18n';
import { openAuth } from '@/components/layout/Header';
import toast from 'react-hot-toast';

export default function ProductActions({ product }: { product: any }) {
  const { lang } = useLang();
  const t = useT(lang);
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const p = product;
  const name = lang === 'ka' ? (p.nameKa || p.name) : (p.nameEn || p.nameKa || p.name);
  const inCart = items.some((i: any) => i.id === p.id);
  const role = (user as any)?.role;
  const price = role === 'WHOLESALE' ? p.wholesalePrice : role === 'DEALER' ? p.dealerPrice : (p.retailPrice ?? p.price);

  const handleAddToCart = async () => {
    if (!user) { openAuth(); return; }
    setAdding(true);
    try {
      await addItem({ ...p, quantity: qty });
      toast.success('კალათაში დაემატა');
    } catch { toast.error('შეცდომა'); }
    finally { setAdding(false); }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {p.stock > 0 ? 'მარაგშია ✓' : 'არ არის მარაგში'}
        </span>
      </div>

      {price ? (
        <div className="text-3xl font-bold text-blue-700">
          {Number(price).toFixed(2)} ₾
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-bold">−</button>
          <span className="px-4 py-2 font-medium">{qty}</span>
          <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-gray-100 text-lg font-bold">+</button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={adding || p.stock === 0}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {adding ? 'იტვირთება...' : inCart ? 'კალათაში ✓' : 'კალათაში დამატება'}
        </button>
      </div>

      <a href={`https://wa.me/995577575052?text=${encodeURIComponent('გამარჯობა! მაინტერესებს: ' + name + ' - https://kibilov.ge/products/' + p.id)}`}
        target="_blank"
        className="flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors">
        <span>📱</span> WhatsApp-ით შეკვეთა
      </a>
    </>
  );
}
