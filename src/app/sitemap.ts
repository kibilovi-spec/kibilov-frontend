import { MetadataRoute } from 'next';

async function getProducts() {
  try {
    const all: any[] = [];
    let page = 1;
    while (true) {
      const r = await fetch(`http://localhost:3001/api/products?limit=48&page=${page}`, { next: { revalidate: 3600 } });
      const data = await r.json();
      const items = data.data || [];
      all.push(...items);
      const totalPages = data.pagination?.pages || 1;
      if (page >= totalPages) break;
      page++;
    }
    return all;
  } catch { return []; }
}

async function getCategories() {
  try {
    const r = await fetch('http://localhost:3001/api/categories', { next: { revalidate: 3600 } });
    const data = await r.json();
    return data.data || data.categories || [];
  } catch { return []; }
}

const BRANDS = ['Generic','Mercedes-Benz','Toyota','BMW','Ford','Nissan','Opel','Honda','Mitsubishi','Hyundai','Volkswagen','Mazda','Jeep','Kia','Chevrolet','Subaru','Suzuki','Lexus','Audi','Land Rover'];

const BLOG_POSTS = [
  'tog-sheicvalo-zeiti',
  'vin-kodi-ra-aris', 
  'samukhruche-sistema',
  'toyota-original-vs-analog',
  'zamthris-mosamzadebeli',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://kibilov.ge', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://kibilov.ge/products', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://kibilov.ge/categories', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://kibilov.ge/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kibilov.ge/service', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kibilov.ge/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://kibilov.ge/parts', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://kibilov.ge/vin', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://kibilov.ge/find-mechanic', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://kibilov.ge/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://kibilov.ge/delivery', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://kibilov.ge/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://kibilov.ge/vin-batch', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p: any) => ({
    url: `https://kibilov.ge/products/${p.id}`,
    lastModified: new Date(p.updatedAt || p.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c: any) => ({
    url: `https://kibilov.ge/categories/${c.slug || c.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map(slug => ({
    url: `https://kibilov.ge/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  const brandPages = BRANDS.map(brand => ({
    url: `https://kibilov.ge/brands/${brand}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  // OEM pages
  const oemCodes: string[] = [];
  for (const p of products) {
    for (const code of (p.oemCodes || [])) {
      if (code && code.length >= 4 && !code.startsWith('SKU') && oemCodes.length < 5000) {
        oemCodes.push(code);
      }
    }
  }
  const oemPages: MetadataRoute.Sitemap = Array.from(new Set(oemCodes)).map((code: string) => ({
    url: `https://kibilov.ge/oem/${encodeURIComponent(code)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages, ...brandPages, ...oemPages];
}
