import { Metadata } from 'next';

interface Props { params: { code: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.code.toUpperCase();
  return {
    title: `${code} — ნაწილის ძებნა | Kibilov AutoParts`,
    description: `${code} კოდის სათადარიგო ნაწილები. ფასები, ანალოგები და cross-reference kibilov.ge-ზე`,
    keywords: `${code}, ავტონაწილები, ${code} ფასი, ${code} ანალოგი`
  };
}

export default async function OemPage({ params }: Props) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  let oemData: any = null;
  let dbProduct: any = null;

  try {
    const [oemR, dbR] = await Promise.all([
      fetch(`${API}/api/autodoc/oem?code=${encodeURIComponent(code)}`, { next: { revalidate: 1800 } }),
      fetch(`${API}/api/autodoc/checkCodes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ codes: [code] }), next: { revalidate: 1800 } })
    ]);
    oemData = await oemR.json();
    const dbData = await dbR.json();
    dbProduct = dbData?.found?.[code];
  } catch(e) {}

  const articles = oemData?.articles || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      <nav style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        <a href="/" style={{ color: '#0066CC' }}>მთავარი</a> → <a href="/products" style={{ color: '#0066CC' }}>ნაწილები</a> → {code}
      </nav>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: '#1e3a5f' }}>
        ნაწილი: {code}
      </h1>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
        {articles.length > 0 ? `${articles.length} შედეგი` : 'ძებნა მიმდინარეობს...'}
      </p>

      {/* ჩვენს საწყობშია */}
      {dbProduct && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', marginBottom: '8px' }}>✅ მარაგშია</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>{dbProduct.nameKa}</div>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>SKU: {dbProduct.sku} · {dbProduct.price}₾</div>
          <a href={`/products/${dbProduct.id}`}
            style={{ display: 'inline-block', padding: '8px 20px', background: '#0066CC', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            ნახვა →
          </a>
        </div>
      )}

      {/* Autodoc შედეგები */}
      {articles.length > 0 ? (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f', marginBottom: '12px' }}>
            სათადარიგო ნაწილები ({articles.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {articles.map((a: any, i: number) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {a.image && (
                  <img src={a.image} alt={a.desc} style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }}
                     />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a5f', marginBottom: '2px' }}>{a.desc}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{a.brand} · <span style={{ fontFamily: 'monospace', color: '#0066CC' }}>{a.code}</span></div>
                  <a href={`https://wa.me/995577575052?text=${encodeURIComponent('გამარჯობა! მაინტერესებს: ' + a.desc + ' ' + a.brand + ' ' + a.code + ' - გამოიძიეთ ფასი')}`}
                    target="_blank"
                    style={{ display: 'inline-block', padding: '5px 12px', background: '#25d366', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>
                    📱 შეკვეთა
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>ეს კოდი ამჟამად ვერ მოიძებნა.</p>
          <a href={`/?oem=${code}`}
            style={{ display: 'inline-block', padding: '8px 16px', background: '#0066CC', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            AI-ით მოძებნა
          </a>
        </div>
      )}
    </div>
  );
}
