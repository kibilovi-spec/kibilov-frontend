'use client';
import { useState } from 'react';

interface ProductResult {
  id: string;
  nameKa: string;
  sku: string;
  price: string;
  stock: number;
  images: string[];
}

interface CodeResult {
  found: boolean;
  products: ProductResult[];
}

export default function BulkSearchPage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, CodeResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{total: number; found: number} | null>(null);

  const search = async () => {
    const codes = input.split('\n').map(c => c.trim()).filter(Boolean);
    if (!codes.length) return;
    setLoading(true);
    try {
      const r = await fetch('/api/bulk/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes })
      });
      const d = await r.json();
      setResults(d.results);
      setStats({ total: d.total, found: d.found });
    } catch(e) {}
    setLoading(false);
  };

  const exportCSV = () => {
    if (!results) return;
    const rows = [['OEM კოდი', 'სტატუსი', 'სახელი', 'SKU', 'ფასი', 'მარაგი']];
    for (const [code, r] of Object.entries(results)) {
      if (r.found && r.products.length) {
        r.products.forEach(p => rows.push([code, 'გვაქვს', p.nameKa, p.sku, p.price, String(p.stock)]));
      } else {
        rows.push([code, 'არ გვაქვს', '', '', '', '']);
      }
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kibilov_bulk.csv'; a.click();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>Bulk OEM ძებნა</h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>ჩაწერეთ OEM კოდები — თითო ხაზზე ერთი (მაქს. 50)</p>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={'04152-YZZA6\nGDB3445\nHU710/4X\n1K0698151G'}
        rows={8}
        style={{ width: '100%', fontSize: '13px', padding: '10px 12px', borderRadius: '10px', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginBottom: '20px' }}>
        <button onClick={search} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#1a56db', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          {loading ? 'იძებნება...' : '🔍 ძებნა'}
        </button>
        {results && <button onClick={exportCSV} style={{ padding: '10px 16px', borderRadius: '10px', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '13px', cursor: 'pointer' }}>📥 CSV</button>}
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[['სულ', stats.total], ['გვაქვს', stats.found], ['არ გვაქვს', stats.total - stats.found]].map(([label, val]) => (
            <div key={label} style={{ background: 'var(--color-background-secondary)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 2px', color: 'var(--color-text-primary)' }}>{val}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(results).map(([code, r]) => (
            <div key={code} style={{ background: 'var(--color-background-primary)', border: `0.5px solid ${r.found ? 'var(--color-border-success)' : 'var(--color-border-tertiary)'}`, borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <code style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{code}</code>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: r.found ? 'var(--color-background-success)' : 'var(--color-background-secondary)', color: r.found ? 'var(--color-text-success)' : 'var(--color-text-tertiary)' }}>
                  {r.found ? '✅ გვაქვს' : 'არ გვაქვს'}
                </span>
              </div>
              {r.found && r.products.map(p => (
                <div key={p.id} style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', flex: 1, marginRight: '8px' }}>{p.nameKa.slice(0, 60)}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{p.price}₾</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
