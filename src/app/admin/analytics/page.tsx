'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'popular'|'notfound'|'daily'|'realstats'|'leads'|'debug'>('realstats');
  const [realStats, setRealStats] = useState<any>(null);
  const [debugQ, setDebugQ] = useState('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const runDebug = async () => {
    if (!debugQ.trim()) return;
    setDebugLoading(true);
    try { const {data} = await api.get(`/api/search-debug?q=${encodeURIComponent(debugQ)}`); setDebugResult(data); } catch(e) {}
    finally { setDebugLoading(false); }
  };

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/search-analytics').then(r => r.data),
      api.get('/api/leads').then(r => r.data).catch(() => []),
      api.get('/api/admin/search-stats').then(r => r.data).catch(() => null)
    ]).then(([analytics, leadsData, stats]) => {
      setData(analytics);
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      if (stats) setRealStats(stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:'40px',textAlign:'center'}}>იტვირთება...</div>;
  if (!data) return <div style={{padding:'40px',textAlign:'center',color:'red'}}>შეცდომა</div>;

  const { popular=[], notFound=[], stats={}, daily=[] } = data;
  const successRate = stats.success_rate || 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px', fontFamily: 'system-ui, sans-serif' }}>

      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
        📊 Search Analytics
      </h1>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          ['სულ ძებნა', stats.total_searches || 0, '#3b82f6'],
          ['წარმატებული', stats.successful || 0, '#10b981'],
          ['სიზუსტე', `${successRate}%`, successRate >= 90 ? '#10b981' : successRate >= 70 ? '#f59e0b' : '#ef4444'],
          ['ლიდი', leads.length, '#8b5cf6'],
        ].map(([label, val, color]) => (
          <div key={label as string} style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: '14px', padding: '20px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: color as string }}>{val}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Accuracy Bar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>საძიებო სიზუსტე</span>
          <span style={{ fontWeight: 800, color: successRate >= 90 ? '#10b981' : '#f59e0b' }}>{successRate}%</span>
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
          <div style={{
            width: `${successRate}%`, height: '100%',
            background: successRate >= 90 ? '#10b981' : successRate >= 70 ? '#f59e0b' : '#ef4444',
            borderRadius: '8px', transition: 'width 0.5s'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
          <span>მიზანი: 99%</span>
          <span>{(99 - Number(successRate)).toFixed(1)}% დარჩა</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {([
          ['realstats', '📊 Real Stats'],
          ['popular', '🔥 ხშირი ძებნები'],
          ['notfound', '❌ ვერ ნაპოვნი'],
          ['daily', '📅 დღიური'],
          ['leads', '📋 ლიდები'],
          ['debug', '🔍 Debug'],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 16px', borderRadius: '10px', border: 'none',
            background: tab === key ? '#0f172a' : '#f1f5f9',
            color: tab === key ? '#fff' : '#64748b',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer'
          }}>{label}</button>
        ))}
      </div>

      {/* Popular */}
      {tab === 'popular' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', background: '#f8fafc', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
            <span>ძებნა</span><span style={{textAlign:'center'}}>რაოდენობა</span><span style={{textAlign:'center'}}>შედეგები</span><span style={{textAlign:'center'}}>სტატუსი</span>
          </div>
          {popular.slice(0, 30).map((p: any, i: number) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
              padding: '11px 16px', borderTop: '1px solid #f1f5f9',
              background: i % 2 === 0 ? '#fff' : '#fafafa'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{p.query}</span>
                {p.normalized !== p.query && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>→ {p.normalized}</span>
                )}
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>{p.search_count}x</div>
              <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{p.total_results}</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                  background: p.success_count > 0 ? '#dcfce7' : '#fee2e2',
                  color: p.success_count > 0 ? '#16a34a' : '#dc2626'
                }}>
                  {p.success_count > 0 ? '✓ ნაპოვნი' : '✗ ვერ ნაპოვნი'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Not Found */}
      {tab === 'notfound' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
              ⚠️ ეს ძებნები 0 შედეგს აბრუნებს — DB-ში დასამატებელია ან CATEGORY_MAP-ში
            </p>
          </div>
          {notFound.map((p: any, i: number) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px', borderTop: '1px solid #f1f5f9'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{p.query}</span>
              <span style={{ fontSize: '12px', background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: '8px', fontWeight: 700 }}>
                {p.search_count}x
              </span>
            </div>
          ))}
          {notFound.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>
              ✅ ყველა ძებნა შედეგს პოულობს!
            </div>
          )}
        </div>
      )}

      {/* Daily */}
      {tab === 'daily' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 16px', background: '#f8fafc', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
            <span>თარიღი</span><span style={{textAlign:'center'}}>ძებნები</span><span style={{textAlign:'center'}}>წარმატებული</span><span style={{textAlign:'center'}}>%</span>
          </div>
          {daily.map((d: any, i: number) => {
            const rate = d.searches > 0 ? Math.round(d.successful / d.searches * 100) : 0;
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                padding: '11px 16px', borderTop: '1px solid #f1f5f9'
              }}>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>{String(d.date).slice(0,10)}</span>
                <span style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>{d.searches}</span>
                <span style={{ textAlign: 'center', fontSize: '13px', color: '#10b981' }}>{d.successful}</span>
                <span style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: rate >= 90 ? '#10b981' : '#f59e0b' }}>{rate}%</span>
              </div>
            );
          })}
          {daily.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>ჯერ მონაცემები არ არის</div>
          )}
        </div>
      )}

      {/* Leads */}

      {tab === 'realstats' && realStats && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
            {[
              ['სულ ძებნა', realStats.summary?.total, '#3b82f6'],
              ['Zero Results', realStats.summary?.zeroResults + ' (' + realStats.summary?.zeroRate + ')', '#ef4444'],
              ['CTR', realStats.summary?.ctr, '#10b981'],
              ['Cart Rate', realStats.summary?.cartRate, '#f59e0b'],
              ['Purchase Rate', realStats.summary?.purchaseRate, '#8b5cf6'],
            ].map(([label, value, color]) => (
              <div key={String(label)} style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #e2e8f0'}}>
                <div style={{fontSize:'12px',color:'#64748b'}}>{label}</div>
                <div style={{fontSize:'22px',fontWeight:700,color:String(color)}}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #e2e8f0'}}>
              <h3 style={{marginBottom:'12px',fontSize:'14px',fontWeight:700}}>🔥 ტოპ ძებნები</h3>
              {(realStats.topQueries||[]).slice(0,10).map((q:any,i:number) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px'}}>
                  <span>{q.query}</span>
                  <span style={{fontWeight:700,color:'#3b82f6'}}>{q.cnt}</span>
                </div>
              ))}
            </div>
            <div style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #e2e8f0'}}>
              <h3 style={{marginBottom:'12px',fontSize:'14px',fontWeight:700}}>❌ Zero Results</h3>
              {(realStats.zeroQueries||[]).slice(0,10).map((q:any,i:number) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f1f5f9',fontSize:'13px'}}>
                  <span style={{color:'#ef4444'}}>{q.query}</span>
                  <span style={{fontWeight:700}}>{q.cnt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === 'leads' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
          {leads.slice(0, 30).map((l: any, i: number) => (
            <div key={i} style={{ padding: '12px 16px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                  {l.make} {l.model} {l.year} — {l.partName || l.oemCode}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{String(l.createdAt||'').slice(0,10)}</span>
              </div>
              {l.oemCode && <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '1px 8px', borderRadius: '6px' }}>OEM: {l.oemCode}</span>}
            </div>
          ))}
          {leads.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>ლიდები არ არის</div>
          )}
        </div>
      )}
      {/* Debug Tab */}
      {tab === 'debug' && (
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px'}}>
          <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
            <input value={debugQ} onChange={e=>setDebugQ(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&runDebug()}
              placeholder="gdb1183, ford transit კალოტკა..."
              style={{flex:1,border:'1px solid #e2e8f0',borderRadius:'10px',padding:'8px 14px',fontSize:'14px'}}/>
            <button onClick={runDebug} disabled={debugLoading}
              style={{background:'#0f172a',color:'#fff',border:'none',borderRadius:'10px',padding:'8px 20px',fontWeight:700,cursor:'pointer'}}>
              {debugLoading?'...':'ძებნა'}
            </button>
          </div>
          {debugResult && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'16px'}}>
                {Object.entries(debugResult.summary||{}).map(([k,v]:any)=>(
                  <div key={k} style={{padding:'10px',borderRadius:'10px',textAlign:'center',background:v?'#f0fdf4':'#fef2f2',border:`1px solid ${v?'#86efac':'#fca5a5'}`}}>
                    <div style={{fontSize:'18px'}}>{v?'✅':'❌'}</div>
                    <div style={{fontSize:'11px',fontWeight:700,color:'#475569'}}>{k.replace('Found','')}</div>
                  </div>
                ))}
              </div>
              {[
                ['SKU/Article', debugResult.results?.skuExact],
                ['OEM Match', debugResult.results?.oemMatch],
                ['Text Search', debugResult.results?.textMatch],
                ['Vehicle Cache', debugResult.results?.vehicleMatch],
              ].map(([title, items]:any)=>(
                <div key={title} style={{marginBottom:'12px'}}>
                  <div style={{fontWeight:700,fontSize:'13px',marginBottom:'4px'}}>{title} ({items?.length||0})</div>
                  {items?.length>0 ? items.map((p:any,i:number)=>(
                    <div key={i} style={{fontSize:'12px',padding:'4px 8px',background:'#f8fafc',borderRadius:'6px',marginBottom:'2px'}}>
                      {p.nameKa||p.manufacturer} {p.sku?`| SKU: ${p.sku}`:''} {p.vehicle_id?`| ID: ${p.vehicle_id}`:''}
                    </div>
                  )) : <div style={{fontSize:'12px',color:'#94a3b8',padding:'4px 8px'}}>0 შედეგი</div>}
                </div>
              ))}
              {debugResult.topFailedSearches?.length>0&&(
                <div>
                  <div style={{fontWeight:700,fontSize:'13px',marginBottom:'8px',color:'#ef4444'}}>❌ TOP Failed Searches</div>
                  {debugResult.topFailedSearches.map((f:any,i:number)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 8px',borderBottom:'1px solid #f1f5f9',cursor:'pointer'}}
                      onClick={()=>{setDebugQ(f.query);runDebug();}}>
                      <span style={{color:'#3b82f6',fontSize:'13px'}}>{f.query}</span>
                      <span style={{color:'#ef4444',fontWeight:700,fontSize:'13px'}}>{f.cnt}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}