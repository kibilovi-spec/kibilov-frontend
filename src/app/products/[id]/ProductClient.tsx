'use client';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link'
import Image from 'next/image';
import { useLang, useAuth, useCart, useWishlist } from '@/store';
import { useT } from '@/lib/i18n';
import { ProductCard } from '@/components/shop/index';
import { openAuth } from '@/components/layout/Header';
import toast from 'react-hot-toast';
import { useRecentlyViewed } from '@/components/RecentlyViewed';

export default function ProductClient({ p, related: relatedProducts }: { p: any, related: any[] }) {
  const { lang } = useLang();
  const t = useT(lang);
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [compatCars, setCompatCars] = useState<any[]>([]);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatLoaded, setCompatLoaded] = useState(false);

  const [specs, setSpecs] = useState<any[]>([]);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [specsLoaded, setSpecsLoaded] = useState(false);
  const [related, setRelated] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedLoaded, setRelatedLoaded] = useState(false);

  const loadSpecs = async () => {
    if (specsLoaded) return;
    setSpecsLoading(true);
    try {
      const oem = (p.oemCodes || [])[0];
      if (oem) {
        const r = await api.get(`/api/autodoc/specs-by-oem?oem=${encodeURIComponent(oem)}`);
        setSpecs(r.data.specs || []);
        setRelated(r.data.related || []);
        setRelatedLoaded(true);
      }
    } catch {}
    setSpecsLoading(false);
    setSpecsLoaded(true);
  };

  const loadRelated = async () => {
    if (!specsLoaded) await loadSpecs();
  };

  const loadCompatCars = async () => {
    if (compatLoaded) return;
    setCompatLoading(true);
    try {
      const oem = (p.oemCodes || [])[0];
      if (oem) {
        const r = await api.get(`/api/autodoc/compatible-cars?oem=${encodeURIComponent(oem)}`);
        setCompatCars(r.data.vehicles || []);
      }
    } catch {}
    setCompatLoading(false);
    setCompatLoaded(true);
  };
  const [reviewAvg, setReviewAvg] = useState('0');
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    api.get(`/api/reviews/${p.id}`).then(r => {
      setReviews(r.data.data || []);
      setReviewAvg(r.data.average || '0');
      const mine = r.data.data?.find((r: any) => r.userId === user?.id);
      if (mine) { setMyRating(mine.rating); setMyComment(mine.comment || ''); }
    }).catch(() => {});
  }, [p.id, user?.id]);

  const submitReview = async () => {
    if (!myRating) return;
    setReviewSaving(true);
    try {
      await api.post(`/api/reviews/${p.id}`, { rating: myRating, comment: myComment });
      const r = await api.get(`/api/reviews/${p.id}`);
      setReviews(r.data.data || []);
      setReviewAvg(r.data.average || '0');
    } catch(e: any) { alert(e.response?.data?.error || 'შეცდომა'); }
    setReviewSaving(false);
  };
  const { addItem, items } = useCart();
  const { addProduct } = useRecentlyViewed();
  useEffect(() => { addProduct({ id: p.id, nameKa: p.nameKa, price: p.price, images: p.images || [], brand: p.brand }); }, [p.id]);
  const { toggle, isWished, fetchWishlist } = useWishlist();
  const wished = isWished(p.id);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const name = lang === 'ka' ? p.nameKa : lang === 'ru' ? (p.nameRu || p.nameKa) : (p.nameEn || p.nameKa);
  const inCart = items.some(i => i.productId === p.id);
  const inStock = (p.stock ?? 0) > 0;
  const discountPct = p.priceOld ? Math.round((1 - parseFloat(p.price) / parseFloat(p.priceOld)) * 100) : p.discount;
  const b2bDiscount = user?.b2bDiscount || 0;
  const b2bPrice = b2bDiscount > 0 ? parseFloat(p.price) * (1 - b2bDiscount / 100) : null;

  const handleAdd = async () => {
    if (!user) { openAuth(); return; }
    if (adding || inCart) return;
    setAdding(true);
    try {
      await addItem(p.id, qty);
      toast.success(lang === 'ka' ? 'კალათაში დაემატა! 🛒' : lang === 'ru' ? 'Добавлено в корзину!' : 'Added to cart!');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'შეცდომა');
    } finally { setAdding(false); }
  };

  return (
    <>
    {/* Sticky Add to Cart - mobile only */}
    <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden px-4 pb-2" style={{background:'linear-gradient(to top, #fff 80%, transparent)'}}>
      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={!inStock || adding || inCart}
          className={`flex-1 py-3 rounded-xl font-bold text-white text-sm shadow-lg ${inCart?'bg-green-500':!inStock?'bg-gray-300':'bg-blue-600'}`}>
          {inCart ? '✔ კალათაშია' : !inStock ? '❌ არ არის' : `🛒 ${parseFloat(p?.price||'0').toFixed(2)}₾ — კალათაში`}
        </button>
        <a href={`https://wa.me/995577575052?text=${encodeURIComponent(`გამარჯობა! მინდა: ${name} (SKU: ${p?.sku})`)}`}
          target="_blank" rel="noopener noreferrer"
          className="bg-green-500 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center">
          WA
        </a>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600">მთავარი</Link>
        <span>›</span>
        <Link href="/products" className="hover:text-blue-600">კატალოგი</Link>
        <span>›</span>
        <span className="text-gray-700 line-clamp-1">{name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center min-h-72 relative overflow-hidden">
          {p.images?.[0] ? <Image src={p.images[0]} alt={name} fill className="object-contain p-6" sizes="400px" priority/> : <span className="text-9xl">⚙️</span>}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-extrabold text-blue-600 tracking-widest mb-2">{p.brand}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 leading-tight">{name}</h1>
          <p className="text-sm text-gray-400 mb-4">SKU: <span className="font-mono text-gray-600">{p.sku}</span></p>

          <div className="mb-4">
            <div className={`p-3 rounded-xl border ${inStock ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-sm font-semibold ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                {inStock ? '✅ მარაგშია' : '❌ არ არის მარაგში'}
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">✅ ორიგინალი</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">🚚 24სთ მიტანა</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-full">🔄 14დ დაბრუნება</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full">🔒 გარანტია</span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-gray-900">{parseFloat(p.price).toFixed(2)}₾</span>
              {b2bPrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-blue-600">{b2bPrice.toFixed(2)}₾</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">B2B -{b2bDiscount}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-xl hover:bg-gray-50">−</button>
              <span className="px-4 py-3 font-semibold min-w-10 text-center border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(q => Math.min(p.stock || 99, q + 1))} className="px-4 py-3 text-xl hover:bg-gray-50">+</button>
            </div>
            <button onClick={handleAdd} disabled={!inStock || adding || inCart}
              className={`flex-1 py-3.5 rounded-xl font-bold text-white transition ${inCart ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {inCart ? '✔ კალათაშია' : `🛒 კალათაში დამატება`}
            </button>
          </div>

          <a href={`https://wa.me/995577575052?text=${encodeURIComponent(`გამარჯობა! მინდა: ${name} (SKU: ${p.sku})`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 font-bold py-3 rounded-xl hover:bg-green-50">
            WhatsApp-ით შეკვეთა
          </a>
          <button onClick={()=>{ if(!user){openAuth();return;} toggle(p.id); }}
            className={`flex items-center justify-center gap-2 border-2 py-3 rounded-xl font-bold transition ${wished?'border-red-400 text-red-500 bg-red-50':'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'}`}>
            {wished ? '❤️ სურვილების სიაში' : '🤍 სურვილების სიაში დამატება'}
          </button>

          {/* Delivery & Return */}
          <div className="mt-4 bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🚚</span>
              <div>
                <p className="text-sm font-semibold text-dark">უფასო მიტანა</p>
                <p className="text-xs text-gray-500">თბილისში — 1 სამუშაო დღე · რეგიონებში — 2-3 დღე</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-dark">ორიგინალი ნაწილი</p>
                <p className="text-xs text-gray-500">ყველა ნაწილი სერტიფიცირებული და გარანტირებული</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔄</span>
              <div>
                <p className="text-sm font-semibold text-dark">14 დღიანი დაბრუნება</p>
                <p className="text-xs text-gray-500">თუ ნაწილი არ მოგწყობათ — დავაბრუნებთ ფულს</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔧</span>
              <div>
                <p className="text-sm font-semibold text-dark">დამონტაჟება რუსთავში</p>
                <p className="text-xs text-gray-500">ჩვენი სერვისცენტრი გამართავს — +995 577 575 052</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* OEM Cross-Reference */}
    {p.oemCodes && p.oemCodes.length > 0 && (
    <div className="max-w-4xl mx-auto px-4 mt-10 pb-2">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">🔗 OEM კოდები და Cross-Reference</h2>
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">OE ნომრები (მწარმოებლის)</p>
          <div className="flex flex-wrap gap-2">
            {(p.oemCodes as string[]).filter((c:string)=>c.includes(':')).map((c:string)=>{
              const [brand, code] = c.split(':');
              return (
                <div key={c} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-bold text-gray-500">{brand.trim()}</span>
                  <span className="text-xs font-mono text-blue-700">{code.trim()}</span>
                </div>
              );
            })}
          </div>
        </div>
        {(p.oemCodes as string[]).filter((c:string)=>!c.includes(':')&&c.length>=4&&!c.startsWith('SKU')).length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Aftermarket კოდები</p>
            <div className="flex flex-wrap gap-2">
              {(p.oemCodes as string[]).filter((c:string)=>!c.includes(':')&&c.length>=4&&!c.startsWith('SKU')).map((c:string)=>(
                <span key={c} className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg">{c}</span>
              ))}
            </div>
          </div>
        )}
        {p.alternativeSearchKeys && p.alternativeSearchKeys.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Cross-Reference ანალოგები</p>
            <div className="flex flex-wrap gap-2">
              {(p.alternativeSearchKeys as string[]).slice(0,8).map((k:string)=>(
                <span key={k} className="text-xs font-mono bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg">{k}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    )}

    <div className="max-w-4xl mx-auto px-4 mt-10 pb-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <button onClick={loadCompatCars}
          className="flex items-center justify-between w-full">
          <h2 className="text-lg font-bold text-gray-800">🚗 თავსებადი მანქანები</h2>
          <span className="text-blue-600 text-sm font-medium">{compatLoaded ? `${compatCars.length} მანქანა` : 'ჩვენება →'}</span>
        </button>
        {compatLoading && <p className="text-sm text-gray-400 mt-3">⏳ იტვირთება...</p>}
        {compatLoaded && compatCars.length === 0 && <p className="text-sm text-gray-400 mt-3">მანქანები ვერ მოიძებნა</p>}
        {compatCars.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {compatCars.map((car: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium">{car.make} {car.model}</span>
                <span className="text-xs text-gray-400">{car.engine} · {car.yearFrom}{car.yearTo && car.yearTo !== car.yearFrom ? `–${car.yearTo}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Specs & Related */}
    <div className="max-w-4xl mx-auto px-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <button onClick={loadSpecs} className="flex items-center justify-between w-full">
          <h2 className="text-lg font-bold text-gray-800">📋 ტექნიკური მახასიათებლები</h2>
          <span className="text-blue-600 text-sm font-medium">{specsLoaded ? `${specs.length} პარამეტრი` : 'ჩვენება →'}</span>
        </button>
        {specsLoading && <p className="text-sm text-gray-400 mt-3">⏳ იტვირთება...</p>}
        {specsLoaded && specs.length === 0 && <p className="text-sm text-gray-400 mt-3">მახასიათებლები ვერ მოიძებნა</p>}
        {specs.length > 0 && (
          <div className="mt-4 space-y-2">
            {specs.map((s: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{s.criteriaName}</span>
                <span className="text-sm font-medium text-dark">{s.criteriaValue}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔄 ანალოგური ნაწილები</h2>
          <div className="space-y-3">
            {related.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                {a.image && <img src={a.image} alt={a.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50"/>}
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.supplier}</p>
                  <p className="text-xs text-gray-400">{a.articleNo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="max-w-4xl mx-auto px-4 pb-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ შეფასებები ({reviews.length}) · {reviewAvg}/5</h2>
      {user && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">თქვენი შეფასება:</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setMyRating(star)}
                className={`text-2xl transition ${star <= myRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
          <textarea value={myComment} onChange={e => setMyComment(e.target.value)}
            placeholder="კომენტარი" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 resize-none h-16"/>
          <button onClick={submitReview} disabled={!myRating || reviewSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
            {reviewSaving ? 'ინახება...' : 'შეფასება'}
          </button>
        </div>
      )}
      <div className="space-y-3">
        {reviews.map((rev: any) => (
          <div key={rev.id} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{rev.user?.name}</span>
              <span className="text-yellow-400">{'★'.repeat(rev.rating)}</span>
            </div>
            {rev.comment && <p className="text-sm text-gray-600">{rev.comment}</p>}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
