import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ავტონაწილები რუსთავი — kibilov.ge | სათადარიგო ნაწილები',
  description: 'ავტონაწილები რუსთავში. სათადარიგო ნაწილები Toyota, Hyundai, KIA, BMW, Mercedes. უფასო მიტანა 150₾-დან. +995 577 575 052',
  keywords: 'ავტონაწილები რუსთავი, სათადარიგო ნაწილები რუსთავი, avtonilailebi rustavi, ავტო ნაწილები, zapchasti rustavi',
};

export default function RustaviPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">ავტონაწილები რუსთავში</h1>
      <p className="text-gray-600 mb-6 text-lg">
        kibilov.ge — რუსთავის ავტონაწილების ონლაინ მაღაზია. 2003 წლიდან ვემსახურებით რუსთავის და თბილისის მომხმარებლებს.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-blue-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-3">📍 ჩვენი მისამართი</h2>
          <p className="text-gray-700">რუსთავი, საქართველო</p>
          <p className="text-gray-700">ორ-შაბ: 09:00 — 18:00</p>
          <p className="text-blue-700 font-bold mt-2">+995 577 575 052</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-green-800 mb-3">🚚 მიტანა</h2>
          <p className="text-gray-700">✅ უფასო მიტანა 150₾-დან</p>
          <p className="text-gray-700">✅ მიტანა რუსთავსა და თბილისში</p>
          <p className="text-gray-700">✅ 1-3 სამუშაო დღე</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">პოპულარული ნაწილები რუსთავში</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { name: 'სამუხრუჭე კოლოდკები', slug: 'braking-system' },
          { name: 'ზეთის ფილტრი', slug: 'filters' },
          { name: 'ამომრტყმელი', slug: 'suspension-damping' },
          { name: 'გრანტი (CV Joint)', slug: 'wheel-drive' },
          { name: 'სანთელი', slug: 'spark-glow-ignition' },
          { name: 'საჰაერო ფილტრი', slug: 'filters' },
        ].map((item, i) => (
          <a key={i} href={"/categories/" + item.slug}
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition">
            <p className="font-medium text-gray-800">{item.name}</p>
          </a>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">პოპულარული მარკები რუსთავში</h2>
      <div className="flex flex-wrap gap-3 mb-10">
        {['Toyota', 'Hyundai', 'KIA', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Opel', 'Ford', 'Nissan', 'Mitsubishi'].map(make => (
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
          <li>✅ ასობით ათასი სათადარიგო ნაწილი კატალოგში</li>
          <li>✅ VIN კოდით სწრაფი ძებნა</li>
          <li>✅ ორიგინალი ნაწილები — TRW, Bosch, NGK, KYB, MANN</li>
          <li>✅ 3 დღიანი დაბრუნების გარანტია</li>
          <li>✅ B2B საბითუმო ფასები სერვის ცენტრებისთვის</li>
        </ul>
      </div>
    </div>
  );
}
