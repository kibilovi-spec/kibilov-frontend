'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface AutodocCat {
  id: number;
  parentId: number | null;
  nameKa: string;
  nameEn: string;
  slug: string;
  level: number;
  imageUrl: string | null;
  productCount: number;
  children: AutodocCat[];
}

export function AutodocCategoryTree({ className = '' }: { className?: string }) {
  const [tree, setTree] = useState<AutodocCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AutodocCat | null>(null);

  useEffect(() => {
    api.get('/api/categories')
      .then(r => {
        if (r.data.success) {
          const cats = (r.data.data || []).map((c: any) => ({
            ...c,
            nameKa: c.nameKa || c.name || '',
            nameEn: c.nameEn || c.name || '',
            children: (c.subcategories || c.children || []).map((s: any) => ({
              ...s,
              nameKa: s.nameKa || s.name || '',
              nameEn: s.nameEn || s.name || '',
              slug: s.slug || String(s.id),
              children: []
            }))
          }));
          setTree(cats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array(15).fill(0).map((_,i) => (
        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-3"/>
          <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"/>
        </div>
      ))}
    </div>
  );

  if (selected) {
    return (
      <div>
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelected(null)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180"/>
            უკან
          </button>
          {selected.imageUrl && <img src={selected.imageUrl} alt="" className="w-8 h-8 object-contain"/>}
          <h2 className="text-xl font-bold text-gray-900">{selected.nameKa}</h2>
        </div>
        {/* Children grid */}
        {selected.children.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selected.children.map(child => (
              <Link key={child.id}
                href={`/categories/${child.slug}`}
                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition-all group">
                <div className="w-14 h-14 flex items-center justify-center mb-2">
                  {child.imageUrl
                    ? <img src={child.imageUrl} alt={child.nameKa} className="w-full h-full object-contain group-hover:scale-110 transition-transform" onError={(e)=>{(e.target as HTMLImageElement).style.display="none"}}/>
                    : <div className="w-12 h-12 bg-gray-100 rounded-lg"/>
                  }
                </div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-primary leading-tight">
                  {child.nameKa}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Link href={`/categories/${selected.slug}`}
            className="btn-primary inline-flex items-center gap-2">
            პროდუქტების ნახვა <ChevronRight className="w-4 h-4"/>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <style>{`@media(max-width:768px){.cat-grid{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:480px){.cat-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      <div className="cat-grid" style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)'}}>
        {tree.map(cat => (
          <button key={cat.id}
            onClick={() => cat.children.length > 0 ? setSelected(cat) : window.location.href=`/categories/${cat.slug}`}
            style={{background:'#fff',border:'1px solid #e8ecef',padding:'20px 12px 16px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',cursor:'pointer',outline:'none',transition:'background 0.15s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='#f8f9fa';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='#fff';}}>
            <div style={{width:'100%',height:'110px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
              {cat.imageUrl
                ? <img src={cat.imageUrl} alt={cat.nameKa} style={{maxWidth:'100%',maxHeight:'110px',objectFit:'contain'}}/>
                : <div style={{width:'70px',height:'70px',background:'#f1f3f5',borderRadius:'10px'}}/>
              }
            </div>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#0066CC',marginBottom:'10px',flexShrink:0}}/>
            <span style={{fontSize:'13px',fontWeight:400,color:'#1e3a5f',lineHeight:1.4}}>
              {cat.nameKa}
            </span>
          </button>
        ))}
      </div>
      <div style={{textAlign:'center',padding:'24px 0'}}>
        <a href="/products" style={{display:'inline-flex',alignItems:'center',gap:'8px',border:'1.5px solid #1e3a5f',borderRadius:'4px',padding:'12px 28px',fontSize:'13px',fontWeight:500,color:'#1e3a5f',textDecoration:'none',background:'#fff',transition:'all 0.2s'}}>ყველა კატეგორია →</a>
      </div>
    </div>
  );
}
