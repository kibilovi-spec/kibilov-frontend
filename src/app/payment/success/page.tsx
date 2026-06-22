'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaySuccessContent() {
  const sp = useSearchParams();
  return (
    <div className="max-w-md mx-auto text-center py-24 px-4">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-extrabold text-dark mb-3">გადახდა წარმატებული!</h1>
      <p className="text-text2 mb-2">შეკვეთა მიღებულია. გეტყობინებათ WhatsApp-ზე.</p>
      <Link href="/orders" className="btn-primary mt-4">📋 ჩემი შეკვეთები</Link>
    </div>
  );
}

export default function PaySuccess() {
  return (
    <Suspense fallback={null}>
      <PaySuccessContent />
    </Suspense>
  );
}
