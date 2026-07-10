'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useLang, useAuth, useCart, useWishlist } from '@/store';
import { useT } from '@/lib/i18n';
import { openAuth } from '@/components/layout/Header';
import toast from 'react-hot-toast';

export default function ProductActions({ product }: { product: any }) {
  const { lang } = useLang();
  const t = useT(lang);
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const { toggle: toggleWishlist, isWished } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const p = product;
  const wished = isWished(p.id);
  const name = lang === 'ka' ? (p.nameKa || p.name) : (p.nameEn || p.nameKa || p.name);
  const inCart = items.some((i: any) => i.id === p.id);
  const role = (user as any)?.role;
  const price = role === 'WHOLESALE' ? p.wholesalePrice : role === 'DEALER' ? p.dealerPrice : (p.retailPrice ?? p.price);

  const handleAddToCart = async () => {
    if (!user) { openAuth(); return; }
    setAdding(true);
    try {
      await addItem({ ...p, quantity: qty });
      toast.success(lang==='en'?'Added to cart':lang==='ru'?'Добавлено в корзину':'კალათაში დაემატა');
    } catch { toast.error(lang==='en'?'Error':lang==='ru'?'Ошибка':'შეცდომა'); }
    finally { setAdding(false); }
  };

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);

  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  };

  const sendPriceRequest = async () => {
    if (!formPhone.trim()) return;
    setFormSending(true);
    try {
      await api.post('/api/delivery/price-request', {
        name: formName,
        phone: formPhone,
        product: name,
        productId: p.id,
        sku: p.sku,
      });
      setFormSent(true);
      trackEvent('price_request', { product_id: p.id, sku: p.sku, brand: p.brand });
    } catch {}
    setFormSending(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {p.stock > 0 ? lang==='en'?'In Stock ✓':lang==='ru'?'В наличии ✓':'მარაგშია ✓' : lang==='en'?'Out of Stock':lang==='ru'?'Нет в наличии':'არ არის მარაგში'}
        </span>
      </div>

      {price ? (
        <div className="text-3xl font-bold text-blue-700">
          {Number(price).toFixed(2)} ₾
        </div>
      ) : null}

      {!p.source && p.price && (
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
          {adding ? lang==='en'?'Loading...':lang==='ru'?'Загрузка...':'იტვირთება...' : inCart ? lang==='en'?'In Cart ✓':lang==='ru'?'В корзине ✓':'კალათაში ✓' : lang==='en'?'Add to Cart':lang==='ru'?'В корзину':'კალათაში დამატება'}
        </button>
      </div>
      )}

      {p.source === 'autodoc' && !price ? (
        <div>
          {!showForm && !formSent && (
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
                <p className="font-bold mb-1">📦 ნაწილი კატალოგიდან</p>
                <p className="text-xs text-blue-600">ფასი დამოკიდებულია ბრენდსა და მარაგზე. დაგვიკავშირდით — 30 წუთში გიპასუხებთ.</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                💰 ფასის გაგება — უფასოა
              </button>
            </div>
          )}
          {showForm && !formSent && (
            <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50">
              <p className="text-sm font-bold text-blue-800">ფასის მოთხოვნა</p>
              <input
                type="text"
                placeholder="თქვენი სახელი"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="tel"
                placeholder="ტელეფონი *"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={sendPriceRequest}
                  disabled={formSending || !formPhone.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
                  {formSending ? lang==='en'?'Sending...':lang==='ru'?'Отправка...':'იგზავნება...' : lang==='en'?'Send':lang==='ru'?'Отправить':'გაგზავნა'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">გაუქმება</button>
              </div>
            </div>
          )}
          {formSent && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-bold">✅ მოთხოვნა გაიგზავნა!</p>
              <p className="text-sm text-green-600 mt-1">მალე დაგიკავშირდებით</p>
            </div>
          )}
        </div>
      ) : null}
      <a href={`https://wa.me/995577575052?text=${encodeURIComponent(lang==='en'?'Hello! Interested in: ':lang==='ru'?'Здравствуйте! Интересует: ':'გამარჯობა! მაინტერესებს: ' + name + ' - https://kibilov.ge/products/' + p.id)}`}
        target="_blank"
        onClick={() => trackEvent('whatsapp_click', { product_id: p.id, sku: p.sku, brand: p.brand })}
        className="flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors">
        <span>📱</span> WhatsApp-ით შეკვეთა
      </a>
      <button
        onClick={() => { if (!user) { openAuth(); return; } toggleWishlist(p.id); }}
        className={`flex items-center justify-center gap-2 border-2 py-3 rounded-xl font-bold transition-colors ${wished ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'}`}>
        {wished ? '❤️ სურვილების სიაშია' : '🤍 სურვილების სიაში დამატება'}
      </button>
    </>
  );
}
