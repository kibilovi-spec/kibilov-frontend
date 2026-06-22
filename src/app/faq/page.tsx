import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ხშირი კითხვები (FAQ) | kibilov.ge',
  description: 'ხშირად დასმული კითხვები ავტონაწილების შეძენის, მიტანის, დაბრუნებისა და გარანტიის შესახებ.',
  keywords: 'FAQ, ხშირი კითხვები, ავტონაწილები მიტანა, გარანტია, დაბრუნება',
};

const faqs = [
  {
    cat: '🛒 შეძენა',
    items: [
      { q: 'როგორ შევუკვეთო ნაწილი?', a: 'მოიძიეთ სასურველი ნაწილი კატალოგში, დაამატეთ კალათაში და გაიარეთ შეკვეთის პროცესი. ასევე შეგიძლიათ WhatsApp-ით (+995 577 575 052) ან ტელეფონით დაგვიკავშირდეთ.' },
      { q: 'შემიძლია OEM კოდით მოვძებნო ნაწილი?', a: 'დიახ! საძიებო ველში ჩაწერეთ OEM კოდი (მაგ: 0986494501) და სისტემა ავტომატურად მოძებნის შესაბამის ნაწილებს და cross-reference ანალოგებს.' },
      { q: 'როგორ ვიცი ნაწილი ჩემს მანქანაზე მოვა?', a: 'გამოიყენეთ VIN სკანირება (/garage) — შეიყვანეთ VIN კოდი და სისტემა ავტომატურად გამოიყვანს თქვენი მანქანისთვის შესაფერ ნაწილებს. ასევე შეგიძლიათ მარკა/მოდელი/წელი ფილტრით მოძებნოთ.' },
      { q: 'B2B ფასები გამოიყენება?', a: 'დიახ, სერვის ცენტრებს და საბითუმო მყიდველებს ვთავაზობთ სპეციალურ B2B ფასებს. დარეგისტრირდით /b2b-apply-ზე.' },
    ]
  },
  {
    cat: '🚚 მიტანა',
    items: [
      { q: 'რამდენ ხანში მოვა ჩემი შეკვეთა?', a: 'თბილისი და რუსთავი — 1 სამუშაო დღე. სხვა რეგიონები — 2-3 სამუშაო დღე. გადაუდებელ შემთხვევაში დაგვიკავშირდით WhatsApp-ით.' },
      { q: 'მიტანა უფასოა?', a: 'დიახ, თბილისში და რუსთავში მიტანა უფასოა. სხვა რეგიონებში მიტანის ღირებულება დამოკიდებულია მდებარეობაზე.' },
      { q: 'შემიძლია მაღაზიიდან თვითონ წამოვიღო?', a: 'დიახ! ჩვენი სერვისცენტრი მდებარეობს რუსთავში. მისამართი და სამუშაო საათები: ორშ-შაბ 9:00-19:00.' },
    ]
  },
  {
    cat: '✅ ხარისხი და გარანტია',
    items: [
      { q: 'ნაწილები ორიგინალია?', a: 'ყველა ნაწილი სერტიფიცირებული და გარანტირებულია. ვმუშაობთ მხოლოდ სანდო მომწოდებლებთან. OEM, OES და ხარისხიანი aftermarket ნაწილები.' },
      { q: 'რა გარანტია აქვს ნაწილებს?', a: 'ყველა ნაწილს აქვს მინიმუმ 6 თვის გარანტია. ბრენდული ნაწილებს — 12 თვე. გარანტია მოქმედებს სამონტაჟო დეფექტებზე.' },
      { q: 'ნაწილი არ მომივიდა / დაზიანებულია — რა ვქნა?', a: 'დაუყოვნებლივ დაგვიკავშირდით WhatsApp-ით (+995 577 575 052) ფოტოებით. 24 საათში გადავაგვარებთ — შევცვლით ან დავაბრუნებთ ფულს.' },
    ]
  },
  {
    cat: '🔄 დაბრუნება',
    items: [
      { q: 'შემიძლია ნაწილი დავაბრუნო?', a: 'დიახ, 14 დღის განმავლობაში შეგიძლიათ დაბრუნება, თუ ნაწილი არ არის გამოყენებული და ორიგინალ შეფუთვაშია.' },
      { q: 'ფული როდის დამიბრუნდება?', a: 'დაბრუნებიდან 3-5 სამუშაო დღეში ფული ანგარიშზე დაბრუნდება.' },
      { q: 'რა შემთხვევაში არ ხდება დაბრუნება?', a: 'გამოყენებული, დაზიანებული ან შეფუთვის გარეშე ნაწილები არ ბრუნდება. ასევე სპეციალური შეკვეთის ნაწილები.' },
    ]
  },
  {
    cat: '🔧 VIN და OEM',
    items: [
      { q: 'სად ვნახო ჩემი მანქანის VIN კოდი?', a: 'VIN კოდი (17 სიმბოლო) განთავსებულია: საჭის სვეტის ძირას (სალონში), წინა მინის ქვედა კუთხეში, კარის სანიჩბეზე, ტექნიკური პასპორტის პირველ გვერდზე.' },
      { q: 'რა არის OEM კოდი?', a: 'OEM (Original Equipment Manufacturer) კოდი არის ნაწილის ნომერი, რომელსაც მწარმოებელი ანიჭებს. ეს კოდი იდენტიფიცირებს კონკრეტულ ნაწილს და საშუალებას გაძლევთ სწრაფად მოძებნოთ ანალოგები.' },
    ]
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.flatMap(cat => cat.items.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    })))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/">მთავარი</Link>
            <span>›</span>
            <span className="text-gray-900">ხშირი კითხვები</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ხშირი კითხვები</h1>
          <p className="text-gray-500 mb-8">ვერ პოულობთ პასუხს? <a href="https://wa.me/995577575052" className="text-blue-600 hover:underline">WhatsApp-ით დაგვიკავშირდით →</a></p>

          <div className="space-y-8">
            {faqs.map(cat => (
              <div key={cat.cat}>
                <h2 className="text-lg font-bold text-gray-800 mb-4">{cat.cat}</h2>
                <div className="space-y-3">
                  {cat.items.map(item => (
                    <div key={item.q} className="bg-white rounded-xl border border-gray-100 p-5">
                      <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-blue-600 rounded-2xl p-6 text-center">
            <h3 className="text-white font-bold text-lg mb-2">კიდევ გაქვთ კითხვა?</h3>
            <p className="text-blue-100 text-sm mb-4">ჩვენი გუნდი მზადაა დაგეხმაროთ</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="https://wa.me/995577575052" target="_blank"
                className="bg-white text-blue-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-50">
                💬 WhatsApp
              </a>
              <a href="tel:+995577575052"
                className="bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-sm border border-blue-400 hover:bg-blue-400">
                📞 +995 577 575 052
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
