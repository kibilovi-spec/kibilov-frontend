'use client';
import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id?: string;
  name: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string, id?: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SearchableSelect({ value, onChange, options, placeholder = '— აირჩიე —', disabled, loading }: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    setQuery('');
  }, [options.length]);

  const safeValue = typeof value === 'string' ? value : '';
  
  const unique = options
    .filter(o => o && typeof o.name === 'string')
    .filter((o, i, arr) => arr.findIndex(x => x.name === o.name) === i);
    
  const filtered = query
    ? unique.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
    : unique;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          width: '100%', fontSize: '11px', padding: '6px 8px', borderRadius: '6px',
          border: `1.5px solid ${open ? '#0066CC' : '#e2e8f0'}`,
          background: disabled ? '#f1f5f9' : '#f8fafc',
          color: safeValue ? '#1e293b' : '#94a3b8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
          boxSizing: 'border-box' as const
        }}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {loading ? 'იტვირთება...' : safeValue || placeholder}
        </span>
        <span style={{ fontSize: '9px', color: '#94a3b8', flexShrink: 0, marginLeft: '4px' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          background: '#fff', border: '1.5px solid #0066CC', borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: '2px', overflow: 'hidden'
        }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ძებნა..."
            style={{
              width: '100%', padding: '8px 10px', fontSize: '11px',
              border: 'none', borderBottom: '1px solid #e2e8f0',
              outline: 'none', background: '#f8fafc', boxSizing: 'border-box' as const
            }}
          />
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '8px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>არ მოიძებნა</div>
            ) : filtered.map((o, idx) => (
              <div
                key={o.id || o.name || idx}
                onClick={() => { onChange(o.name, o.id); setOpen(false); }}
                style={{
                  padding: '7px 10px', fontSize: '11px', cursor: 'pointer',
                  background: o.name === safeValue ? '#e8f0fe' : '#fff',
                  color: o.name === safeValue ? '#0066CC' : '#1e293b',
                  fontWeight: o.name === safeValue ? 700 : 400,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = o.name === safeValue ? '#e8f0fe' : '#f1f5f9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = o.name === safeValue ? '#e8f0fe' : '#fff'; }}
              >
                {o.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
