import { Suspense } from 'react';
import { HomePage } from '@/components/pages/index';

async function getFeatured() {
  // რეალური, მარაგში მყოფი პროდუქტები საკუთარი კატალოგიდან — Autodoc placeholder-ების ნაცვლად
  try {
    const r = await fetch('http://localhost:3001/api/products?inStock=true&limit=40', { cache: 'no-store' });
    const d = await r.json();
    const all = d.data || [];
    const withImg = all.filter((p: any) => p.images && p.images.length > 0);
    const withoutImg = all.filter((p: any) => !p.images || p.images.length === 0);
    return [...withImg, ...withoutImg].slice(0, 40);
  } catch { return []; }
}
export const dynamic = 'force-dynamic';
export default async function Page() {
  const featured = await getFeatured();
  const firstImg = featured?.[0]?.images?.[0];
  return (
    <>
      {firstImg && (
        <link rel="preload" as="image" href={firstImg} />
      )}
      <Suspense fallback={null}>
        <HomePage initialFeatured={featured} />
      </Suspense>
    </>
  );
}
