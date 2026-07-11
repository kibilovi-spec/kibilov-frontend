import { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/shop/index';
import CategoryClientFilter from './CategoryClientFilter';

async function getCategoryData(slug: string) {
  try {
    const allCatsRes = await fetch('http://localhost:3001/api/categories/all-slugs', { cache: 'no-store' });
    const allCatsData = await allCatsRes.json();
    const allCats = allCatsData.data || [];
    const matches = allCats.filter((c: any) => c.slug === slug);
    const cat = matches.sort((a: any, b: any) => Number(a.id) - Number(b.id))[0];
    const children = allCats.filter((c: any) => String(c.parentId) === String(cat?.id));
    const catId = cat?.id;
    let products: any[] = [];
    let total = 0;
    if (catId && children.length === 0) {
      // AUTODOC API-დან products
      const autodocRes = await fetch(`http://localhost:3001/api/autodoc/articles?categoryId=${catId}`, { cache: 'no-store' });
      const autodocData = await autodocRes.json();
      products = (autodocData.data || []).map((a: any) => ({
        id: a.id,
        nameKa: a.name || a.nameKa,
        nameEn: a.name,
        brand: a.brand,
        sku: a.sku,
        price: null,
        images: a.images || [],
        source: 'autodoc',
        articleId: a.id,
      }));
      total = products.length;
    }
    const prods = { data: products, pagination: { total } };
    return { cat, products: prods.data || [], total: prods.pagination?.total || 0, children };
  } catch { return { cat: null, products: [], total: 0, children: [] }; }
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const res = await fetch('http://localhost:3001/api/categories/all-slugs');
    const data = await res.json();
    return (data.data || []).map((c: any) => ({ slug: c.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { cat, total } = await getCategoryData(params.slug);
  const name = cat?.nameKa || params.slug;
  return {
    title: `${name} — ავტონაწილები | kibilov.ge`,
    description: `${name} კატეგორიის ${total} სათადარიგო ნაწილი. OEM კოდებით ძებნა, სწრაფი მიტანა თბილისი და რუსთავი.`,
  };
}

export default async function CategoryPageSSR({ params }: { params: { slug: string } }) {
  const { cat, products, total, children } = await getCategoryData(params.slug);
  const name = cat?.nameKa || params.slug;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/">მთავარი</Link>
            <span>›</span>
            <Link href="/categories">კატეგორიები</Link>
            <span>›</span>
            <span className="text-gray-900 font-semibold">{name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
          <p className="text-gray-500 mb-2">{total} ნაწილი kibilov.ge-ზე</p>
          <p className="text-gray-600 text-sm max-w-2xl">
            {name} კატეგორიის ორიგინალური და ანალოგური სათადარიგო ნაწილები.
            OEM კოდებით ძებნა, სწრაფი მიტანა თბილისი და რუსთავი. გარანტია ყველა პროდუქტზე.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children && children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">ქვეკატეგორიები</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {children.map((child: any) => (
                <Link key={child.id} href={`/categories/${child.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center gap-2">
                  {child.imageUrl && <img src={child.imageUrl} alt={child.nameKa} style={{width:'60px',height:'60px',objectFit:'contain'}}/>}
                  <p className="text-sm font-medium text-gray-800 leading-tight">{child.nameKa}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        {products.length > 0 ? (
          <CategoryClientFilter products={products} total={total} slug={params.slug} />
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-500">ამ კატეგორიაში ნაწილები ჯერ არ არის</p>
            <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">← ყველა ნაწილი</Link>
          </div>
        )}
      </div>
    </div>
  );
}
