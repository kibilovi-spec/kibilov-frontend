import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ავტონაწილების ბრენდები | kibilov.ge',
  description: 'ყველა ბრენდის ავტონაწილები — Mercedes-Benz, BMW, Toyota, Volkswagen და სხვა. kibilov.ge-ზე.',
};

async function getBrands() {
  try {
    const r = await fetch('http://localhost:3001/api/products/brands', { next: { revalidate: 3600 } });
    if (r.ok) {
      const data = await r.json();
      return data.brands || [];
    }
  } catch {}
  // fallback - DB-დან ვიცით
  return [
    {name:'Mercedes-Benz', count:164},
    {name:'Toyota', count:113},
    {name:'BMW', count:79},
    {name:'Ford', count:74},
    {name:'Nissan', count:68},
    {name:'Opel', count:60},
    {name:'Honda', count:50},
    {name:'Mitsubishi', count:48},
    {name:'Hyundai', count:47},
    {name:'Volkswagen', count:44},
    {name:'Mazda', count:36},
    {name:'Jeep', count:28},
    {name:'Kia', count:22},
    {name:'Chevrolet', count:19},
    {name:'Subaru', count:15},
    {name:'Suzuki', count:12},
    {name:'Lexus', count:10},
    {name:'Audi', count:9},
    {name:'Land Rover', count:8},
  ];
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/">მთავარი</Link>
            <span>›</span>
            <span className="text-gray-900 font-semibold">ბრენდები</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ავტონაწილების ბრენდები</h1>
          <p className="text-gray-500">აირჩიეთ ბრენდი სასურველი ნაწილის სანახავად</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((b: any) => (
            <Link key={b.name} href={`/brands/${encodeURIComponent(b.name)}`}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-blue-400 hover:shadow-md transition text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">🔧</div>
              <span className="font-semibold text-gray-900 text-sm">{b.name}</span>
              <span className="text-xs text-gray-400">{b.count} ნაწილი</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
