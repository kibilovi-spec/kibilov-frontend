'use client';
import { useLang } from '@/store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface AutodocCat {
  id: number;
  nameKa: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  children?: AutodocCat[];
}

export function AutodocCategoryTree({ className = '', vehicleId }: { className?: string; vehicleId?: string }) {
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const catName = (nameKa: string) => {
    if (!nameKa) return '';
    const parts = nameKa.split(' / ');
    if (parts.length === 2) {
      return lang === 'en' ? parts[0] : parts[1];
    }
    return nameKa;
  };
  const [tree, setTree] = useState<AutodocCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [cols, setCols] = useState(6);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val.length < 2) { setSuggestions([]); return; }
    const q = val.toLowerCase();
    const matches: string[] = [];
    tree.forEach(cat => {
      const catWords = cat.nameKa.toLowerCase().split(/[/\s,]+/);
      if (catWords.some((w: string) => w.startsWith(q)) || cat.nameKa.toLowerCase().startsWith(q)) {
        matches.push(cat.nameKa);
      }
      (cat.children || []).forEach((sub: any) => {
        const subWords = sub.nameKa.toLowerCase().split(/[/\s,]+/);
        if (subWords.some((w: string) => w.startsWith(q)) || sub.nameKa.toLowerCase().startsWith(q)) {
          matches.push(sub.nameKa);
        }
      });
    });
    setSuggestions(Array.from(new Set(matches)).slice(0, 6));
  };
  const router = useRouter();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const q = encodeURIComponent(search.trim());
    if (vehicleId) {
      router.push(`/products?q=${q}&vehicleId=${vehicleId}`);
    } else {
      router.push(`/products?q=${q}`);
    }
  };
  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 400) setCols(2);
      else if (window.innerWidth <= 600) setCols(2);
      else if (window.innerWidth <= 900) setCols(4);
      else setCols(6);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const COLS = cols;

  useEffect(() => {
    api.get('/api/categories/all-slugs')
      .then(r => {
        const all = r.data.data || [];
        const top = all.filter((c: any) => (c.level === 1 || c.level === '1') && c.slug !== 'uncategorized' && c.id !== 999999);
        // რეკურსიულად ვაგებთ ხეს — ნებისმიერი სიღრმის მხარდაჭერით (არა მხოლოდ 2 დონე)
        const buildNode = (cat: any): any => {
          const directChildren = all.filter((c: any) => String(c.parentId) === String(cat.id));
          const childNodes = directChildren.map(buildNode);
          // თუ ამ node-ს პროდუქტი არ აქვს და ზუსტად ერთი შვილი ჰყავს, "გავფენოთ" (pass-through container)
          const flattened = childNodes.length === 1 && !cat.productCount && childNodes[0].children?.length
            ? childNodes[0].children
            : childNodes;
          return {
            id: cat.id,
            nameKa: cat.nameKa || cat.name || '',
            slug: cat.slug || String(cat.id),
            imageUrl: cat.imageUrl || null,
            productCount: cat.productCount || 0,
            children: flattened,
          };
        };
        const withChildren = top.map(buildNode);
        setTree(withChildren);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{display:'grid',gridTemplateColumns:`repeat(${COLS},1fr)`,gap:'1px',background:'#e8ecef'}}>
      {Array(12).fill(0).map((_,i) => (
        <div key={i} style={{background:'#fff',height:'140px'}}/>
      ))}
    </div>
  );

  // rows-ად დავყოთ
  const rows: AutodocCat[][] = [];
  for (let i = 0; i < tree.length; i += COLS) {
    rows.push(tree.slice(i, i + COLS));
  }

  const openRowIndex = openId !== null ? Math.floor(tree.findIndex(c => c.id === openId) / COLS) : -1;
  const openCat = tree.find(c => c.id === openId);

  return (
    <div className={className}>
      <form onSubmit={handleSearch} style={{display:'flex',gap:'8px',marginBottom:'12px',position:'relative'}}>
        <input
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          onBlur={() => setTimeout(() => setSuggestions([]), 200)}
          placeholder="ნაწილის ძებნა... (ზეთის ფილტრი, სამუხრუჭე...)"
          style={{flex:1,padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #e2e8f0',fontSize:'14px',outline:'none'}}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <div style={{position:'absolute',top:'100%',left:0,right:'60px',background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:50,marginTop:'4px'}}>
            {suggestions.map((s, i) => (
              <button key={i} type="button"
                onMouseDown={() => { setSearch(s); setSuggestions([]); handleSearch({preventDefault:()=>{}} as any); }}
                style={{display:'block',width:'100%',textAlign:'left',padding:'8px 14px',border:'none',background:'none',cursor:'pointer',fontSize:'13px',color:'#334155',borderBottom: i < suggestions.length-1 ? '1px solid #f1f5f9' : 'none'}}>
                🔍 {s}
              </button>
            ))}
          </div>
        )}
        <button type="submit" style={{padding:'10px 20px',background:'#2563eb',color:'#fff',borderRadius:'10px',border:'none',cursor:'pointer',fontWeight:700,fontSize:'14px'}}>
          🔍
        </button>
      </form>
      <div style={{background:'#e8ecef',display:'flex',flexDirection:'column',gap:'1px'}}>
      <style>{`
        @media(max-width:900px){.cat-row{grid-template-columns:repeat(4,1fr)!important}}
        @media(max-width:600px){.cat-row{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:400px){.cat-row{grid-template-columns:repeat(2,1fr)!important}}
        .cat-tree-item:hover{background:#f5f7fa!important}
        .cat-tree-item.active{background:#ebf3ff!important;border-bottom:2px solid #2563eb!important}
        .cat-tree-item img{transition:transform 0.2s}
        .cat-tree-item:hover img{transform:scale(1.05)}
        .sub-link:hover{background:#ebf3ff!important;border-color:#2563eb!important}
      `}</style>

      {rows.map((row, rowIdx) => (
        <div key={rowIdx}>
          <div className="cat-row" style={{display:'grid',gridTemplateColumns:`repeat(${COLS},1fr)`,gap:'1px',background:'#e8ecef'}}>
            {row.map(cat => (
              <div
                key={cat.id}
                className={`cat-tree-item ${openId === cat.id ? 'active' : ''}`}
                style={{background:'#fff',padding:'20px 12px 16px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',cursor:'pointer',transition:'background 0.15s',borderBottom:'2px solid transparent'}}
                onClick={() => setOpenId(openId === cat.id ? null : cat.id)}
              >
                <div style={{width:'100%',height:'90px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'12px'}}>
                  {cat.imageUrl
                    ? <img src={cat.imageUrl?.replace(/\.png$/, '.webp')} alt={catName(cat.nameKa)} loading="lazy" style={{maxWidth:'90px',maxHeight:'90px',objectFit:'contain'}} onError={e=>{const t=e.target as HTMLImageElement; t.src=cat.imageUrl||''; t.onerror=()=>t.style.display='none';}}/>
                    : <div style={{width:'60px',height:'60px',background:'#f1f3f5',borderRadius:'8px'}}/>
                  }
                </div>
                <span style={{fontSize:'12px',fontWeight:500,color:'#1e3a5f',lineHeight:1.4}}>
                  {catName(cat.nameKa)}
                </span>
              </div>
            ))}
          </div>

          {openRowIndex === rowIdx && openCat && (
            <div style={{background:'#fff',borderTop:'3px solid #2563eb',padding:'20px 24px',position:'relative',boxShadow:'0 4px 16px rgba(0,0,0,0.10)'}}>
              <button onClick={() => setOpenId(null)} style={{position:'absolute',top:'12px',right:'16px',background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#94a3b8'}}>×</button>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'8px'}}>
                {openCat.children && openCat.children.length > 0 ? openCat.children.map(sub => (
                  <Link key={sub.id} href={vehicleId ? `/products?category=${sub.slug}&vehicleId=${vehicleId}` : `/categories/${sub.slug}`}
                    className="sub-link"
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'8px',textDecoration:'none',background:'#f8fafc',border:'1px solid #e2e8f0',transition:'all 0.15s'}}
                    onClick={() => setOpenId(null)}>
                    {sub.imageUrl && <img src={(sub.imageUrl||'').replace(/\.png$/, '.webp')} alt={sub.nameKa} loading="lazy" style={{width:'32px',height:'32px',objectFit:'contain'}} onError={e=>{(e.target as HTMLImageElement).src=sub.imageUrl||'';}}/>}
                    <span style={{fontSize:'12px',fontWeight:500,color:'#1e3a5f'}}>{catName(sub.nameKa)}</span>
                  </Link>
                )) : (
                  <Link href={vehicleId ? `/products?category=${openCat.slug}&vehicleId=${vehicleId}` : `/categories/${openCat.slug}`}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'8px',textDecoration:'none',background:'#f8fafc',border:'1px solid #e2e8f0'}}
                    onClick={() => setOpenId(null)}>
                    <span style={{fontSize:'12px',fontWeight:500,color:'#1e3a5f'}}>{catName(openCat.nameKa)} {lang==='en'?'all parts →':lang==='ru'?'все запчасти →':'ყველა ნაწილი →'}</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  );
}
