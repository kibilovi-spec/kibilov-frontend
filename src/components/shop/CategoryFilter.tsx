'use client';
import { useLang } from '@/store';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useState } from 'react';


export function CategoryFilter({ categories, filters, onChange }: {
  categories: any[];
  filters: any;
  onChange: (f: any) => void;
}) {
  const [openCats, setOpenCats] = useState<Record<string,boolean>>({});

  return (
    <div className="space-y-1">
      <div className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center mb-1">
        კატეგორიები
      </div>
      {categories.map((c:any) => {
        const kids = c.subcategories || [];
        const isOpen = !!openCats[c.id];
        const isActive = filters.category === c.id;
        return (
          <div key={c.id}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChange({category: c.id})}
                className={`flex-1 text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${isActive?'bg-primary text-white font-medium':'text-text2 hover:bg-gray-bg'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive?'bg-white/20':'bg-[#1a2f6e]'}`}>
                  <CategoryIcon slug={c.slug} className="w-5 h-5" color="text-white"/>
                </span>
                <span className="flex-1 leading-tight">{c.name||c.nameKa}</span>
              </button>
              {kids.length > 0 && (
                <button
                  onClick={() => setOpenCats(p => ({...p, [c.id]: !p[c.id]}))}
                  className={`w-6 h-6 flex items-center justify-center rounded border text-xs font-bold transition-colors ${isActive?'border-primary bg-primary text-white':'border-primary text-primary hover:bg-primary hover:text-white'}`}>
                  {isOpen ? '-' : '+'}
                </button>
              )}
            </div>
            {kids.length > 0 && isOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {kids.map((kid:any) => (
                  <button key={kid.id} onClick={() => onChange({category: kid.id})}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${filters.category===kid.id?'bg-primary text-white font-medium':'text-text2 hover:bg-gray-bg'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${filters.category===kid.id?'bg-white':'bg-primary'}`}></span>
                    <span className="leading-tight">{kid.name||kid.nameKa}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
