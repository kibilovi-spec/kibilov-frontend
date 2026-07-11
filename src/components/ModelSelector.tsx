'use client';
import { useState, useRef, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
  nameRaw?: string;
  yearFrom?: number;
  yearTo?: number;
  imageUrl?: string;
}

export function ModelSelector({ models, value, onChange, disabled }: {
  models: Model[];
  value: string;
  onChange: (name: string, obj: Model) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string>('');
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // group by first word
  const groups: Record<string, Model[]> = {};
  models.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase())).forEach(m => {
    const g = (m.nameRaw || m.name).split(' ')[0];
    if (!groups[g]) groups[g] = [];
    groups[g].push(m);
  });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500">
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || '— მოდელი —'}</span>
        <span className="text-gray-400 ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <input
              autoFocus
              value={search}
              onChange={e => { setSearch(e.target.value); setExpanded(''); }}
              placeholder="ძებნა..."
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
          {Object.entries(groups).map(([group, ms]) => (
            <div key={group}>
              <button
                type="button"
                onClick={() => setExpanded(expanded === group ? '' : group)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-sm font-bold text-gray-800">
                <span>{group}</span>
                <span className="text-gray-400 text-lg">{expanded === group ? '−' : '+'}</span>
              </button>
              {(expanded === group || search) && ms.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onChange(m.name, m); setOpen(false); setSearch(''); setExpanded(''); }}
                  className={`w-full text-left px-6 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 ${value === m.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600'}`}>
                  {m.name}
                </button>
              ))}
            </div>
          ))}
          {Object.keys(groups).length === 0 && (
            <p className="text-center py-4 text-sm text-gray-400">ვერ მოიძებნა</p>
          )}
        </div>
      )}
    </div>
  );
}
