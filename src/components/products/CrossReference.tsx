'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useLang } from '@/store';

interface Analog {
  articleId: number;
  articleNo: string;
  supplierName: string;
  articleProductName: string;
}

export default function CrossReference({ sku }: { sku: string }) {
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const [analogs, setAnalogs] = useState<Analog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const load = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const normSku = sku.replace(/[\s\-\.]/g, '');
      const r = await api.get(`/api/autodoc/artlookup/analog/${normSku}`);
      setAnalogs(r.data.articles || []);
      setLoaded(true);
    } catch {}
    setLoading(false);
  };

  const displayed = showAll ? analogs : analogs.slice(0, 8);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={load}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition font-semibold text-gray-700 text-sm"
      >
        <span>🔄 ანალოგები და Cross-reference</span>
        {loading ? (
          <span className="text-blue-600 text-xs">იტვირთება...</span>
        ) : loaded ? (
          <span className="text-green-600 text-xs">{analogs.length} ნაპოვნი</span>
        ) : (
          <span className="text-blue-600 text-xs">ნახვა →</span>
        )}
      </button>

      {loaded && analogs.length === 0 && (
        <div className="px-4 py-3 text-sm text-gray-400">ანალოგები ვერ მოიძებნა</div>
      )}

      {loaded && analogs.length > 0 && (
        <div className="divide-y divide-gray-100">
          {displayed.map((a) => (
            <div key={a.articleId} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <span className="font-semibold text-gray-800 text-sm">{a.supplierName}</span>
                <span className="text-gray-400 text-xs ml-2 font-mono">{a.articleNo}</span>
              </div>
              <Link
                href={`/products?q=${encodeURIComponent(a.articleNo)}`}
                className="text-xs text-blue-600 hover:underline"
              >
                ძებნა →
              </Link>
            </div>
          ))}
          {analogs.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
            >
              {showAll ? t('ნაკლები','Less','Меньше') : t(`კიდევ ${analogs.length-8} ანალოგი`,`${analogs.length-8} more analogs`,`Ещё ${analogs.length-8} аналогов`)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
