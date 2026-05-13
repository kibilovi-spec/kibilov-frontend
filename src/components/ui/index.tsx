'use client';

export function Loader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}

export function Pagination({
  page, total, limit = 12, onPage,
}: { page: number; total: number; limit?: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  const getPages = () => {
    const arr: (number | '...')[] = [];
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    arr.push(1);
    if (page > 3) arr.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) arr.push(i);
    if (page < pages - 2) arr.push('...');
    arr.push(pages);
    return arr;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      <button
        onClick={() => onPage(page - 1)} disabled={page === 1}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-blue-500 transition">
        ←
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:border-blue-500'}`}>
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPage(page + 1)} disabled={page === pages}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-blue-500 transition">
        →
      </button>
    </div>
  );
}
