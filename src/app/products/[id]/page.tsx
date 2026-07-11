import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductReviews from "@/components/ProductReviews";
import FitsVehicles from '@/components/FitsVehicles';
import { ProductCard } from '@/components/shop/index';
import ProductActions from '@/components/products/ProductActions';
import CrossReference from '@/components/products/CrossReference';
import FitmentBadge from '@/components/products/FitmentBadge';
import PartDiagram from '@/components/products/PartDiagram';
import ProductGallery from '@/components/products/ProductGallery';

export const dynamic = 'force-dynamic';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getProduct(id: string) {
  try {
    // Autodoc პროდუქტი
    if (id.startsWith('autodoc_')) {
      const articleId = id.replace('autodoc_', '');
      const [artRes, criteriaRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/autodoc/article/${articleId}`, { cache: 'no-store' }),
        fetch(`${BACKEND_URL}/api/autodoc/articles/criteria/${articleId}`, { cache: 'no-store' }),
      ]);
      if (!artRes.ok) return null;
      const data = await artRes.json();
      const product = data.data;
      if (product && criteriaRes.ok) {
        const criteria = await criteriaRes.json();
        if (Array.isArray(criteria)) {
          product.criteria = criteria;
          // PDF
          const pdfItem = criteria.find((c:any) => c.criteriaName === 'PDF');
          if (pdfItem) product.pdfUrl = pdfItem.criteriaValue;
          // Fitting Position
          const fitting = criteria.find((c:any) => c.criteriaName === 'Fitting Position');
          if (fitting) product.fittingPosition = fitting.criteriaValue;
        }
      }
      // number-details-დან PDF ვნახოთ
      if (product && !product.pdfUrl && product.sku) {
        try {
          const ndr = await fetch(`${BACKEND_URL}/api/autodoc/articles/number-details`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({articleNo: product.sku, langId: 4}), cache: 'no-store'
          });
          if (ndr.ok) {
            const nd = await ndr.json();
            const art = nd.articles?.[0];
            if (art?.articleMediaType === 'PDF' && art?.articleMediaFileName) {
              product.pdfUrl = `https://fsn1.your-objectstorage.com/tecdoc2025/media_files/documents/${art.articleMediaFileName}`;
            }
          }
        } catch {}
      }
      return { product, related: [] };
    }
    const r = await fetch(`${BACKEND_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    return { product: data.data || data.product || data, related: data.related || [] };
  } catch { return null; }
}

async function getCategoryPath(autodocCategoryId: number | null) {
  if (!autodocCategoryId) return [];
  try {
    const r = await fetch(`${BACKEND_URL}/api/categories/all-slugs`, { cache: 'no-store' });
    const data = await r.json();
    const all = data.data || [];
    const cat = all.find((c: any) => c.id === autodocCategoryId || String(c.id) === String(autodocCategoryId));
    if (!cat) return [];
    const path = [cat];
    let current = cat;
    while (current.parentId) {
      const parent = all.find((c: any) => String(c.id) === String(current.parentId));
      if (!parent) break;
      path.unshift(parent);
      current = parent;
    }
    return path;
  } catch { return []; }
}

function cleanName(raw: string) {
  return (raw || '').replace(/\s*\|[^|]*\|\s*/g, '').trim();
}

const PART_SLANG: Record<string, string[]> = {
  'brake pad': ['სამუხრუჭე პატარა', 'ბეგელი', 'ხახუნის ბალიში'],
  'brake disc': ['სამუხრუჭე დისკი', 'დისკი', 'ბრეკის დისკი'],
  'oil filter': ['ზეთის ფილტრი', 'მაზუთის ფილტრი'],
  'air filter': ['საჰაერო ფილტრი', 'ჰაერის ფილტრი'],
  'cabin filter': ['სალონის ფილტრი', 'კაბინის ფილტრი'],
  'spark plug': ['სანთელი', 'ბოუჯი', 'სვეჩა'],
  'shock absorber': ['ამომრტყმელი', 'შოკი', 'ამორტიზატორი', 'ბაფერი'],
  'timing belt': ['გაზის სარტყელი', 'ტაიმინგი', 'ვარკვლავი'],
  'water pump': ['წყლის ტუმბო', 'ვოდიანკა', 'პომპა'],
  'alternator': ['გენერატორი', 'ალტერნატორი'],
  'starter': ['სტარტერი', 'მარჯვენა'],
  'clutch': ['კლაჩი', 'კავშირი', 'შეერთება'],
  'cv joint': ['გრანტი', 'ხრახნი', 'CV'],
  'wheel bearing': ['თვლის საკისარი', 'ბუქსა', 'პოდშიბნიკი'],
  'control arm': ['სასხლეტი', 'ბერკეტი', 'ლევერი'],
  'ball joint': ['ბურთულა', 'შარნირი'],
  'tie rod': ['საჭის ბოლო', 'ნაკონეჩნიკი'],
  'stabilizer': ['სტაბილიზატორი', 'სტაბი'],
  'radiator': ['რადიატორი', 'გამაცხელებელი'],
  'fuel filter': ['საწვავის ფილტრი', 'ბენზინის ფილტრი'],
};

function getSlangKeywords(name: string): string {
  const lower = name.toLowerCase();
  const matches: string[] = [];
  for (const [key, slangs] of Object.entries(PART_SLANG)) {
    if (lower.includes(key)) matches.push(...slangs);
  }
  return matches.join(', ');
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const result = await getProduct(params.id);
  if (!result?.product) return { title: 'პროდუქტი | Kibilov AutoParts' };
  const p = result.product;
  const name = cleanName(p.nameKa || p.name);
  const description = p.description || `${name}${p.brand ? ' — ' + p.brand : ''}${p.oemCodes?.length ? ' — OEM: ' + p.oemCodes.slice(0,3).join(', ') : ''}. შეუკვეთეთ kibilov.ge-ზე.`;
  const image = p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `https://kibilov.ge${p.images[0]}`) : undefined;
  return {
    title: `${name} | Kibilov AutoParts`,
    description,
    keywords: `${name}, ${p.brand || ''}, ${p.sku || ''}, ავტონაწილები, kibilov.ge, ${getSlangKeywords(p.nameKa || p.name || '')}`,
    alternates: { canonical: `https://kibilov.ge/products/${params.id}` },
    openGraph: { title: name, description, url: `https://kibilov.ge/products/${params.id}`, images: image ? [{ url: image }] : undefined, type: 'website' },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const result = await getProduct(params.id);
  if (!result?.product) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-gray-500 font-medium">პროდუქტი ვერ მოიძებნა</p>
      <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">← ყველა პროდუქტი</Link>
    </div>
  );

  const p = result.product;
  const related = result.related;
  const name = cleanName(p.nameKa || p.name);
  const images = (p.images || []).filter((img: string) => !img.includes('/images/categories/'));
  const imageSrc = images[0] || null;
  const rawCatId = p.autodoc_category_id || p.autodocCategoryId;
  const catPath = (rawCatId && rawCatId !== 999999) ? await getCategoryPath(rawCatId) : [];

  const productDescription = p.description || p.descriptionEn || `${name}${p.brand ? ' — ' + p.brand : ''}. ავტონაწილი kibilov.ge-ზე.`;
  const productPrice = p.price ? parseFloat(p.price).toFixed(2) : '0.01';
  const isInStock = p.source === 'autodoc' ? true : p.stock > 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: p.sku,
    description: productDescription,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    image: imageSrc ? (imageSrc.startsWith('http') ? imageSrc : `https://kibilov.ge${imageSrc}`) : undefined,
    offers: {
      "@type": "Offer",
      url: `https://kibilov.ge/products/${params.id}`,
      priceCurrency: "GEL",
      price: productPrice,
      availability: isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Kibilov AutoParts" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "GEL" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "GE" },
        deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" } }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GE",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 3,
        returnMethod: "https://schema.org/ReturnInStore",
        returnFees: "https://schema.org/FreeReturn"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600">მთავარი</Link>
          {catPath.map((c: any) => (
            <span key={c.id} className="flex items-center gap-2">
              <span>›</span>
              <Link href={`/categories/${c.slug}`} className="hover:text-blue-600">{(() => { const n = c.nameKa || c.nameEn || ''; const p = n.split(' / '); return p.length===2 ? p[1] : n; })()}</Link>
            </span>
          ))}
          <span>›</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{name}</span>
        </nav>

        {/* Main product card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6 mb-6">

          {/* Image gallery */}
          <ProductGallery images={images} name={name} productId={p.id} />

          {/* Product info */}
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>

            {p.brand && (
              <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">{p.brand}</span>
              </div>
            )}

            {p.sku && <p className="text-sm text-gray-500">SKU: <span className="font-mono">{p.sku}</span></p>}

            {/* Fitment badge */}
            <FitmentBadge productId={p.id} />

            <ProductActions product={p} />

            {/* Delivery info */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2 mt-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">🚚</span>
                <span><strong>უფასო მიტანა</strong> თბილისი და რუსთავი — 150₾-დან</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">↩️</span>
                <span><strong>3 დღიანი დაბრუნება</strong> — სრული გარანტია</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">✅</span>
                <span><strong>ორიგინალი ნაწილები</strong> — გარანტირებული ხარისხი</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fitting Position + PDF */}
        {(p.fittingPosition || p.pdfUrl) && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-center gap-4 flex-wrap">
            {p.fittingPosition && (
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${p.fittingPosition.toLowerCase().includes('front')||p.fittingPosition==='VA'?'bg-blue-100 text-blue-700':p.fittingPosition.toLowerCase().includes('rear')||p.fittingPosition==='HA'?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-700'}`}>
                🔧 {p.fittingPosition.replace('VA','Front Axle').replace('HA','Rear Axle')}
              </span>
            )}
            {p.pdfUrl && (
              <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition">
                📄 PDF ინსტრუქცია
              </a>
            )}
          </div>
        )}

        {/* Specs */}
        {(p.descriptionEn || (p.criteria && p.criteria.length > 0)) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">ტექნიკური მახასიათებლები</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(p.criteria && p.criteria.length > 0 ? p.criteria.map((c:any)=>c.criteriaName+': '+c.criteriaValue) : (p.descriptionEn||'').split('\n').filter((l:string)=>l.includes(':'))).map((line: string, i: number) => {
                const [key, ...rest] = line.split(':');
                return (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                    <span className="text-gray-500">{key.trim()}</span>
                    <span className="font-medium text-gray-900">{rest.join(':').trim()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* OEM codes */}
        {p.oemCodes && p.oemCodes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold mb-3">OEM კოდები</h2>
            <div className="flex flex-wrap gap-2">
              {p.oemCodes.slice(0,10).map((code: string, i: number) => (
                <span key={i} className="font-mono text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg">{code}</span>
              ))}
            </div>
          </div>
        )}

        {/* Part Diagram */}
        <PartDiagram productId={p.id} />

        {/* Cross reference */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <CrossReference sku={p.sku || ''} />
        </div>

        {/* Fits vehicles */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <FitsVehicles oemCode={(p.oemCodes?.find((c:string) => !c.includes(":"))) || p.oemCodes?.[0] || p.oem || p.sku || ""} />
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <ProductReviews productId={p.id} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">მსგავსი პროდუქტები</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.slice(0,8).map((r: any) => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
