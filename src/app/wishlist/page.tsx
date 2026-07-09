'use client';
import { useEffect, useState } from 'react';
import { useAuth, useLang, useWishlist } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function WishlistPage() {
  const { user, initialized } = useAuth();
  usePageTitle('სასურველები | kibilov.ge');
  const { lang } = useLang();
  const { toggle, fetchWishlist } = useWishlist();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.push('/'); return; }
    api.get('/api/wishlist').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
  }, [user, initialized]);

  const remove = async (productId: string) => {
    await toggle(productId);
    setItems(s => s.filter(i => i.productId !== productId));
  };

  if (loading) return <div className="page-container py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-dark mb-6">
        ❤️ {lang==='en'?'Wishlist':lang==='ru'?'Избранное':'სურვილების სია'}
        <span className="ml-2 text-sm font-normal text-text3">({items.length})</span>
      </h1>

      {!items.length ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🤍</div>
          <h2 className="text-xl font-bold text-dark mb-2">
            {lang==='en'?'Wishlist is empty':lang==='ru'?'Список желаний пуст':'სურვილების სია ცარიელია'}
          </h2>
          <Link href="/products" className="btn-primary px-8 mt-4 inline-block">
            {lang==='en'?'Browse Products':lang==='ru'?'Смотреть товары':'პროდუქტები'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const p = item.product;
            if (!p) return null;
            const name = lang==='ka'?p.nameKa:lang==='ru'?(p.nameRu||p.nameKa):(p.nameEn||p.nameKa);
            return (
              <div key={item.id} className="card overflow-hidden group">
                <div className="relative">
                  <Link href={`/products/${p.id}`}>
                    <div className="relative h-40 bg-gray-50 flex items-center justify-center">
                      {p.images?.[0] ? <Image src={p.images[0]} alt={name} fill className="object-contain p-3" sizes="200px"/> : <span className="text-5xl">⚙️</span>}
                    </div>
                  </Link>
                  <button onClick={()=>remove(p.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50">
                    ❤️
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-text3 font-semibold">{p.brand}</p>
                  <Link href={`/products/${p.id}`}>
                    <p className="text-sm font-semibold text-dark line-clamp-2 hover:text-primary">{name}</p>
                  </Link>
                  <p className="text-lg font-bold text-primary mt-1">{parseFloat(p.price).toFixed(2)}₾</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
