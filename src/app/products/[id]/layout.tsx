import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`http://localhost:3001/api/products/${params.id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const p = data.data || data.product || data;
    const name = p?.nameKa || p?.nameEn || p?.name || 'ავტონაწილი';
    const brand = p?.brand || '';
    const oem = p?.oemCodes?.[0] || '';
    const price = p?.price || p?.retailPrice || '';
    const title = `${brand ? brand + ' ' : ''}${name}${oem ? ' | ' + oem : ''} | Kibilov`;
    const desc = p?.descriptionKa ||
      `${brand} ${name}. ${oem ? 'OEM: ' + oem + '. ' : ''}ფასი: ${price}₾. kibilov.ge — სწრაფი მიტანა საქართველოში.`;
    return {
      title,
      description: desc.slice(0, 160),
      openGraph: {
        title,
        description: desc.slice(0, 160),
        images: p?.images?.[0] ? [p.images[0]] : [],
        type: 'website',
      },
      keywords: [name, brand, oem, 'ავტონაწილები', 'kibilov'].filter(Boolean),
    };
  } catch {
    return { title: 'ნაწილი | Kibilov AutoParts' };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
