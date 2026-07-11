'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/search').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div style={{padding:'24px',color:'#64748b'}}>იტვირთება...</div>;
  if (!data) return null;

  const { summary, topQueries, topBrands, topParts, daily } = data;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
        AI ძებნის ანალიტიკა
      </h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'სულ ძებნა', value: summary.totalSearches, color: '#2563eb' },
          { label: 'ნულოვანი შედეგი', value: summary.zeroResults, color: '#ef4444' },
          { label: 'Zero Rate', value: summary.zeroRate, color: '#f59e0b' },
        ].map((card, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* Top Queries */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#0f172a' }}>
            🔍 პოპულარული ძებნები
          </h3>
          {topQueries.slice(0, 10).map((q: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
              <span style={{ color: '#1e293b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
              <span style={{ color: '#2563eb', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>{q.count}</span>
            </div>
          ))}
        </div>

        {/* Top Brands */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#0f172a' }}>
            🚗 პოპულარული მარკები
          </h3>
          {topBrands.slice(0, 10).map((b: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
              <span style={{ color: '#1e293b' }}>{b.brand}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: `${Math.min(60, b.count * 10)}px`, height: '6px', background: '#2563eb', borderRadius: '3px' }} />
                <span style={{ color: '#2563eb', fontWeight: 600 }}>{b.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Parts */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#0f172a' }}>
            🔧 პოპულარული ნაწილები
          </h3>
          {topParts.slice(0, 10).map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
              <span style={{ color: '#1e293b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.part_ka}</span>
              <span style={{ color: '#2563eb', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>{p.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily stats */}
      {daily && daily.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#0f172a' }}>
            📅 დღიური სტატისტიკა
          </h3>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['თარიღი', 'ძებნა', 'ნულოვანი', 'საშ. შედეგი'].map(h => (
                  <th key={h} style={{ padding: '8px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daily.map((d: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', color: '#1e293b' }}>{String(d.date).slice(0, 10)}</td>
                  <td style={{ padding: '8px', color: '#2563eb', fontWeight: 600 }}>{d.searches}</td>
                  <td style={{ padding: '8px', color: '#ef4444' }}>{d.zero_results}</td>
                  <td style={{ padding: '8px', color: '#64748b' }}>{parseFloat(d.avg_results || 0).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
