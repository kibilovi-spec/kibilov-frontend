'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ProductCard } from '@/components/shop/index';
import { useLang } from '@/store';

const BRAND_LOGOS: Record<string, string> = {
  'TRW': '🔵', 'Bosch': '🔴', 'NGK': '⚡', 'KYB': '🟡',
  'Monroe': '🟠', 'Sachs': '🔷', 'MANN': '🟤', 'Mahle': '🔶',
  'ATE': '🟣', 'Brembo': '🔴', 'Ferodo': '🟢', 'Textar': '🔵',
};

export default function BrandPage({ brand }: { brand: string }) {
  const { lang } = useLang();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/api/products', { params: { brand, limit: 24, page } })
      .then(r => {
        setProducts(r.data.data || []);
        setTotal(r.data.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brand, page]);

  const logo = BRAND_LOGOS[brand] || '🔧';
  const totalPages = Math.ceil(total / 24);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl">
              {logo}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{brand}</h1>
              <p className="text-gray-500">{total} ნაწილი</p>
            </div>
          </div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">მთავარი</Link>
            <span>›</span>
            <Link href="/products" className="hover:text-blue-600">პროდუქტები</Link>
            <span>›</span>
            <span className="text-gray-800 font-medium">{brand}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse"/>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-500">{brand} ბრენდის ნაწილები ვერ მოიძებნა</p>
            <Link href="/products" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl">
              ყველა პროდუქტი
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50">←</button>
                <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50">→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
