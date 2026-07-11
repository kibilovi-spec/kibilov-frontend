import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ავტონაწილები თბილისი — kibilov.ge | სათადარიგო ნაწილები',
  description: 'ავტონაწილები თბილისში მიტანით. Toyota, Hyundai, KIA, BMW, Mercedes სათადარიგო ნაწილები. უფასო მიტანა 150₾-დან. +995 577 575 052',
  keywords: 'ავტონაწილები თბილისი, სათადარიგო ნაწილები თბილისი, avtonilailebi tbilisi, zapchasti tbilisi, ავტო ნაწილები თბილისი',
};

export default function TbilisiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">ავტონაწილები თბილისში მიტანით</h1>
      <p className="text-gray-600 mb-6 text-lg">
        kibilov.ge — ავტონაწილების ონლაინ მაღაზია. თბილისში ყველა უბანში მიტანა 1 სამუშაო დღეში.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-blue-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-3">🚚 მიტანა თბილისში</h2>
          <p className="text-gray-700">✅ უფასო მიტანა 150₾-დან</p>
          <p className="text-gray-700">✅ 1 სამუშაო დღე</p>
          <p className="text-gray-700">✅ ყველა უბანში</p>
          <p className="text-blue-700 font-bold mt-2">+995 577 575 052</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-green-800 mb-3">⚡ სწრაფი შეკვეთა</h2>
          <p className="text-gray-700">✅ VIN კოდით 30 წამში</p>
          <p className="text-gray-700">✅ WhatsApp შეკვეთა</p>
          <p className="text-gray-700">✅ 200+ ბრენდი</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">პოპულარული ნაწილები თბილისში</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { name: 'სამუხრუჭე კოლოდკები', slug: 'braking-system' },
          { name: 'ზეთის ფილტრი', slug: 'filters' },
          { name: 'ამომრტყმელი', slug: 'suspension-damping' },
          { name: 'გრანტი', slug: 'wheel-drive' },
          { name: 'სანთელი', slug: 'spark-glow-ignition' },
          { name: 'საჰაერო ფილტრი', slug: 'filters' },
        ].map((item, i) => (
          <a key={i} href={"/categories/" + item.slug}
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition">
            <p className="font-medium text-gray-800">{item.name}</p>
          </a>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">პოპულარული მარკები თბილისში</h2>
      <div className="flex flex-wrap gap-3 mb-10">
        {['Toyota', 'Hyundai', 'KIA', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Opel', 'Ford', 'Nissan', 'Mitsubishi', 'Lexus', 'Honda'].map(make => (
          <a key={make} href={"/parts?make=" + make}
            className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-4 py-2 rounded-full text-sm font-medium transition">
            {make}
          </a>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">რატომ kibilov.ge?</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✅ 2003 წლიდან ავტონაწილების ბიზნესში</li>
          <li>✅ ასობით ათასი სათადარიგო ნაწილი</li>
          <li>✅ VIN კოდით სწრაფი ძებნა</li>
          <li>✅ TRW, Bosch, NGK, KYB, MANN ბრენდები</li>
          <li>✅ 3 დღიანი დაბრუნების გარანტია</li>
          <li>✅ B2B ფასები სერვის ცენტრებისთვის</li>
        </ul>
      </div>
    </div>
  );
}
