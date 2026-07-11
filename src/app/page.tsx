import { Suspense } from 'react';
import { HomePage } from '@/components/pages/index';

async function getFeatured() {
  try {
    const r = await fetch('http://localhost:3001/api/autodoc/featured', { cache: 'no-store' });
    const d = await r.json();
    return d.data || [];
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
