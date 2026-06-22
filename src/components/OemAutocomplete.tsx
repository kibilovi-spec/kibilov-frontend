'use client';
import { useState, useRef, useEffect } from 'react';

interface OemResult {
  code: string;
  desc: string;
  brand: string;
  image: string | null;
}

interface Props {
  onSearch: (code: string) => void;
  placeholder?: string;
}

export function OemAutocomplete({ onSearch, placeholder = 'OEM (მაგ.: 2115401717)' }: Props) {
  const [value, setValue] = useState('');
  const [results, setResults] = useState<OemResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async (val: string) => {
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/autodoc/oem?code=' + encodeURIComponent(val));
      const d = await r.json();
      if (d.found && d.articles?.length) {
        setResults(d.articles.slice(0, 6));
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    } catch {}
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (code: string) => {
    setValue(code);
    setOpen(false);
    onSearch(code);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          value={value}
          onChange={handleChange}
          onKeyDown={e => { if (e.key === 'Enter' && value.trim()) { setOpen(false); onSearch(value.trim()); } }}
          placeholder={placeholder}
          style={{ flex: 1, fontSize: '11px', padding: '7px 9px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.25)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', marginTop: '4px', overflow: 'hidden'
        }}>
          {results.map((r, i) => (
            <div key={i} onClick={() => handleSelect(r.code)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', borderBottom: i < results.length-1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              {r.image && <img src={r.image} alt={r.desc} style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e3a5f' }}>{r.desc}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{r.brand} · <span style={{ fontFamily: 'monospace', color: '#0066CC' }}>{r.code}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: '8px', padding: '10px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          ⏳ იძებნება...
        </div>
      )}
    </div>
  );
}
