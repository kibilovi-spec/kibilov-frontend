import { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/shop/index';

async function getBrandProducts(brand: string, page = 1) {
  try {
    const r = await fetch(`http://localhost:3001/api/products?brand=${encodeURIComponent(brand)}&limit=24&page=${page}`, {
      next: { revalidate: 3600 }
    });
    const data = await r.json();
    return { products: data.data || [], total: data.pagination?.total || 0 };
  } catch { return { products: [], total: 0 }; }
}

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const brand = decodeURIComponent(params.brand);
  const { total } = await getBrandProducts(brand);
  return {
    title: `${brand} ავტონაწილები საქართველოში | kibilov.ge`,
    description: `${brand} ბრენდის ${total} სათადარიგო ნაწილი. OEM კოდებით ძებნა, სწრაფი მიტანა თბილისი და რუსთავი.`,
    keywords: `${brand}, ${brand} ნაწილები, ${brand} საქართველო, ავტონაწილები`,
    openGraph: {
      title: `${brand} ავტონაწილები | kibilov.ge`,
      description: `${brand} — ${total} ნაწილი kibilov.ge-ზე`,
    },
  };
}

export default async function BrandPageSSR({ params }: { params: { brand: string } }) {
  const brand = decodeURIComponent(params.brand);
  const { products, total } = await getBrandProducts(brand);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${brand} ავტონაწილები`,
    "description": `${brand} ბრენდის სათადარიგო ნაწილები kibilov.ge-ზე`,
    "url": `https://kibilov.ge/brands/${encodeURIComponent(brand)}`,
    "numberOfItems": total,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/">მთავარი</Link>
              <span>›</span>
              <Link href="/brands">ბრენდები</Link>
              <span>›</span>
              <span className="text-gray-900 font-semibold">{brand}</span>
            </nav>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl">🔧</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{brand} ავტონაწილები</h1>
                <p className="text-gray-500">{total} ნაწილი kibilov.ge-ზე</p>
              </div>
            </div>
            <p className="mt-4 text-gray-600 text-sm max-w-2xl">
              {brand} ბრენდის ორიგინალური და ანალოგური სათადარიგო ნაწილები. OEM კოდებით ძებნა, 
              სწრაფი მიტანა თბილისი და რუსთავი. გარანტია ყველა პროდუქტზე.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>
              {total > 24 && (
                <div className="text-center">
                  <Link href={`/products?brand=${encodeURIComponent(brand)}`}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">
                    ყველა {total} ნაწილის ნახვა →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-500">ამ ბრენდის ნაწილები ჯერ არ არის დამატებული</p>
              <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">← ყველა ნაწილი</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
