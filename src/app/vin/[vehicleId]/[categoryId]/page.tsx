import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BackButton from '@/components/vin/BackButton';
import VinPartsClient from '@/components/vin/VinPartsClient';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const PREFERRED_BRANDS = ['BOSCH', 'MANN', 'FEBI', 'DAYCO', 'NGK', 'MAHLE', 'SKF', 'FAG'];

async function getPageData(vehicleId: string, categoryId: string) {
  const [vehicleRes, catsRes] = await Promise.all([
    fetch(`${BACKEND_URL}/api/autodoc/vehicles/details/1/${vehicleId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${BACKEND_URL}/api/autodoc/categories?vehicleId=${vehicleId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null).catch(() => null),
  ]);

  const cats = catsRes?.categories || [];
  const cat = cats.find((c: any) => String(c.id) === String(categoryId));
  if (!cat) return null;

  const subCats = cats.filter((c: any) => c.parent === cat.name);

  let parts: any[] = [];
  if (subCats.length > 0) {
    const subResults = await Promise.all(
      subCats.slice(0, 6).map((sc: any) =>
        fetch(`${BACKEND_URL}/api/autodoc/parts?vehicleId=${vehicleId}&categoryId=${sc.id}`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : { articles: [] }).catch(() => ({ articles: [] }))
      )
    );
    subResults.forEach((r: any) => {
      const subParts: any[] = r?.articles || [];
      const hasOurs = subParts.some((p: any) => p.inStock);
      if (hasOurs) {
        parts.push(...subParts.filter((p: any) => p.inStock));
      } else {
        const best = subParts.find((p: any) => PREFERRED_BRANDS.some(b => (p.brand||'').toUpperCase().includes(b)));
        parts.push(...(best ? [best] : subParts.slice(0, 1)));
      }
    });
  } else {
    const partsRes = await fetch(`${BACKEND_URL}/api/autodoc/parts?vehicleId=${vehicleId}&categoryId=${categoryId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { articles: [] }).catch(() => ({ articles: [] }));
    const leafParts = partsRes?.articles || [];
    const hasOurs = leafParts.some((p: any) => p.inStock);
    if (hasOurs) {
      parts = leafParts.filter((p: any) => p.inStock);
    } else {
      const best = leafParts.find((p: any) => PREFERRED_BRANDS.some(b => (p.brand||'').toUpperCase().includes(b)));
      parts = best ? [best] : leafParts.slice(0, 1);
    }
  }
  parts.sort((a: any, b: any) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));

  const vtd = vehicleRes?.vehicleTypeDetails;
  const vehicle = vtd ? {
    make: vtd.manufacturerName || '',
    model: vtd.modelType || '',
    year: vtd.constructionIntervalStart ? vtd.constructionIntervalStart.substring(0,4) : null,
  } : null;

  return { vehicle, catName: cat.name as string, subCats, parts };
}

export async function generateMetadata({ params }: { params: { vehicleId: string; categoryId: string } }): Promise<Metadata> {
  const data = await getPageData(params.vehicleId, params.categoryId);
  if (!data) return { title: 'ნაწილები | Kibilov AutoParts' };
  const vehicleName = data.vehicle ? `${data.vehicle.make} ${data.vehicle.model}${data.vehicle.year ? ' ' + data.vehicle.year : ''}`.trim() : '';
  const title = vehicleName ? `${vehicleName} — ${data.catName} | Kibilov AutoParts` : `${data.catName} | Kibilov AutoParts`;
  const description = `${data.catName}${vehicleName ? ' ' + vehicleName + '-სთვის' : ''}. ${data.parts.length}+ ნაწილი ხელმისაწვდომია, OEM კოდებით, სხვადასხვა ბრენდი. სწრაფი მიწოდება თბილისსა და რუსთავში.`;
  const url = `https://kibilov.ge/vin/${params.vehicleId}/${params.categoryId}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
  };
}

export default async function CategoryPartsPage({ params }: { params: { vehicleId: string; categoryId: string } }) {
  const data = await getPageData(params.vehicleId, params.categoryId);
  if (!data) notFound();

  const vehicleName = data.vehicle ? `${data.vehicle.make} ${data.vehicle.model}${data.vehicle.year ? ' ' + data.vehicle.year : ''}`.trim() : '';

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "მთავარი", item: "https://kibilov.ge/" },
      ...(vehicleName ? [{ "@type": "ListItem", position: 2, name: vehicleName }] : []),
      { "@type": "ListItem", position: vehicleName ? 3 : 2, name: data.catName },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: vehicleName ? `${data.catName} — ${vehicleName}` : data.catName,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: data.parts.slice(0, 40).map((p: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.articleProductName,
        ...(p.inStock && p.product ? { url: `https://kibilov.ge/products/${p.product.id}` } : {}),
      })),
    },
  };

  return (
    <div style={{maxWidth:'1100px',margin:'0 auto',padding:'20px 16px'}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />

      <div style={{marginBottom:'16px'}}>
        <BackButton />
      </div>

      {vehicleName && (
        <div style={{background:'#f0f7ff',border:'1px solid #bfdbfe',borderRadius:'8px',padding:'8px 14px',marginBottom:'12px',fontSize:'13px',fontWeight:600,color:'#1e3a5f',display:'flex',alignItems:'center',gap:'8px'}}>
          🚗 {vehicleName}
        </div>
      )}
      <h1 style={{fontSize:'22px',fontWeight:800,color:'#1e3a5f',marginBottom:'16px'}}>{data.catName}</h1>

      {data.subCats.length > 0 && (
        <div style={{background:'#f0f7ff',border:'1px solid #bfdbfe',borderRadius:'12px',padding:'16px',marginBottom:'20px'}}>
          <div style={{fontSize:'13px',fontWeight:700,color:'#0066CC',marginBottom:'10px'}}>ქვეკატეგორიები — აირჩიეთ:</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
            {data.subCats.map((c: any) => (
              <Link key={c.id} href={`/vin/${params.vehicleId}/${c.id}`}
                style={{background:'#fff',border:'1px solid #bfdbfe',borderRadius:'8px',padding:'10px',fontSize:'12px',fontWeight:600,color:'#1e3a5f',textDecoration:'none',textAlign:'center',display:'block'}}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <VinPartsClient parts={data.parts} />
    </div>
  );
}
