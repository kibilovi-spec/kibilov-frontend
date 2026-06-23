import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductReviews from "@/components/ProductReviews";
import FitsVehicles from '@/components/FitsVehicles';
import { ProductCard } from '@/components/shop/index';
import ProductActions from '@/components/products/ProductActions';
import CrossReference from '@/components/products/CrossReference';
import FitmentBadge from '@/components/products/FitmentBadge';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getProduct(id: string) {
  try {
    const r = await fetch(`${BACKEND_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    return { product: data.data || data.product || data, related: data.related || [] };
  } catch {
    return null;
  }
}

function cleanName(raw: string) {
  return (raw || '').replace(/\s*\|[^|]*\|\s*/g, '').trim();
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const result = await getProduct(params.id);
  if (!result || !result.product) return { title: 'პროდუქტი | Kibilov AutoParts' };
  const p = result.product;
  const name = cleanName(p.nameKa || p.name);
  const description = p.description
    || `${name}${p.brand ? ' — ' + p.brand : ''}${p.oemCodes?.length ? ' — OEM: ' + p.oemCodes.slice(0,3).join(', ') : ''}. შეუკვეთეთ ონლაინ kibilov.ge-ზე, სწრაფი მიწოდება თბილისსა და რუსთავში.`;
  const image = (p.images && p.images[0]) ? `https://kibilov.ge${p.images[0]}` : undefined;
  return {
    title: `${name} | Kibilov AutoParts`,
    description,
    alternates: { canonical: `https://kibilov.ge/products/${params.id}` },
    openGraph: {
      title: name,
      description,
      url: `https://kibilov.ge/products/${params.id}`,
      images: image ? [{ url: image }] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const result = await getProduct(params.id);
  if (!result || !result.product) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-gray-500 font-medium">პროდუქტი ვერ მოიძებნა</p>
        <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">← ყველა პროდუქტი</Link>
      </div>
    );
  }
  const p = result.product;
  const related = result.related;
  const name = cleanName(p.nameKa || p.name);
  const imageSrc = (p.imageUrl && !p.imageUrl.includes('/images/categories/'))
    ? p.imageUrl
    : (p.images && p.images.length > 0 && !p.images[0].includes('/images/categories/'))
      ? p.images[0]
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: p.sku || undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    image: imageSrc ? `https://kibilov.ge${imageSrc}` : undefined,
    offers: {
      "@type": "Offer",
      url: `https://kibilov.ge/products/${params.id}`,
      priceCurrency: "GEL",
      price: p.price || p.retailPrice || undefined,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/">მთავარი</Link>
          <span>›</span>
          <Link href="/products">პროდუქტები</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8 min-h-64">
            {imageSrc ? (
              <img src={imageSrc} alt={name} className="max-h-72 object-contain" />
            ) : (
              <div className="text-gray-300 text-6xl">🔧</div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            {p.brand && <p className="text-blue-600 font-medium">{p.brand}</p>}
            {p.sku && <p className="text-sm text-gray-500">SKU: {p.sku}</p>}
            {p.oem && <p className="text-sm text-gray-500">OEM: {p.oem}</p>}

            <FitmentBadge productId={p.id} />
            <ProductActions product={p} />
          </div>
        </div>

        {p.oemCodes && p.oemCodes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold mb-3">OEM კოდები</h2>
            <div className="flex flex-wrap gap-2">
              {p.oemCodes.slice(0,10).map((code: string, i: number) => (
                <span key={i} style={{background:'#f0f7ff',border:'1px solid #bfdbfe',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontFamily:'monospace',color:'#1e3a5f'}}>{code}</span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <CrossReference sku={p.sku || ''} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <FitsVehicles oemCode={(p.oemCodes && p.oemCodes.find((c:string) => !c.includes(":"))) || (p.oemCodes && p.oemCodes[0]) || p.oem || p.sku || ""} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <ProductReviews productId={p.id} />
        </div>

        {related.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">მსგავსი პროდუქტები</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.slice(0, 8).map((r: any) => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
