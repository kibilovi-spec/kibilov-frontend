import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'მიტანა და დაბრუნება | kibilov.ge',
  description: 'ავტონაწილების მიტანის პირობები — თბილისი, რუსთავი, მთელი საქართველო. 14-დღიანი დაბრუნების გარანტია.',
  keywords: 'მიტანა, დაბრუნება, ავტონაწილები მიტანა, kibilov მიტანა',
};

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/">მთავარი</Link><span>›</span>
          <span className="text-gray-900">მიტანა და დაბრუნება</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">მიტანა და დაბრუნება</h1>

        {/* Delivery */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🚚 მიტანის პირობები</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <span className="text-2xl">🏙️</span>
              <div>
                <p className="font-bold text-green-800">თბილისი და რუსთავი — უფასო</p>
                <p className="text-sm text-green-700 mt-1">მიტანა 1 სამუშაო დღეში. შეკვეთა 14:00-მდე — მეორე დღეს ჩამოგართმევთ.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-2xl">🗺️</span>
              <div>
                <p className="font-bold text-blue-800">სხვა რეგიონები</p>
                <p className="text-sm text-blue-700 mt-1">2-3 სამუშაო დღე. მიტანის ღირებულება დამოკიდებულია მდებარეობაზე — დაგვიკავშირდით ფასის გასარკვევად.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="font-bold text-gray-800">თვითგატანა — რუსთავი</p>
                <p className="text-sm text-gray-600 mt-1">ჩვენი სერვისცენტრიდან შეგიძლიათ თვითონ წამოიღოთ. სამუშაო საათები: ორშ-შაბ 9:00-19:00.</p>
                <p className="text-sm text-blue-600 mt-1 font-medium">📞 +995 577 575 052</p>
              </div>
            </div>
          </div>
        </div>

        {/* Returns */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔄 დაბრუნების პოლიტიკა</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <span className="text-3xl font-black text-blue-600">14</span>
              <div>
                <p className="font-bold text-blue-800">14-დღიანი დაბრუნება</p>
                <p className="text-sm text-blue-700">შეძენიდან 14 დღის განმავლობაში</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">✅ დაბრუნება შესაძლებელია თუ:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• ნაწილი არ არის გამოყენებული</li>
                <li>• ორიგინალ შეფუთვაშია</li>
                <li>• 14 დღე არ გასულა შეძენიდან</li>
                <li>• გაქვთ შეძენის დამადასტურებელი</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">❌ დაბრუნება არ ხდება თუ:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• ნაწილი გამოყენებულია</li>
                <li>• შეფუთვა დაზიანებულია</li>
                <li>• სპეციალური შეკვეთის ნაწილია</li>
                <li>• 14 დღეზე მეტია გასული</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800 mb-1">💰 თანხის დაბრუნება</p>
              <p className="text-sm text-gray-600">დაბრუნებიდან 3-5 სამუშაო დღეში თანხა ჩაირიცხება ანგარიშზე.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-blue-600 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">კითხვები მიტანასთან დაკავშირებით?</h3>
          <div className="flex gap-3 justify-center flex-wrap mt-4">
            <a href="https://wa.me/995577575052" target="_blank"
              className="bg-white text-blue-600 px-5 py-2 rounded-xl font-bold text-sm">
              💬 WhatsApp
            </a>
            <a href="tel:+995577575052"
              className="bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-sm border border-blue-400">
              📞 +995 577 575 052
            </a>
            <Link href="/faq"
              className="bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-sm border border-blue-400">
              ❓ FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
