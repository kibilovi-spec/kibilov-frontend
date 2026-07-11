'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">გვერდი ვერ მოიძებნა</h1>
        <p className="text-gray-500 mb-8">საძიებო გვერდი არ არსებობს ან გადატანილია. სცადეთ მთავარ გვერდზე დაბრუნება.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            🏠 მთავარი გვერდი
          </Link>
          <Link href="/categories" className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
            📦 კატეგორიები
          </Link>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 mb-2">დაგვირეკეთ ან მოგვწერეთ</p>
          <a href="tel:+995577575052" className="text-blue-600 font-bold">+995 577 575 052</a>
        </div>
      </div>
    </div>
  );
}
