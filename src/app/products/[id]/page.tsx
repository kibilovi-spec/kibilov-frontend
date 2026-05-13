'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang, useAuth, useCart } from '@/store';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';
import { ProductCard } from '@/components/shop/index';
import { Loader } from '@/components/ui/index';
import { openAuth } from '@/components/layout/Header';
import toast from 'react-hot-toast';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { lang } = useLang();
  const t = useT(lang);
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const [p, setP] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/products/${params.id}`)
      .then(({ data }) => {
        setP(data.data || data.product || data);
        setRelated(data.related || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const name = p
    ? lang === 'ka' ? p.nameKa
    : lang === 'ru' ? (p.nameRu || p.nameKa)
    : (p.nameEn || p.nameKa)
    : '';

  const inCart = items.some(i => i.productId === p?.id);
  const inStock = (p?.stock ?? 0) > 0;
  const discountPct = p?.priceOld
    ? Math.round((1 - parseFloat(p.price) / parseFloat(p.priceOld)) * 100)
    : p?.discount;

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

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12"><Loader /></div>;

  if (!p) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-gray-500 font-medium">პროდუქტი ვერ მოიძებნა</p>
      <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">← ყველა პროდუქტი</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600">მთავარი</Link>
        <span>›</span>
        <Link href="/products" className="hover:text-blue-600">კატალოგი</Link>
        <span>›</span>
        <span className="text-gray-700 line-clamp-1">{name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center min-h-72 relative overflow-hidden">
          {p.images?.[0]
            ? <img src={p.images[0]} alt={name} className="max-h-72 max-w-full object-contain p-6" />
            : <span className="text-9xl">⚙️</span>
          }
          {p.badge && (
            <span className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-sm font-bold ${
              p.badge === 'SALE' ? 'bg-red-500 text-white' :
              p.badge === 'NEW'  ? 'bg-blue-500 text-white' :
              p.badge === 'TOP'  ? 'bg-yellow-400 text-black' : 'bg-orange-500 text-white'
            }`}>{p.badge === 'SALE' && discountPct ? `-${discountPct}%` : p.badge}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs font-extrabold text-blue-600 tracking-widest mb-2">{p.brand}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 leading-tight">{name}</h1>
          <p className="text-sm text-gray-400 mb-4">
            SKU: <span className="font-mono text-gray-600">{p.sku}</span>
          </p>

          {/* Rating */}
          {p.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={s <= Math.round(p.rating) ? 'text-yellow-400 text-xl' : 'text-gray-200 text-xl'}>★</span>
              ))}
              <span className="text-sm text-gray-400">{p.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Stock info - მხოლოდ მარაგშია/არ არის, რაოდენობის გარეშე */}
          <div className="mb-4">
            {inStock ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-sm text-green-700 font-semibold">
                  ✅ {lang === 'ka' ? 'მარაგშია' : lang === 'ru' ? 'В наличии' : 'In stock'}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-sm text-red-600 font-semibold">
                  ❌ {lang === 'ka' ? 'არ არის მარაგში' : lang === 'ru' ? 'Нет в наличии' : 'Out of stock'}
                </p>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            {p.priceOld && (
              <p className="text-sm text-gray-400 line-through">{parseFloat(p.priceOld).toFixed(2)}₾</p>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-gray-900">{parseFloat(p.price).toFixed(2)}</span>
              <span className="text-2xl font-bold text-gray-900">₾</span>
              {discountPct && discountPct > 0 && (
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">-{discountPct}%</span>
              )}
            </div>
          </div>

          {/* Qty + Add button */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-4 py-3 text-xl hover:bg-gray-50 transition font-light">−</button>
              <span className="px-4 py-3 font-semibold min-w-10 text-center border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(q => Math.min(p.stock || 99, q + 1))}
                className="px-4 py-3 text-xl hover:bg-gray-50 transition font-light">+</button>
            </div>
            <button onClick={handleAdd} disabled={!inStock || adding || inCart}
              className={`flex-1 py-3.5 rounded-xl font-bold text-white transition text-sm ${
                inCart ? 'bg-green-500' :
                !inStock ? 'bg-gray-300 cursor-not-allowed' :
                adding ? 'bg-blue-400 cursor-wait' :
                'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}>
              {inCart ? '✔ კალათაშია' : adding ? '...' : `🛒 ${lang === 'ka' ? 'კალათაში დამატება' : lang === 'ru' ? 'В корзину' : 'Add to cart'}`}
            </button>
          </div>

          {/* WhatsApp */}
          <a href={`https://wa.me/995577575052?text=${encodeURIComponent(`გამარჯობა! გამაინტერესებს: ${name} (SKU: ${p.sku})`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 transition">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp-ით შეკვეთა
          </a>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">
            {lang === 'ka' ? 'მსგავსი ნაწილები' : lang === 'ru' ? 'Похожие детали' : 'Related Parts'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map(r => <ProductCard key={r.id} product={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
