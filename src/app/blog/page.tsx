import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ბლოგი — Kibilov Auto Parts',
  description: 'ავტომობილების მოვლა, ავტონაწილების შერჩევა, Toyota, BMW, Mercedes სიახლეები',
};

const posts = [
  { slug: 'tog-sheicvalo-zeiti', title: 'როდის უნდა შეიცვალოს ძრავის ზეთი?', desc: 'ზეთის შეცვლის ინტერვალები სხვადასხვა მარკისთვის — Toyota, BMW, Mercedes, Hyundai', date: '2026-05-01', cat: 'მოვლა' },
  { slug: 'vin-kodi-ra-aris', title: 'VIN კოდი — რა არის და სად ვნახოთ?', desc: 'VIN კოდის გაშიფვრა, სად არის განთავსებული მანქანაზე და რა ინფორმაციას შეიცავს', date: '2026-05-10', cat: 'სახელმძღვანელო' },
  { slug: 'samukhruche-sistema', title: 'სამუხრუჭე სისტემის მოვლა', desc: 'სამუხრუჭე კოლოდკების, დისკების შეცვლის ვადები და ნიშნები', date: '2026-05-15', cat: 'მოვლა' },
  { slug: 'toyota-original-vs-analog', title: 'ორიგინალი vs ანალოგი — რომელი ავარჩიოთ?', desc: 'ორიგინალი და ანალოგი ნაწილების შედარება — ხარისხი, ფასი, გარანტია', date: '2026-05-20', cat: 'რჩევა' },
  { slug: 'zamthris-mosamzadebeli', title: 'მანქანის ზამთრისთვის მომზადება', desc: 'ბატარეა, საბურავები, ანტიფრიზი — ყველაფერი რაც ზამთარში გჭირდებათ', date: '2026-05-25', cat: 'სეზონური' },
  { slug: 'samukhruche-kolodkebi-shecvla', title: 'სამუხრუჭე კოლოდკების შეცვლა — როდის და როგორ?', desc: 'სამუხრუჭე ბალიშების ცვეთის ნიშნები, შეცვლის ინტერვალები და ფასები', date: '2026-06-01', cat: 'მოვლა' },
  { slug: 'akumulatori-momsakhureba', title: 'ბატარეის (აკუმულატორის) მოვლა და შეცვლა', desc: 'როდის იცვლება ბატარეა, როგორ შევამოწმოთ მისი მდგომარეობა', date: '2026-06-05', cat: 'მოვლა' },
  { slug: 'filters-shecvlis-intervalebi', title: 'ყველა ფილტრის შეცვლის ვადები', desc: 'ზეთის, საჰაერო, სალონის და საწვავის ფილტრების შეცვლის ინტერვალები', date: '2026-06-10', cat: 'მოვლა' },
  { slug: 'amortizatori-diagnostika', title: 'ამომრტყმელი (ამორტიზატორი) — ცვეთის ნიშნები', desc: 'როგორ გავიგოთ რომ ამომრტყმელი ცვდება და როდის ვცვალოთ', date: '2026-06-15', cat: 'დიაგნოსტიკა' },
  { slug: 'granti-diagnostika', title: 'გრანტი (CV Joint) — ცვეთის ნიშნები და შეცვლა', desc: 'გრანტის ყბედობა, ცვეთა და შეცვლის პროცესი Hyundai, KIA, Toyota-ზე', date: '2026-06-20', cat: 'დიაგნოსტიკა' },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📝 ბლოგი</h1>
        <p className="text-gray-500 mb-8">ავტომობილების მოვლა, ნაწილების შერჩევა და სიახლეები</p>
        <div className="grid gap-6">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{post.cat}</span>
                <span className="text-xs text-gray-400">{post.date}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition mb-2">{post.title}</h2>
              <p className="text-sm text-gray-500">{post.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
