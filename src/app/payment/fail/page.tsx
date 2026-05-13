'use client';
import Link from 'next/link';
export default function PayFail() {
  return (
    <div className="max-w-md mx-auto text-center py-24 px-4">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-2xl font-extrabold text-dark mb-3">გადახდა ვერ განხორციელდა</h1>
      <p className="text-text2 mb-6">სცადე ხელახლა ან მოგვწერე: +995 577 575052</p>
      <Link href="/orders" className="btn-primary">← შეკვეთებზე დაბრუნება</Link>
    </div>
  );
}
