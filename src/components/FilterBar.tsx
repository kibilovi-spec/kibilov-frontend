'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface AutodocCat {
  id: number; parentId: number | null; nameKa: string; nameEn: string;
  slug: string; level: number; imageUrl: string | null; children: AutodocCat[];
}
interface FilterBarProps {
  filters: { brand?: string; minPrice?: string; maxPrice?: string; inStock?: boolean; vehicleContext?: string; category?: string; };
  brands: string[];
  categories?: { id: string; nameKa: string }[];
  onChange: (key: string, value: any) => void;
  onClear: () => void;
}
function CatNode({ node, selected, onSelect, depth = 0 }: { node: AutodocCat; selected: string; onSelect: (s: string) => void; depth?: number; }) {
  const [open, setOpen] = useState(false);
  const has = node.children.length > 0;
  const sel = selected === node.slug;
  return (
    <div>
      <div className={`flex items-center gap-1.5 py-1.5 rounded-lg cursor-pointer transition-colors ${sel ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        style={{ paddingLeft: depth * 12 + 8, paddingRight: 8 }}
        onClick={() => { onSelect(sel ? '' : node.slug); if (has) setOpen(o => !o); }}>
        <span className="w-3 h-3 flex-shrink-0">{has ? (open ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>) : null}</span>
        {depth === 0 && node.imageUrl && <img src={node.imageUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0"/>}
        <span className="truncate text-xs font-medium">{node.nameKa}</span>
      </div>
      {has && open && <div>{node.children.map(c => <CatNode key={c.id} node={c} selected={selected} onSelect={onSelect} depth={depth+1}/>)}</div>}
    </div>
  );
}
export default function FilterBar({ filters, brands, onChange, onClear }: FilterBarProps) {
  const [priceOpen, setPriceOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [tree, setTree] = useState<AutodocCat[]>([]);
  useEffect(() => {
    api.get('/api/categories').then(r => {
      if (r.data.success) {
        const cats = (r.data.data||[]).map((c:any)=>({
          ...c,
          children: (c.subcategories||c.children||[]).map((s:any)=>({...s, children:[]}))
        }));
        setTree(cats);
      }
    }).catch(() => {});
  }, []);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4 w-full lg:w-64 flex-shrink-0 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">ფილტრი</h3>
        <button onClick={onClear} className="text-xs text-blue-600 hover:underline">გასუფთავება</button>
      </div>
      {filters.vehicleContext && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs font-bold text-blue-800">🚗 {filters.vehicleContext}</p>
          <p className="text-xs text-blue-600">მხოლოდ თავსებადი ნაწილები</p>
        </div>
      )}
      <div>
        <button onClick={() => setCatOpen(o => !o)} className="text-xs font-bold text-gray-500 mb-2 flex items-center justify-between w-full">
          <span>კატეგორია</span>
          {catOpen ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
        </button>
        {catOpen && (
          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1">
            <div className={`text-xs py-1.5 px-2 rounded-lg cursor-pointer font-semibold transition-colors ${!filters.category ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => onChange('category', '')}>ყველა კატეგ.</div>
            {tree.map(node => <CatNode key={node.id} node={node} selected={filters.category || ''} onSelect={s => onChange('category', s)} depth={0}/>)}
          </div>
        )}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={`w-10 h-5 rounded-full transition-colors ${filters.inStock ? 'bg-green-500' : 'bg-gray-200'}`} onClick={() => onChange('inStock', !filters.inStock)}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-5' : ''}`}/>
        </div>
        <span className="text-sm font-medium text-gray-700">მარაგშია</span>
      </label>
      <div>
        <label className="text-xs font-bold text-gray-500 mb-2 block">ბრენდი</label>
        <select value={filters.brand || ''} onChange={e => onChange('brand', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50">
          <option value="">ყველა ბრენდი</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <button onClick={() => setPriceOpen(!priceOpen)} className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1 w-full">
          ფასი {priceOpen ? '▲' : '▼'}
        </button>
        {priceOpen && (
          <div className="flex gap-2">
            <input type="number" placeholder="მინ" value={filters.minPrice || ''} onChange={e => onChange('minPrice', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <input type="number" placeholder="მაქს" value={filters.maxPrice || ''} onChange={e => onChange('maxPrice', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        )}
      </div>
    </div>
  );
}
