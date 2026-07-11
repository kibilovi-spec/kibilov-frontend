'use client';
import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/shop/index';
import Link from 'next/link';
import { useVehicleStore } from '@/store/vehicle';

export default function CategoryClientFilter({ products, total, slug }: { products: any[], total: number, slug: string }) {
  const { vehicle } = useVehicleStore();
  const [search, setSearch] = useState('');
  const [forMyVehicle, setForMyVehicle] = useState(false);
  const [vehicleProducts, setVehicleProducts] = useState<any[]>([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [autodocProducts, setAutodocProducts] = useState<any[]>([]);

  // Autodoc პროდუქტები vehicle-ისთვის
  useEffect(() => {
    if (!vehicle?.vehicleId || !slug) return;
    fetch(`/api/autodoc/articles?vehicleId=${vehicle.vehicleId}&categoryId=${slug}`)
      .then(r => r.json())
      .then(d => setAutodocProducts(d.data || []))
      .catch(() => {});
  }, [vehicle?.vehicleId, slug]);

  useEffect(() => {
    if (!forMyVehicle || !vehicle.vehicleId) return;
    setVehicleLoading(true);
    fetch(`/api/products?vehicleId=${vehicle.vehicleId}&autodoc_category_id=${slug}&limit=200`)
      .then(r => r.json())
      .then(d => setVehicleProducts(d.data || []))
      .catch(() => setVehicleProducts([]))
      .finally(() => setVehicleLoading(false));
  }, [forMyVehicle, vehicle.vehicleId, slug]);
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 48;

  const brands = useMemo(() => {
    const b = new Set(products.map((p: any) => p.brand).filter(Boolean));
    return Array.from(b).sort() as string[];
  }, [products]);

  const filtered = useMemo(() => {
    // DB პროდუქტები + Autodoc პროდუქტები (დედუპლიკაცია SKU-ით)
    const dbProds = forMyVehicle && vehicle.vehicleId ? vehicleProducts : products;
    const autodocIds = new Set(dbProds.map((p: any) => p.sku?.replace(/\s+/g,'').toUpperCase()));
    const newAutodoc = autodocProducts.filter((p: any) => !autodocIds.has(p.sku?.replace(/\s+/g,'').toUpperCase()));
    let r = [...dbProds, ...newAutodoc];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p: any) =>
        p.nameKa?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.articleNumber?.toLowerCase().includes(q) ||
        p.alternativeSearchKeys?.some((k: string) => k.toLowerCase().includes(q))
      );
    }
    if (brand) r = r.filter((p: any) => p.brand === brand);
    if (minPrice) r = r.filter((p: any) => Number(p.price) >= Number(minPrice));
    if (maxPrice) r = r.filter((p: any) => Number(p.price) <= Number(maxPrice));
    if (inStock) r = r.filter((p: any) => p.stock > 0);
    if (sort === 'price_asc') r = [...r].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price_desc') r = [...r].sort((a, b) => Number(b.price) - Number(a.price));
    // out of stock ბოლოში
    r = [...r].sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0));
    return r;
  }, [products, search, brand, minPrice, maxPrice, inStock, sort, autodocProducts, forMyVehicle, vehicleProducts, vehicle.vehicleId]);

  const hasFilters = search || brand || minPrice || maxPrice || inStock || forMyVehicle;

  const clearAll = () => {
    setSearch(''); setBrand(''); setMinPrice(''); setMaxPrice(''); setInStock(false); setSort(''); setForMyVehicle(false); setPage(1);
  };

  const Sidebar = () => (
    <div className="space-y-5">
      {/* Vehicle Filter */}
      {vehicle.vehicleId && (
        <div className="mb-2">
          <button
            onClick={() => setForMyVehicle(!forMyVehicle)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${forMyVehicle ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'}`}>
            🚗 {vehicle.make} {vehicle.model} {vehicle.year}
            {forMyVehicle && <span className="ml-auto text-xs">✓</span>}
          </button>
          {forMyVehicle && (
            <p className="text-xs text-blue-600 mt-1 px-1">ამ მანქანისთვის შესაფერი ნაწილები</p>
          )}
        </div>
      )}

      {/* Search */}
      <div>
        <p className="text-sm font-bold text-gray-800 mb-2">🔍 ძებნა</p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SKU, სახელი, OEM კოდი..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Price */}
      <div>
        <p className="text-sm font-bold text-gray-800 mb-2">💰 ფასი (₾)</p>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="მინ" value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"/>
          <span className="text-gray-400">—</span>
          <input type="number" placeholder="მაქს" value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"/>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {[['0','50'],['50','150'],['150','300'],['300','500']].map(([mn,mx]) => (
            <button key={mn+mx} onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
              className={`px-2 py-1 text-xs rounded-lg border transition-colors ${minPrice===mn&&maxPrice===mx?'border-blue-500 bg-blue-50 text-blue-600':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
              {mn}–{mx}₾
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-800 mb-2">🏷️ ბრენდი</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {brands.map(b => (
              <label key={b} className="flex items-center gap-2 cursor-pointer py-0.5">
                <input type="radio" name="brand" value={b}
                  checked={brand === b}
                  onChange={() => setBrand(brand === b ? '' : b)}
                  className="w-3.5 h-3.5 accent-blue-600"/>
                <span className="text-sm text-gray-700">{b}</span>
              </label>
            ))}
            {brand && (
              <button onClick={() => setBrand('')} className="text-xs text-blue-600 mt-1">გასუფთავება ✕</button>
            )}
          </div>
        </div>
      )}

      {/* Stock */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={inStock}
          onChange={e => setInStock(e.target.checked)}
          className="w-4 h-4 accent-blue-600"/>
        <span className="text-sm text-gray-700">✅ მარაგშია</span>
      </label>

      {/* Clear */}
      {hasFilters && (
        <button onClick={clearAll}
          className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50">
          🗑️ ფილტრების გასუფთავება
        </button>
      )}
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sticky top-4">
          {/* Sort */}
          <div className="mb-5">
            <p className="text-sm font-bold text-gray-800 mb-2">↕️ დალაგება</p>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">სტანდარტული</option>
              <option value="price_asc">ფასი: იაფიდან</option>
              <option value="price_desc">ფასი: ძვირიდან</option>
            </select>
          </div>
          <Sidebar />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile controls */}
        <div className="lg:hidden mb-4 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ძებნა..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">დალაგება</option>
            <option value="price_asc">↑ ფასი</option>
            <option value="price_desc">↓ ფასი</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length !== total ? `ნაპოვნია: ${filtered.length} / ${total}` : `სულ: ${total} ნაწილი`}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filtered.slice(0, page * PER_PAGE).map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
        {filtered.length > page * PER_PAGE && (
          <div className="text-center mb-8">
            <button onClick={() => setPage(p => p + 1)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
              მეტის ჩვენება ({filtered.length - page * PER_PAGE} დარჩა)
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-500">ნაწილი ვერ მოიძებნა</p>
            {hasFilters && <button onClick={clearAll} className="mt-4 text-blue-600 hover:underline text-sm">ფილტრების გასუფთავება</button>}
          </div>
        )}

        {!search && !hasFilters && total > 200 && (
          <div className="text-center">
            <Link href={`/products?category=${slug}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">
              ყველა {total} ნაწილის ნახვა →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
