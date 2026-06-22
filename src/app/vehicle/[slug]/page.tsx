import { Metadata } from 'next';

interface Props { params: { slug: string } }

function parseSlug(slug: string) {
  const parts = slug.split('-');
  return { make: parts[0], model: parts.slice(1).join('-'), raw: slug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make, model } = parseSlug(params.slug);
  const title = `${make.charAt(0).toUpperCase()+make.slice(1)} ${model.toUpperCase()} ავტონაწილები`;
  return {
    title: `${title} | Kibilov AutoParts`,
    description: `${title} — ზეთის ფილტრი, კალოტკა, ამორტიზატორი და სხვა. OEM კოდები და ფასები kibilov.ge-ზე`,
    keywords: `${make} ${model}, ${make} ${model} ნაწილები, ${make} ${model} OEM`
  };
}

export default async function VehiclePage({ params }: Props) {
  const { make, model } = parseSlug(params.slug);
  const makeTitle = make.charAt(0).toUpperCase() + make.slice(1);

  const commonParts = ['oil filter','front brake pad','rear brake pad','air filter','shock absorber','spark plug','water pump','thermostat'];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <nav style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        <a href="/">მთავარი</a> → <a href="/products">ნაწილები</a> → {makeTitle} {model.toUpperCase()}
      </nav>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
        {makeTitle} {model.toUpperCase()} — ავტონაწილები
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
        {makeTitle} {model.toUpperCase()} მოდელისთვის ყველაზე ხშირად მოთხოვნადი ნაწილები
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {commonParts.map(part => (
          <a key={part} href={`/?search=${makeTitle}+${model}+${part}`}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', textDecoration: 'none', color: '#334155', fontSize: '13px', fontWeight: 500 }}>
            🔍 {part}
          </a>
        ))}
      </div>
      <div style={{ marginTop: '24px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
        <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px', fontWeight: 500 }}>AI ძებნა</p>
        <a href={`/?search=${makeTitle}+${model}`}
          style={{ display: 'inline-block', padding: '8px 16px', background: '#1a56db', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
          {makeTitle} {model.toUpperCase()} — AI-ით მოძებნა
        </a>
      </div>
    </div>
  );
}
