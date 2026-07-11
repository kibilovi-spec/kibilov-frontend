'use client';
import { useLang } from '@/store';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Part {
  articleId?: number;
  articleNo: string;
  code?: string;
  brand?: string;
  oems?: {oemBrand:string; oemDisplayNo:string}[];
  supplierName: string;
  articleProductName: string;
  image?: string|null;
  s3image?: string|null;
  inStock?: boolean;
  product?: { id: string; nameKa: string; price: number; stock: number } | null;
}

export default function VinPartsClient({ parts }: { parts: Part[] }) {
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const [supplierFilter, setSupplierFilter] = useState('');
  const [oemMap, setOemMap] = useState<Record<number,any[]>>({});
  const [loadingOem, setLoadingOem] = useState<number|null>(null);

  const loadOem = async (articleId: number) => {
    if (oemMap[articleId]) return;
    setLoadingOem(articleId);
    try {
      const r = await api.get(`/api/autodoc/article-oem/${articleId}`);
      const oems = r.data.oems?.articles?.[0]?.oemNo || [];
      setOemMap(prev => ({...prev, [articleId]: oems}));
    } catch {}
    setLoadingOem(null);
  };

  const brandOf = (p: Part) => p.supplierName || p.brand || '';
  const filtered = parts.filter(p => !supplierFilter || brandOf(p) === supplierFilter);
  const suppliers = Array.from(new Set(parts.map(brandOf).filter(Boolean))).slice(0, 10) as string[];

  if (parts.length === 0) {
    return <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>ნაწილები ვერ მოიძებნა</div>;
  }

  return (
    <>
      {suppliers.length > 1 && (
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'16px',alignItems:'center'}}>
          <span style={{fontSize:'12px',color:'#64748b',fontWeight:600}}>ბრენდი:</span>
          <button onClick={() => setSupplierFilter('')}
            style={{padding:'4px 10px',borderRadius:'6px',border:!supplierFilter?'1.5px solid #0066CC':'1px solid #e2e8f0',background:!supplierFilter?'#eff6ff':'#fff',color:!supplierFilter?'#0066CC':'#64748b',fontSize:'11px',cursor:'pointer'}}>
            ყველა
          </button>
          {suppliers.map(s => (
            <button key={s} onClick={() => setSupplierFilter(s === supplierFilter ? '' : s)}
              style={{padding:'4px 10px',borderRadius:'6px',border:supplierFilter===s?'1.5px solid #0066CC':'1px solid #e2e8f0',background:supplierFilter===s?'#eff6ff':'#fff',color:supplierFilter===s?'#0066CC':'#64748b',fontSize:'11px',cursor:'pointer'}}>
              {s}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>ნაწილები ვერ მოიძებნა</div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'12px'}}>
          {filtered.slice(0, 40).map((p, i) => (
            <div key={i} style={{background: p.inStock ? '#f0fdf4' : '#fff', border: p.inStock ? '1px solid #86efac' : '1px solid #e2e8f0',borderRadius:'12px',padding:'12px',display:'flex',gap:'12px',alignItems:'flex-start'}}>
              {(p.image || p.s3image) && (
                <img src={p.image || p.s3image || ''} alt={p.articleProductName}
                  style={{width:'70px',height:'70px',objectFit:'contain',borderRadius:'8px',flexShrink:0}}
                  onError={(e) => {(e.target as HTMLImageElement).style.display='none'}} />
              )}
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:700,color:'#1e3a5f',marginBottom:'2px'}}>{p.articleProductName}</div>
                <div style={{fontSize:'11px',color:'#64748b',marginBottom:'2px'}}>{p.supplierName || p.brand} · <span style={{fontFamily:'monospace',color:'#0066CC'}}>{p.code || p.articleNo}</span></div>
                {p.articleId && (
                  <div style={{marginBottom:'4px'}}>
                    {oemMap[p.articleId] ? (
                      <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                        {oemMap[p.articleId].slice(0,4).map((o:any,i:number) => (
                          <span key={i} style={{background:'#f0f7ff',border:'1px solid #bfdbfe',borderRadius:'4px',padding:'2px 6px',fontSize:'10px',fontFamily:'monospace',color:'#1e3a5f'}}>{o.oemBrand}: {o.oemDisplayNo}</span>
                        ))}
                      </div>
                    ) : (
                      <button onClick={() => loadOem(p.articleId!)} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'4px',padding:'2px 8px',fontSize:'10px',color:'#0066CC',cursor:'pointer'}}>
                        {loadingOem===p.articleId ? '...' : '🔍 OEM კოდები'}
                      </button>
                    )}
                  </div>
                )}
                {p.inStock && p.product ? (
                  <>
                    <div style={{fontSize:'16px',fontWeight:800,color:'#0066CC',margin:'4px 0'}}>{p.product.price}₾</div>
                    <div style={{display:'flex',gap:'6px'}}>
                      <Link href={`/products/${p.product.id}`}
                        style={{flex:1,background:'#0066CC',color:'#fff',padding:'6px',borderRadius:'6px',fontSize:'11px',fontWeight:700,textAlign:'center',textDecoration:'none'}}>
                        ნახვა
                      </Link>
                      <a href={`https://wa.me/995577575052?text=${encodeURIComponent(p.product.nameKa+' - '+p.product.price+'₾')}`}
                        target="_blank"
                        style={{flex:1,background:'#25d366',color:'#fff',padding:'6px',borderRadius:'6px',fontSize:'11px',fontWeight:700,textAlign:'center',textDecoration:'none'}}>
                        შეკვეთა
                      </a>
                    </div>
                  </>
                ) : (
                  <a href={`https://wa.me/995577575052?text=${encodeURIComponent('გამარჯობა! '+p.articleProductName+' '+p.supplierName+' '+p.articleNo+' - გამოიძიეთ ფასი')}`}
                    target="_blank"
                    style={{display:'block',background:'#1e3a5f',color:'#fff',padding:'6px',borderRadius:'6px',fontSize:'11px',fontWeight:700,textAlign:'center',textDecoration:'none',marginTop:'4px'}}>
                    📱 შეკვეთა
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
