'use client';
import { useLang } from '@/store';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DiagramItem {
  articleId: number;
  articleNo: string;
  supplierName: string;
  articleProductName: string;
  senCoordX: number;
  senCoordY: number;
  senCoordWidth: number;
  senCoordHeight: number;
  senCordType: string;
  s3image: string;
}

export default function PartDiagram({ productId }: { productId: string }) {
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const [items, setItems] = useState<DiagramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const [imgSize, setImgSize] = useState({ w: 600, h: 400 });

  useEffect(() => {
    const artId = productId.startsWith('autodoc_') ? productId.replace('autodoc_', '') : productId;
    api.get(`/api/autodoc/diagram/${artId}`)
      .then(r => {
        const parts = r.data.parts || [];
        setItems(parts.map((p: any) => ({
          articleId: p.articleId,
          articleNo: p.articleNo,
          supplierName: p.brand,
          articleProductName: p.brand + ' ' + p.articleNo,
          senCoordX: p.x,
          senCoordY: p.y,
          senCoordWidth: p.w,
          senCoordHeight: p.h,
          senCordType: p.type,
          s3image: p.image,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <p className="text-sm text-gray-400">⏳ დიაგრამა იტვირთება...</p>
    </div>
  );
  if (items.length === 0) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 hidden"></div>
  );

  const diagramImg = items[0]?.s3image;
  if (!diagramImg) return (<div className="hidden"></div>);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">ნაწილების დიაგრამა</h2>
      <div className="relative inline-block" style={{maxWidth:"600px",width:"100%"}}>
        <img
          src={diagramImg}
          alt="Parts diagram"
          className="w-full rounded-xl"
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
          style={{ pointerEvents: 'none' }}
        >
          {items.map((item, i) => (
            <g key={i}>
              <circle
                cx={item.senCoordX + item.senCoordWidth / 2}
                cy={item.senCoordY + item.senCoordHeight / 2}
                r={Math.min(item.senCoordWidth, item.senCoordHeight) / 2}
                fill={hover === i ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.15)'}
                stroke={hover === i ? '#2563eb' : '#2563eb88'}
                strokeWidth="3"
                style={{ pointerEvents: 'all', cursor: 'pointer' }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <text
                x={item.senCoordX + item.senCoordWidth / 2}
                y={item.senCoordY + item.senCoordHeight / 2 + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#1e3a5f"
                style={{ pointerEvents: 'none' }}
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Parts list */}
      <div className="mt-4 space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${hover === i ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.articleProductName}</p>
              <p className="text-xs text-gray-500">{item.supplierName} · {item.articleNo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
