import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductsPage } from '@/components/pages/index';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export const metadata: Metadata = {
  title: 'ავტონაწილები — კატალოგი | kibilov.ge',
  description: 'ყველა ავტომობილის სათადარიგო ნაწილი ერთ ადგილას. OEM კოდებით ძებნა, ბრენდის მიხედვით ფილტრი.',
};

async function getInitialProducts(searchParams?: Record<string, string>) {
  try {
    const p = new URLSearchParams();
    Object.entries({ ...searchParams, lang: 'ka', page: searchParams?.page || '1' }).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p.append(k, String(v));
    });
    const r = await fetch(`${BACKEND_URL}/api/products?${p}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    return {
      products: data.data || [],
      pagination: data.pagination || { page: 1, pages: 1, total: 0 },
      brands: data.meta?.brands || [],
    };
  } catch {
    return null;
  }
}

export default async function Page({ searchParams }: { searchParams?: Record<string,string> }) {
  const initial = await getInitialProducts(searchParams);
  return (
    <>
      <h1 className="sr-only">ავტონაწილები — კატალოგი | kibilov.ge</h1>
      <Suspense fallback={null}>
        <ProductsPage
          searchParams={searchParams}
          initialProducts={initial?.products}
          initialPagination={initial?.pagination}
          initialBrands={initial?.brands}
        />
      </Suspense>
    </>
  );
}
