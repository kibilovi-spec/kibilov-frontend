'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLang } from '@/store';
import api from '@/lib/api';
import Link from 'next/link';

const STATUS_BADGES: Record<string, string> = {
  SALE: 'bg-red-500 text-white',
  NEW: 'bg-blue-500 text-white',
  TOP: 'bg-yellow-400 text-black',
  HOT: 'bg-orange-500 text-white',
};

export function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const NAME = (c: any) => {
    if (!c) return '';
    // Backend returns pre-formatted `name` OR raw nameKa/nameEn/nameRu
    if (c.nameKa || c.nameEn) return lang === 'ka' ? c.nameKa : lang === 'ru' ? (c.nameRu || c.nameKa) : (c.nameEn || c.nameKa);
    return c.name || '';
  };

  useEffect(() => {
    if (!slug) return;
    api.get(`/api/categories/${slug}`).then(r => setCategory(r.data.data || r.data)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get('/api/products', { params: { category: slug, page, limit: 12, sort } })
      .then(r => { setProducts(r.data.data || r.data.products || []); setTotal(r.data.pagination?.total || r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, page, sort]);

  const addToCart = async (productId: string) => {
    try {
      await api.post('/api/cart', { productId, quantity: 1 });
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1500);
    } catch { router.push('/auth'); }
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">მთავარი</Link>
        <span>›</span>
        <span className="text-gray-800 font-medium">{category ? NAME(category) : slug}</span>
      </div>

      {/* Category Header */}
      {category && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl p-6 mb-6 flex items-center gap-4">
          <span className="text-5xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{NAME(category)}</h1>
            <p className="text-blue-200 text-sm mt-1">{total} პროდუქტი</p>
          </div>
        </div>
      )}

      {/* Subcategories */}
      {(category?.children?.length > 0 || category?.subcategories?.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {(category.children || category.subcategories || []).map((sub: any) => (
            <Link key={sub.id} href={`/categories/${sub.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-2 hover:border-blue-500 hover:shadow-md transition min-h-[56px]">
              <span className="text-2xl flex-shrink-0">{sub.icon}</span>
              <span className="text-sm font-medium text-gray-700 min-w-0 break-words leading-tight">{NAME(sub)}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{total} შედეგი</p>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="">სტანდარტული</option>
          <option value="price_asc">ფასი: ზემოდან</option>
          <option value="price_desc">ფასი: ქვემოდან</option>
          <option value="newest">ახალი</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100"/>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-gray-500">პროდუქტები არ მოიძებნა</p>
          <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">ყველა პროდუქტი →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition group flex flex-col">
              <Link href={`/products/${p.id}`} className="relative block h-44 sm:h-36 bg-gray-50 flex items-center justify-center text-5xl">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.nameKa} className="h-full w-full object-contain p-2"/>
                ) : <span>🔧</span>}
                {p.badge && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold ${STATUS_BADGES[p.badge] || 'bg-gray-200'}`}>
                    {p.badge}
                  </span>
                )}
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs font-bold text-blue-600 mb-1">{p.brand}</p>
                <Link href={`/products/${p.id}`}>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 hover:text-blue-600">
                    {lang === 'ka' ? p.nameKa : lang === 'ru' ? p.nameRu : p.nameEn}
                  </p>
                </Link>
                <p className="text-xs text-gray-400 mb-2">{p.sku}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">{parseFloat(p.price).toFixed(2)}₾</span>
                    {p.priceOld && <span className="text-xs text-gray-400 line-through ml-1">{parseFloat(p.priceOld).toFixed(2)}₾</span>}
                  </div>
                  <button onClick={() => addToCart(p.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition ${addedId === p.id ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {addedId === p.id ? '✓' : '+'}
                  </button>
                </div>
                {p.stock === 0 && <p className="text-xs text-red-500 mt-1">არ არის მარაგში</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${page === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 hover:border-blue-500'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
