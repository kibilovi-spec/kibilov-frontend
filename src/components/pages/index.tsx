'use client';
import { OemAutocomplete } from '@/components/OemAutocomplete';
import { SearchableSelect } from '@/components/SearchableSelect';
// This file contains all page-level components
// Each is used by the corresponding page.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/store';
import { useVehicleStore } from '@/store/vehicle';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';
import { ProductCard, FilterBar, type Filters } from '@/components/shop/index';
import { Loader, Pagination } from '@/components/ui/index';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { AutodocCategoryTree } from '@/components/AutodocCategoryTree';
import RecentlyViewed from '@/components/RecentlyViewed';
import { CompatibilityBanner } from '@/components/vehicle/CompatibilityBanner';
import type { Product, Category } from '@/types';

// ══════════════════════════════════════════
// HomePage
// ══════════════════════════════════════════
function HeroSlider() {
  const [cur, setCur] = useState(0);
  const slides = [
    {bg:'linear-gradient(135deg,#1e3a5f,#2563eb)',icon:'🔥',label:'სეზონური აქცია',title:'სამუხრუჭე სისტემა',sub1:'MEYLE · BREMBO · TRW',sub2:'ივნისის ბოლომდე',btn:'15% ფასდაკლება →',btnBg:'#fcd34d',btnColor:'#1a2a4a',labelColor:'#fcd34d',href:'/products?category=brake'},
    {bg:'linear-gradient(135deg,#064e3b,#059669)',icon:'⚡',label:'B2B პორტალი',title:'სერვის ცენტრები',sub1:'სპეციალური ფასები',sub2:'საბითუმო შეკვეთები',btn:'რეგისტრაცია →',btnBg:'#6ee7b7',btnColor:'#064e3b',labelColor:'#6ee7b7',href:'/b2b-apply'},
    {bg:'linear-gradient(135deg,#4c1d95,#7c3aed)',icon:'🚗',label:'VIN სკანირება',title:'AI ავტო-შერჩევა',sub1:'სურათიდან VIN',sub2:'ნაწილები ავტომატურად',btn:'სცადე ახლა →',btnBg:'#c4b5fd',btnColor:'#4c1d95',labelColor:'#c4b5fd',href:'/garage'},
    {bg:'linear-gradient(135deg,#7c2d12,#dc2626)',icon:'🛢️',label:'ახალი პარტია',title:'ზეთი და ფილტრები',sub1:'Castrol · Mobil · Shell',sub2:'საწყობში მარაგში',btn:'ნახვა →',btnBg:'#fca5a5',btnColor:'#7c2d12',labelColor:'#fca5a5',href:'/products?category=filters'},
  ];
  useEffect(()=>{
    const t = setInterval(()=>setCur((c:number)=>(c+1)%4), 3000);
    return ()=>clearInterval(t);
  },[]);
  const s = slides[cur];
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{flex:1,background:s.bg,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'20px',textAlign:'center'}}>
        <div style={{fontSize:'30px',marginBottom:'8px'}}>{s.icon}</div>
        <div style={{color:s.labelColor,fontSize:'9px',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'6px'}}>{s.label}</div>
        <div style={{color:'#fff',fontSize:'17px',fontWeight:900,marginBottom:'5px'}}>{s.title}</div>
        <div style={{color:'rgba(255,255,255,0.7)',fontSize:'11px',marginBottom:'14px'}}>{s.sub1}<br/>{s.sub2}</div>
        <Link href={s.href} style={{background:s.btnBg,color:s.btnColor,borderRadius:'20px',padding:'6px 18px',fontSize:'11px',fontWeight:800,textDecoration:'none'}}>{s.btn}</Link>
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:'5px',padding:'7px',background:'rgba(0,0,0,0.2)'}}>
        {slides.map((_,i)=>(
          <span key={i} onClick={()=>setCur(i)} style={{width:'7px',height:'7px',borderRadius:'50%',background:i===cur?'#fff':'rgba(255,255,255,0.35)',display:'inline-block',cursor:'pointer'}}/>
        ))}
      </div>
    </div>
  );
}

export function HomePage({ initialCategories = [], initialFeatured = [] }: { initialCategories?: Category[], initialFeatured?: Product[] } = {}) {
  const { lang } = useLang();
  const t = useT(lang);
  const [categories, setCats] = useState<Category[]>(initialCategories);
  const searchOem = async (oem: string) => {
    try {
      const r = await fetch('/api/autodoc/find-product?oem='+encodeURIComponent(oem));
      const d = await r.json();
      if (d.found && d.product?.id) {
        window.location.href = '/products/'+d.product.id;
      } else {
        window.location.href = '/oem/'+encodeURIComponent(oem);
      }
    } catch { window.location.href = '/products?search='+encodeURIComponent(oem); }
  };
  const [featured, setFeatured] = useState<Product[]>(initialFeatured);

  useEffect(() => {
    api.get(`/api/categories?lang=${lang}`).then(({data})=>setCats(data.data||[])).catch(()=>{});
    api.get(`/api/products?featured=true&lang=${lang}&limit=8`).then(({data})=>setFeatured(data.data||[])).catch(()=>{});
  }, [lang]);

  useEffect(() => {
    const addTilt = () => {
      const cards = document.querySelectorAll('.product-card-item');
      cards.forEach((card: any) => {
        card.addEventListener('mousemove', (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(800px) rotateX(${y*-10}deg) rotateY(${x*12}deg) translateY(-4px)`;
          card.style.boxShadow = `${x*8}px ${y*8}px 24px rgba(37,99,235,0.18)`;
          card.style.transition = 'box-shadow 0.1s';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.boxShadow = '';
          card.style.transition = 'all 0.5s cubic-bezier(0.23,1,0.32,1)';
        });
      });
    };
    const timer = setTimeout(addTilt, 1000);
    return () => clearTimeout(timer);
  }, [featured]);

  const BRANDS = [
    {name:'BOSCH', slug:'bosch'},
    {name:'MANN', slug:'mann-filter'},
    {name:'NGK', slug:'ngk'},
    {name:'SACHS', slug:'sachs'},
    {name:'FEBI', slug:'febi'},
    {name:'VALEO', slug:'valeo'},
    {name:'MAHLE', slug:'mahle'},
    {name:'CASTROL', slug:'castrol'},
    {name:'DENSO', slug:'denso'},
    {name:'LIQUI MOLY', slug:'liqui-moly'},
    {name:'MEYLE', slug:'meyle'},
    {name:'KYB', slug:'kyb'},
    {name:'TRW', slug:'trw'},
    {name:'DAYCO', slug:'dayco'},
  ];

  const MAKES: Record<string,string[]> = {
    Toyota:['Camry','Corolla','RAV4','Land Cruiser','Land Cruiser Prado','Prius','Yaris','Hilux','FJ Cruiser','Fortuner','Venza','Highlander','Sequoia','4Runner','Avensis','Auris','Alphard','Vellfire'],
    Hyundai:['Tucson','Santa Fe','Elantra','Sonata','Accent','Creta','ix35','i30','i20','i10','Getz','Trajet','H-1','Porter','Terracan'],
    Kia:['Sportage','Sorento','Rio','Ceed','Optima','Stinger','Carnival','Telluride','Seltos','Picanto','Cerato','Mohave','Cadenza'],
    'Mercedes-Benz':['C-Class','E-Class','S-Class','GLE','GLC','GLA','GLK','ML-Class','Sprinter','Vito','A-Class','B-Class','CLA','CLS','G-Class'],
    BMW:['3 Series','5 Series','7 Series','X1','X3','X5','X6','X7','1 Series','2 Series','4 Series','6 Series','M3','M5'],
    Volkswagen:['Golf','Passat','Tiguan','Touareg','Polo','Jetta','Caddy','Transporter','Multivan','Amarok','Sharan'],
    Nissan:['X-Trail','Qashqai','Patrol','Navara','Juke','Note','Almera','Primera','Murano','Pathfinder'],
    Chevrolet:['Cruze','Captiva','Tahoe','Suburban','Malibu','Spark','Aveo','Lacetti','Cobalt','Traverse','Equinox','Blazer','Silverado'],
    Mitsubishi:['Outlander','Pajero','Pajero Sport','L200','Eclipse Cross','ASX','Galant','Lancer'],
    Honda:['CR-V','Civic','Accord','Pilot','HR-V','Jazz','Fit','Stream','Odyssey'],
    Mazda:['CX-5','CX-9','CX-3','Mazda3','Mazda6','Mazda2','MPV','BT-50'],
    Subaru:['Forester','Outback','Impreza','Legacy','XV','WRX'],
    Lexus:['RX','GX','LX','NX','IS','ES','GS','LS','UX','CT'],
    Audi:['A3','A4','A5','A6','A7','A8','Q3','Q5','Q7','Q8','TT','S4','S6'],
    'Land Rover':['Discovery','Discovery Sport','Range Rover','Range Rover Sport','Range Rover Evoque','Freelander','Defender'],
    Jeep:['Grand Cherokee','Cherokee','Wrangler','Compass','Patriot','Renegade'],
    Ford:['Focus','Mondeo','Kuga','Explorer','F-150','Ranger','Transit','Escape','Edge','Fusion','Mustang'],
    Opel:['Astra','Vectra','Zafira','Insignia','Mokka','Antara','Corsa','Meriva','Omega'],
    Renault:['Duster','Megane','Logan','Sandero','Koleos','Fluence','Laguna','Clio','Captur','Kadjar'],
    Peugeot:['207','208','307','308','407','408','2008','3008','5008','508','Partner'],
    Citroen:['C3','C4','C5','C-Crosser','Berlingo','Jumper','Xsara'],
    Skoda:['Octavia','Superb','Fabia','Rapid','Kodiaq','Karoq','Yeti'],
    Volvo:['XC90','XC60','XC40','S60','S80','S90','V40','V60','V70','V90'],
    Porsche:['Cayenne','Macan','Panamera','911','Boxster','Cayman'],
    Infiniti:['QX56','QX80','QX60','FX35','FX37','G37','M37'],
    Acura:['MDX','RDX','TL','TSX'],
    Cadillac:['Escalade','SRX','CTS','ATS'],
    Lincoln:['Navigator','MKX','MKZ','Town Car'],
    Chrysler:['300C','Pacifica','Voyager'],
    Dodge:['Durango','Journey','Charger','Challenger','RAM'],
    GMC:['Yukon','Tahoe','Sierra','Envoy','Terrain'],
    UAZ:['Patriot','Hunter','Pickup','452'],
    Lada:['Niva','Granta','Vesta','Largus','Kalina','Priora','2107','2106'],
    'Ssang Yong':['Rexton','Actyon','Kyron','Musso','Korando','Tivoli'],
    Isuzu:['D-Max','Trooper','MU-X','NPR'],
    Suzuki:['Grand Vitara','Vitara','Swift','SX4','Jimny'],
    Haval:['H6','H2','H9','F7','Jolion'],
    Geely:['Atlas','Coolray','Emgrand','MK'],
    Chery:['Tiggo','Arrizo','QQ','Amulet'],
  };
  const [selectorTab,setSelectorTab]=useState<'vehicle'|'oem'>('vehicle');
  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({length: 35}, (_,i) => String(currentYear - i));

  // Vehicle Store — PostgreSQL-based, Zustand global state
  const { vehicle, setMake, setModel, setYear, setVehicle, setEngine } = useVehicleStore();
  const engine = vehicle.engine || '';
  const make  = vehicle.make;
  const model = vehicle.model;
  const year  = vehicle.year;

  const [pgMakes, setPgMakes] = useState<{id:string,name:string,is_popular:boolean}[]>([]);
  const [pgModels, setPgModels] = useState<{id:string,name:string,nameRaw?:string,yearFrom?:number,yearTo?:number,imageUrl?:string}[]>([]);
  const [pgYears, setPgYears] = useState<number[]>([]);
  const [pgEngines, setPgEngines] = useState<{vehicle_id:string,name:string,engine?:string,fuel?:string,power_hp?:number}[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Makes — Autodoc
  useEffect(() => {
    setLoadingMakes(true);
    fetch('/api/vehicles/makes')
      .then(r => r.json())
      .then(d => {
        if (d.success) setPgMakes((d.data||[]).map((name:string)=>({id:name,name,is_popular:false})));
      })
      .catch(() => {})
      .finally(() => setLoadingMakes(false));
  }, []);

  // Models — Autodoc
  useEffect(() => {
    if (!make) { setPgModels([]); setPgYears([]); return; }
    setLoadingModels(true);
    fetch(`/api/vehicles/models?make=${encodeURIComponent(make)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setPgModels((d.data||[]).map((m:any)=> typeof m === 'string' ? {id:m,name:m} : {id:m.id||m.name,name:m.name,nameRaw:m.nameRaw,yearFrom:m.yearFrom,yearTo:m.yearTo,imageUrl:m.imageUrl}));
      })
      .catch(() => {})
      .finally(() => setLoadingModels(false));
  }, [make]);

  // Years — Autodoc
  useEffect(() => {
    if (!make || !model) { setPgYears([]); return; }
    fetch(`/api/vehicles/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPgYears(d.data || []); })
      .catch(() => {});
  }, [make, model]);

  // Engines — Autodoc
  useEffect(() => {
    if (!make || !model) { setPgEngines([]); return; }
    const url = year
      ? `/api/vehicles/engines?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`
      : `/api/vehicles/engines?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success) setPgEngines((d.data||[]).map((e:any)=> typeof e === 'string' ? {vehicle_id:e,name:e} : {vehicle_id:String(e.vehicle_id),name:e.name||e.engine,engine:e.engine,fuel:e.fuelType,power_hp:e.powerKw}));
      })
      .catch(() => {});
  }, [make, model, year]);

  // Resolve vehicleId when make+model+year are set
  useEffect(() => {
    if (!make || !model) return;
    fetch(`/api/vehicles/resolve?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${year?'&year='+year:''}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setVehicle({
          makeId:    d.makeId,
          modelId:   d.modelId,
          vehicleId: d.vehicleId,
        });
      })
      .catch(() => {});
  }, [make, model, year]);

  const PROMOS = [
    {icon:'🚚',title:t.freeDelivery,desc:t.freeDeliveryDesc},
    {icon:'✅',title:t.originalParts,desc:t.originalDesc},
    {icon:'🔄',title:t.returnPolicy,desc:t.returnDesc},
    {icon:'🔧',title:t.expertHelp,desc:t.expertDesc},
  ];

  return (
    <div style={{background:'#f1f5f9',minHeight:'100vh'}}>
      <style>{`
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important}
          .hero-left-col{margin:16px 16px 8px 16px!important}
          .hero-vin-col{margin:0 16px 8px 16px!important;border-radius:10px}
          .hero-slider-col{margin:0 16px 16px 16px!important;min-height:220px}
          .cat-nav-bar{display:none!important}
          .brands-grid{grid-template-columns:repeat(3,1fr)!important}
          .promo-grid{grid-template-columns:repeat(2,1fr)!important}
          .prod-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:480px){
          .brands-grid{grid-template-columns:repeat(2,1fr)!important}
          .promo-grid{grid-template-columns:1fr!important}
          .prod-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      <div className='cat-nav-bar' style={{background:'#163050',padding:'0 12px',display:'flex',overflowX:'auto',WebkitOverflowScrolling:'touch',msOverflowStyle:'none',scrollbarWidth:'none'}}>
        {[['🔧 სამუხრუჭე','brake'],['⚙️ ძრავი','engine'],['🔩 სამოჭერი','suspension'],['💡 ელექტრიკა','electrical'],['❄️ გაგრილება','cooling'],['🛢️ ზეთი','filters'],['🔄 კოლოფი','transmission'],['🚗 კარავანი','body']].map(([label,cat])=>(
          <Link key={String(cat)} href={`/products?category=${cat}`} style={{color:'#93c5fd',fontSize:'11px',padding:'8px 10px',whiteSpace:'nowrap',borderBottom:'2px solid transparent',textDecoration:'none',display:'block'}}>{label}</Link>
        ))}
      </div>
      <h1 className="sr-only">ავტონაწილები საქართველოში — kibilov.ge</h1>
      <div className='hero-grid' style={{background:'linear-gradient(135deg,#0066CC,#003d7a)',borderBottom:'1px solid #002d5a',display:'grid',gridTemplateColumns:'1fr 1fr 1fr'}}>
        {/* 1. ავტომობილის შერჩევა */}
        <div className='hero-left-col' style={{background:'#fff',margin:'16px 0 16px 16px',borderRadius:'10px',padding:'16px',display:'flex',flexDirection:'column',gap:'6px'}}>
          <div style={{fontSize:'11px',fontWeight:800,color:'#0066CC',display:'flex',alignItems:'center',gap:'5px',marginBottom:'2px'}}><span>🚗</span> ავტომობილის ძებნა</div>
          <div style={{fontSize:'9px',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.3px',display:'flex',alignItems:'center',gap:'5px'}}>
            <span style={{background:make?'#0066CC':'#cbd5e1',color:make?'#fff':'#64748b',width:'14px',height:'14px',borderRadius:'50%',fontSize:'8px',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>1</span> Make
            {loadingMakes&&<span style={{fontSize:'9px',color:'#94a3b8'}}>...</span>}
          </div>
          <SearchableSelect
            value={make}
            onChange={(name, id) => { const sel = pgMakes.find(m=>m.name===name); if(sel) setMake(sel.name, sel.id); else setMake(name, id||name); }}
            options={pgMakes.length>0 ? pgMakes : Object.keys(MAKES).sort().map(m=>({name:m}))}
            placeholder="— Make —"
            loading={loadingMakes}
          />
          <div style={{fontSize:'9px',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.3px',display:'flex',alignItems:'center',gap:'5px'}}>
            <span style={{background:model?'#0066CC':'#cbd5e1',color:model?'#fff':'#64748b',width:'14px',height:'14px',borderRadius:'50%',fontSize:'8px',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>2</span> Model
            {loadingModels&&<span style={{fontSize:'9px',color:'#94a3b8'}}>...</span>}
          </div>
          <SearchableSelect
            value={model}
            onChange={(name, id) => { const sel = pgModels.find((m:any)=>m.name===name); if(sel) setModel((sel as any).nameRaw || sel.name, sel.id); else setModel(name, id||name); }}
            options={pgModels.length>0 ? pgModels.map((m:any)=>({id:m.id, name:m.name})) : (make&&MAKES[make as keyof typeof MAKES]?.map(m=>({name:m}))||[])}
            placeholder="— Model —"
            loading={loadingModels}
            disabled={!make}
          />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
            <div>
              <div style={{fontSize:'9px',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.3px',marginBottom:'3px',display:'flex',alignItems:'center',gap:'4px'}}>
                <span style={{background:year?'#0066CC':'#cbd5e1',color:year?'#fff':'#64748b',width:'14px',height:'14px',borderRadius:'50%',fontSize:'8px',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>3</span> Year
              </div>
              <select value={year} onChange={e=>setYear(e.target.value)} disabled={!model} style={{width:'100%',fontSize:'11px',padding:'6px 8px',borderRadius:'6px',border:'1.5px solid #e2e8f0',background:'#f8fafc',color:year?'#1e293b':'#94a3b8',outline:'none',cursor:'pointer',opacity:model?1:0.5}}>
                <option value="">— Year —</option>
                {(pgYears.length>0?pgYears:YEARS).map(y=><option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:'9px',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.3px',marginBottom:'3px',display:'flex',alignItems:'center',gap:'4px'}}>
                <span style={{background:engine?'#0066CC':'#cbd5e1',color:engine?'#fff':'#64748b',width:'14px',height:'14px',borderRadius:'50%',fontSize:'8px',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>4</span> Engine
              </div>
              <SearchableSelect
              value={engine}
              onChange={(name) => { const sel=pgEngines.find(v=>(v.name||v.engine||v.vehicle_id)===name); if(sel){setEngine(sel.name||'');setVehicle({vehicleId:sel.vehicle_id,engine:sel.engine||sel.name});}}}
              options={pgEngines.map(v=>({id:v.vehicle_id, name:v.name||v.engine||v.vehicle_id}))}
              placeholder="— Engine —"
              disabled={!year && pgEngines.length===0}
            />
            </div>
          </div>
          <button disabled={!make||!model} onClick={async ()=>{
            if (!make||!model) return;
            try {
              const r = await fetch(`/api/vehicles/resolve?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${year?'&year='+year:''}`);
              const d = await r.json();
              if (d.success && d.vehicleId) {
                window.location.href = `/vin?vehicleId=${d.vehicleId}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${year?'&year='+year:''}`;
              } else {
                window.location.href = `/products?search=${encodeURIComponent(make+' '+model)}`;
              }
            } catch {
              window.location.href = `/products?search=${encodeURIComponent(make+' '+model)}`;
            }
          }} style={{width:'100%',background:make&&model?'#0066CC':'#cbd5e1',color:'#fff',border:'none',borderRadius:'7px',padding:'9px',fontSize:'12px',fontWeight:800,cursor:(make&&model)?'pointer':'not-allowed',marginTop:'2px'}}>{make&&model?`${make} ${model}${year?' '+year:''} — ძებნა →`:'ნაწილების ნახვა →'}</button>
          <Link href="/garage" style={{display:'block',background:'#f0f7ff',border:'1px solid #bfdbfe',borderRadius:'7px',padding:'6px',color:'#0066CC',fontSize:'10px',fontWeight:600,textAlign:'center',textDecoration:'none'}}>🏠 ჩემი გარაჯი</Link>
        </div>
        {/* 2. VIN / OEM */}
        <div className='hero-vin-col' style={{background:'rgba(255,255,255,0.1)',margin:'16px 0 16px 12px',borderRadius:'10px',padding:'16px',display:'flex',flexDirection:'column',justifyContent:'center',gap:'12px',border:'1px solid rgba(255,255,255,0.2)'}}>
          <div style={{fontSize:'11px',fontWeight:700,color:'#fff',display:'flex',alignItems:'center',gap:'5px'}}><span>🔍</span> სწრაფი ძებნა</div>
          <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
            <div style={{color:'#93c5fd',fontSize:'9px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>📷 VIN კოდი</div>
            <input id="vin-search-input" style={{width:'100%',fontSize:'11px',padding:'7px 9px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(0,0,0,0.25)',color:'#fff',outline:'none',boxSizing:'border-box' as 'border-box'}} placeholder="VIN (17 სიმბოლო)" onKeyDown={e=>{if(e.key==='Enter'){const el=e.target as HTMLInputElement;if(el.value.trim()){window.dispatchEvent(new CustomEvent('kibilov-ai-search',{detail:el.value.trim()}));el.value=''}}}}/>
            <div style={{display:'flex',gap:'6px'}}>
              <button onClick={()=>{const el=document.getElementById('vin-search-input') as HTMLInputElement;if(el?.value.trim()){window.location.href='/vin?vin='+encodeURIComponent(el.value.trim())}}} style={{flex:1,background:'rgba(255,255,255,0.9)',color:'#0066CC',border:'none',borderRadius:'6px',padding:'7px',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>ძებნა →</button>
              <Link href="/vin?tab=camera" style={{background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'6px',padding:'7px 10px',fontSize:'11px',textDecoration:'none',display:'flex',alignItems:'center'}}>📷</Link>
            </div>
          </div>
          <div style={{height:'1px',background:'rgba(255,255,255,0.15)'}}/>
          <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
            <div style={{color:'#93c5fd',fontSize:'9px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>🔧 OEM კოდი</div>
            <OemAutocomplete onSearch={searchOem} placeholder="OEM (მაგ.: 2115401717)" />
            <button onClick={()=>{const el=document.querySelector('input[placeholder*="OEM"]') as HTMLInputElement;if(el?.value.trim()){searchOem(el.value.trim())}}} style={{width:'100%',background:'rgba(255,255,255,0.9)',color:'#0066CC',border:'none',borderRadius:'6px',padding:'7px',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>ძებნა →</button>
          </div>
        </div>
        {/* 3. სლაიდერი */}
        <div className='hero-slider-col' style={{margin:'16px 16px 16px 12px',borderRadius:'10px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <HeroSlider/>
        </div>
      </div>
      <div style={{background:'#fff',padding:'16px 24px',borderBottom:'1px solid #f1f5f9'}}>
        <div className='promo-grid' style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
          {PROMOS.map(p=>(
            <div key={p.title} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'12px',display:'flex',alignItems:'center',gap:'10px'}}>
              <span style={{fontSize:'22px'}}>{p.icon}</span>
              <div><div style={{fontSize:'11px',fontWeight:700,color:'#1e3a5f'}}>{p.title}</div><div style={{fontSize:'10px',color:'#94a3b8',marginTop:'1px'}}>{p.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'#fff',padding:'20px 24px',borderBottom:'1px solid #f1f5f9'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <h2 style={{fontSize:'15px',fontWeight:800,color:'#1e3a5f',display:'flex',alignItems:'center',gap:'8px'}}><span style={{display:'inline-block',width:'3px',height:'18px',background:'#2563eb',borderRadius:'2px'}}/>კატეგორიები</h2>
          
        </div>
        <AutodocCategoryTree className="w-full" />
      </div>
      <div style={{background:'#fff',padding:'20px 24px',borderBottom:'1px solid #f1f5f9'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <h2 style={{fontSize:'15px',fontWeight:800,color:'#1e3a5f',display:'flex',alignItems:'center',gap:'8px'}}><span style={{display:'inline-block',width:'3px',height:'18px',background:'#2563eb',borderRadius:'2px'}}/>{t.popularBrands}</h2>

        </div>
        <div className='brands-grid' style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'10px'}}>
          {BRANDS.map(b=>(
            <Link key={b.name} href={`/products?brand=${b.name}`} prefetch={false} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'12px',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',textDecoration:'none'}}>
              <div style={{height:'36px',display:'flex',alignItems:'center',justifyContent:'center',width:'100%'}}>
                <img src={`/images/brands/${b.slug}.png`} alt={b.name} style={{maxHeight:'32px',maxWidth:'100%',objectFit:'contain'}} onError={(e)=>{const t=e.target as HTMLImageElement;t.style.display='none';(t.nextSibling as HTMLElement)?.style&&((t.nextSibling as HTMLElement).style.display='block');}}/>
                <span style={{display:'none',fontSize:'10px',fontWeight:700,color:'#374151'}}>{b.name}</span>
              </div>
              <span style={{fontSize:'9px',fontWeight:600,color:'#94a3b8'}}>{b.name}</span>
            </Link>
          ))}
        </div>
        <div style={{textAlign:'center',paddingTop:'20px'}}>
          <Link href="/brands" style={{display:'inline-flex',alignItems:'center',gap:'8px',border:'1.5px solid #1e3a5f',borderRadius:'4px',padding:'12px 28px',fontSize:'13px',fontWeight:500,color:'#1e3a5f',textDecoration:'none'}}>ყველა ბრენდი →</Link>
        </div>
      </div>
      <div style={{background:'#fff',padding:'20px 24px',borderBottom:'1px solid #f1f5f9'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <h2 style={{fontSize:'15px',fontWeight:800,color:'#1e3a5f',display:'flex',alignItems:'center',gap:'8px'}}><span style={{display:'inline-block',width:'3px',height:'18px',background:'#2563eb',borderRadius:'2px'}}/>{t.popularParts}</h2>

        </div>
        {featured.length===0?<Loader/>:(
          <div id="kibilov-prodgrid" className='prod-grid' style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px'}}>
            {featured.map(p=><ProductCard key={p.id} product={p}/>)}
          </div>
        )}
        <div style={{textAlign:'center',paddingTop:'20px'}}>
          <Link href="/products" style={{display:'inline-flex',alignItems:'center',gap:'8px',border:'1.5px solid #1e3a5f',borderRadius:'4px',padding:'12px 28px',fontSize:'13px',fontWeight:500,color:'#1e3a5f',textDecoration:'none'}}>ყველა ნაწილი →</Link>
        </div>
      </div>
      <div style={{padding:'16px 24px'}}>
        <div style={{background:'linear-gradient(135deg,#064e3b,#059669)',borderRadius:'10px',padding:'20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:800,marginBottom:'4px'}}>B2B საბითუმო პორტალი</h3>
            <p style={{color:'#a7f3d0',fontSize:'12px'}}>სერვის ცენტრებისთვის, მაღაზიებისთვის — სპეციალური ფასები</p>
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <Link href="/b2b" style={{background:'#fff',color:'#059669',borderRadius:'7px',padding:'10px 22px',fontSize:'12px',fontWeight:700,textDecoration:'none'}}>B2B შესვლა</Link>
            <Link href="/b2b-apply" style={{background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,0.35)',borderRadius:'7px',padding:'10px 22px',fontSize:'12px',textDecoration:'none'}}>რეგისტრაცია</Link>
          </div>
        </div>
      </div>
      <RecentlyViewed />
    </div>
  );
}
// ══════════════════════════════════════════
// ProductsPage
// ══════════════════════════════════════════
export function ProductsPage({ searchParams, initialProducts, initialPagination, initialBrands }: {
  searchParams?: Record<string,string>;
  initialProducts?: Product[];
  initialPagination?: { page:number; pages:number; total:number };
  initialBrands?: string[];
}) {
  const { lang } = useLang();
  const t = useT(lang);
  const router = useRouter();
  const urlParams = useSearchParams();
  const hasInitial = !!(initialProducts && initialProducts.length >= 0 && initialPagination);
  const skipFirstLoad = useRef(hasInitial);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [pagination, setPagination] = useState(initialPagination || { page:1, pages:1, total:0 });
  const [brands, setBrands] = useState<string[]>(initialBrands || []);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!hasInitial);
  const getFiltersFromUrl = () => {
    const p: Record<string,any> = { page: 1 };
    urlParams.forEach((v, k) => { p[k] = v === 'true' ? true : v === 'false' ? false : v; });
    return p;
  };
  const [filters, setFilters] = useState<Filters>(Object.keys(searchParams||{}).length ? {...searchParams, page:1} : getFiltersFromUrl() as any);

  useEffect(() => {
    api.get(`/api/categories?lang=${lang}`).then(({data}) => setCats(data.data || [])).catch(() => {});
  }, [lang]);

  const load = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      Object.entries({...f, lang}).forEach(([k,v])=>{ if(v!==undefined&&v!==''&&v!==false) p.append(k,String(v)); });
      const {data} = await api.get(`/api/products?${p}`);
      setProducts(data.data||[]);
      setPagination(data.pagination||{page:1,pages:1,total:0});
      setBrands(data.meta?.brands||[]);
    } catch {}
    finally { setLoading(false); }
  }, [lang]);

  useEffect(() => {
    if (skipFirstLoad.current) { skipFirstLoad.current = false; return; }
    load(filters);
  }, [filters, lang]);

  const update = (patch: Partial<Filters>) => {
    const newFilters = {...filters, ...patch, page:1};
    setFilters(newFilters);
    const p = new URLSearchParams();
    Object.entries(newFilters).forEach(([k,v]) => {
      if(v !== undefined && v !== '' && v !== false && k !== 'page') p.set(k, String(v));
    });
    router.push('/products' + (p.toString() ? '?' + p.toString() : ''), { scroll: false });
  };
  const reset = () => {
    setFilters({page:1} as any);
    router.push('/products', { scroll: false });
  };

  return (
    <div className="page-container py-6">

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <FilterBar filters={filters} brands={brands} categories={cats} onChange={update} onClear={reset}/>
        <div className="flex-1 min-w-0">
          {loading ? <Loader/> : (
            <>
              {products.length===0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <div className="text-lg font-bold text-gray-800 mb-2">{t.noResults}</div>
                  <p className="text-gray-500 text-sm mb-6">სცადეთ სხვა საძიებო სიტყვა ან გამოიყენეთ OEM კოდი</p>
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                    <button onClick={reset} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm">ფილტრების გასუფთავება</button>
                    <a href="/garage" className="bg-purple-600 text-white px-5 py-2 rounded-xl font-bold text-sm">🚗 VIN ძებნა</a>
                    <a href="https://wa.me/995577575052" target="_blank" className="bg-green-500 text-white px-5 py-2 rounded-xl font-bold text-sm">💬 WhatsApp-ით დახმარება</a>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 max-w-md mx-auto text-left">
                    <p className="text-sm font-bold text-blue-800 mb-2">💡 რჩევები:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• სცადეთ OEM კოდი (მაგ: 0986494501)</li>
                      <li>• შეამოწმეთ სწორი მართლწერა</li>
                      <li>• გამოიყენეთ ქართული ან ინგლისური</li>
                      <li>• დარეკეთ: +995 577 575 052</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(p=><ProductCard key={p.id} product={p}/>)}
                </div>
              )}
              <Pagination page={pagination.page} total={pagination.total} limit={12} onPage={pg=>setFilters(f=>({...f,page:pg}))}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
