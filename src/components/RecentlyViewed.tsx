'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/store';

const MAX_ITEMS = 8;
const KEY = 'kibilov_recently_viewed';

export function useRecentlyViewed() {
  const addProduct = (product: { id: string; nameKa: string; price: number; images: string[]; brand?: string }) => {
    try {
      const existing: any[] = JSON.parse(localStorage.getItem(KEY) || '[]');
      const filtered = existing.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch {}
  };
  return { addProduct };
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([]);
  const { lang } = useLang();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      setItems(stored);
    } catch {}
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">🕐 ბოლოს ნანახი</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {items.map(item => (
          <Link key={item.id} href={`/products/${item.id}`}
            className="bg-white rounded-xl border border-gray-200 p-2 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="aspect-square mb-2 bg-gray-50 rounded-lg overflow-hidden">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.nameKa} className="w-full h-full object-contain"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🔧</div>
              )}
            </div>
            {item.brand && <p className="text-[10px] text-gray-400 uppercase font-bold truncate">{item.brand}</p>}
            <p className="text-xs text-gray-700 line-clamp-2 leading-tight mb-1">{item.nameKa}</p>
            <p className="text-sm font-bold text-blue-600">{Number(item.price).toFixed(2)}₾</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
