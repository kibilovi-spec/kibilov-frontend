import { Metadata } from 'next';
import Link from 'next/link';

const posts: Record<string, any> = {
  'tog-sheicvalo-zeiti': {
    title: 'როდის უნდა შეიცვალოს ძრავის ზეთი?',
    date: '2026-05-01',
    cat: 'მოვლა',
    content: `
ძრავის ზეთი ავტომობილის ყველაზე მნიშვნელოვანი სითხეა. სწორი ინტერვალებით შეცვლა ძრავის სიცოცხლეს 2-3-ჯერ ზრდის.

## ზოგადი ინტერვალები

**მინერალური ზეთი:** ყოველ 5,000-7,000 კმ
**ნახევრად სინთეტიკა:** ყოველ 7,000-10,000 კმ  
**სინთეტიკა:** ყოველ 10,000-15,000 კმ

## მარკების მიხედვით

- **Toyota:** 5,000-10,000 კმ (ქართულ პირობებში 5,000)
- **BMW:** 10,000-15,000 კმ (Long Life სერვის)
- **Mercedes:** 10,000-15,000 კმ
- **Hyundai/Kia:** 7,000-10,000 კმ

## როდის შეიცვალოს ადრე?

- ქალაქში ინტენსიური მოძრაობა
- მტვრიანი გზები
- ხშირი მოკლე მგზავრობები
- 1 წელი გავიდა (კმ-ს მიუხედავად)

**Kibilov Auto Parts-ზე** იხილეთ ზეთების სრული კატალოგი — Mobil, Castrol, Liqui Moly, Shell.
    `
  },
  'vin-kodi-ra-aris': {
    title: 'VIN კოდი — რა არის და სად ვნახოთ?',
    date: '2026-05-10',
    cat: 'სახელმძღვანელო',
    content: `
VIN (Vehicle Identification Number) — მანქანის უნიკალური 17-სიმბოლოიანი იდენტიფიკატორი.

## სად არის VIN კოდი?

- **ქარხნული ფირფიტა** — სალონის მხრიდან, წინა მინის ქვეშ
- **მძღოლის კარის წირი** — კარის ჩარჩოზე სტიკერი
- **ძრავის განყოფილება** — ბლოკზე ან ჩარჩოზე
- **მოწმობა** — ტექნიკური პასპორტი

## VIN-ის სტრუქტურა

1-3: ქვეყანა და მწარმოებელი
4-8: მოდელი, კუზოვი, ძრავი
9: საკონტროლო ციფრი
10: წელი
11: ქარხანა
12-17: სერიული ნომერი

## kibilov.ge-ზე VIN ძებნა

ჩვენს საიტზე შეგიძლიათ VIN კოდით მოძებნოთ თქვენი მანქანის ნაწილები — სწრაფად და ზუსტად.
    `
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts[params.slug];
  if (!post) return { title: 'ბლოგი — Kibilov' };
  return {
    title: `${post.title} — Kibilov Auto Parts`,
    description: post.content.slice(0, 150),
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">სტატია ვერ მოიძებნა</h1>
        <Link href="/blog" className="text-blue-600 hover:underline">← ბლოგი</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-blue-600 hover:underline text-sm mb-6 inline-block">← ბლოგი</Link>
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{post.cat}</span>
            <span className="text-xs text-gray-400">{post.date}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{post.title}</h1>
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
              🔍 ნაწილების კატალოგი
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
