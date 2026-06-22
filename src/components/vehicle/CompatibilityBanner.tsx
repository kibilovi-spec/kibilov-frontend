'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Props {
  make:       string;
  model:      string;
  year?:      string;
  vehicleId?: string | null;
}

export function CompatibilityBanner({ make, model, year, vehicleId }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId) { setCount(null); return; }
    setLoading(true);
    fetch('/api/catalog/compatibility-count?vehicleId=' + vehicleId)
      .then(r => r.json())
      .then(d => { if (d.success) setCount(d.count); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const label = [make, model, year].filter(Boolean).join(' ');

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
      borderRadius: '16px',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '28px' }}>🚗</span>
        <div>
          <div style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
            არჩეული ავტომობილი
          </div>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800 }}>
            {label}
          </div>
        </div>
        {(count !== null || loading) && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '10px',
            padding: '6px 14px',
            marginLeft: '8px',
          }}>
            {loading ? (
              <span style={{ color: '#bfdbfe', fontSize: '13px' }}>იტვირთება...</span>
            ) : (
              <>
                <span style={{ color: '#34d399', fontSize: '20px', fontWeight: 900 }}>
                  {count !== null ? count.toLocaleString() : '0'}
                </span>
                <span style={{ color: '#bfdbfe', fontSize: '12px', marginLeft: '4px' }}>
                  თავსებადი ნაწილი
                </span>
              </>
            )}
          </div>
        )}
      </div>
      <Link
        href={'/products?make=' + encodeURIComponent(make) + '&model=' + encodeURIComponent(model) + (year ? '&year=' + year : '')}
        style={{
          background: '#facc15',
          color: '#1e3a5f',
          padding: '8px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 800,
          textDecoration: 'none',
        }}>
        ნაწილების ნახვა →
      </Link>
    </div>
  );
}
