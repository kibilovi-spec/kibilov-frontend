import { Metadata } from 'next';

export async function generateProductMetadata(id: string): Promise<Metadata> {
  try {
    const res = await fetch(`http://localhost:3001/api/products/${id}`, {
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    const p = data.data || data.product || data;

    if (!p) return { title: 'ნაწილი | Kibilov AutoParts' };

    const name = p.nameKa || p.nameEn || p.name || 'ავტონაწილი';
    const brand = p.brand || '';
    const oem = p.oemCodes?.[0] || '';
    const price = p.price || p.retailPrice || '';

    const title = `${brand ? brand + ' ' : ''}${name}${oem ? ' | ' + oem : ''} | Kibilov`;
    const description = p.descriptionKa ||
      `${brand} ${name}. ${oem ? 'OEM: ' + oem + '. ' : ''}ფასი: ${price}₾. შეიძინე kibilov.ge-ზე — სწრაფი მიტანა საქართველოში.`;

    return {
      title,
      description: description.slice(0, 160),
      openGraph: {
        title,
        description: description.slice(0, 160),
        images: p.images?.[0] ? [{ url: p.images[0] }] : [],
        type: 'website',
        locale: 'ka_GE',
        siteName: 'Kibilov AutoParts',
      },
      keywords: [
        name, brand, oem,
        'ავტონაწილები', 'kibilov', 'სათადარიგო ნაწილები',
        'ავტო ნაწილები საქართველო', brand + ' საქართველო'
      ].filter(Boolean),
    };
  } catch {
    return { title: 'ნაწილი | Kibilov AutoParts' };
  }
}
