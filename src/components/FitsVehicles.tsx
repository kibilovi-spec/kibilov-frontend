'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function FitsVehicles({ oemCode }: { oemCode: string }) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string,boolean>>({});

  useEffect(() => {
    if (!oemCode) return;
    api.get(`/api/autodoc/compatible-cars?oem=${encodeURIComponent(oemCode)}`)
      .then(r => setVehicles(r.data?.vehicles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [oemCode]);

  if (loading) return <div className="text-sm text-gray-400 py-4">⏳ იტვირთება...</div>;
  if (!vehicles.length) return (
    <div className="text-center py-6 text-gray-400">
      <p className="text-2xl mb-2">🚗</p>
      <p className="text-sm">თავსებადი მანქანები ვერ მოიძებნა</p>
    </div>
  );

  // მარკის მიხედვით დავაჯგუფოთ
  const grouped: Record<string, any[]> = {};
  vehicles.forEach(v => {
    const make = v.make || 'სხვა';
    if (!grouped[make]) grouped[make] = [];
    grouped[make].push(v);
  });

  const toggle = (make: string) => setExpanded(p => ({...p, [make]: !p[make]}));

  return (
    <div>
      <div style={{border:'1px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
        {Object.entries(grouped).map(([make, cars], i) => (
          <div key={make} style={{borderBottom: i < Object.keys(grouped).length-1 ? '1px solid #e2e8f0' : 'none'}}>
            <button onClick={() => toggle(make)}
              style={{width:'100%',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fff',border:'none',cursor:'pointer',textAlign:'left'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{color: expanded[make] ? '#dc2626' : '#2563eb',fontWeight:700,fontSize:'18px',lineHeight:1}}>
                  {expanded[make] ? '−' : '+'}
                </span>
                <span style={{fontWeight:700,fontSize:'14px',color:'#1e3a5f'}}>{make}</span>
                <span style={{fontSize:'12px',color:'#94a3b8'}}>({cars.length})</span>
              </div>
            </button>
            {expanded[make] && (
              <div style={{background:'#f8fafc',padding:'8px 16px 12px 16px'}}>
                {cars.map((v, j) => (
                  <div key={j} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 0',borderBottom: j<cars.length-1?'1px solid #e2e8f0':'none'}}>
                    <span style={{color:'#2563eb',fontWeight:700,fontSize:'14px'}}>+</span>
                    <span style={{fontSize:'13px',color:'#334155',flex:1}}>
                      {v.make} {v.model}
                    </span>
                    <span style={{fontSize:'12px',color:'#64748b'}}>
                      {v.engine} · {v.yearFrom}–{v.yearTo || '→'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'8px'}}>სულ: {vehicles.length} მოდელი</p>
    </div>
  );
}
