'use client';
import { useLang } from '@/store';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ProductGallery({ images, name, productId }: { images: string[], name: string, productId: string }) {
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const [allImages, setAllImages] = useState<string[]>(images);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (images.length < 2) {
      api.get(`/api/products/${productId}/media`)
        .then(r => {
          const mediaImgs = r.data.images || [];
          const merged = Array.from(new Set([...images, ...mediaImgs]));
          setAllImages(merged);
        })
        .catch(() => {});
    }
  }, [productId]);

  const src = allImages[active];

  return (
    <div>
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl p-8 min-h-72 mb-3 cursor-zoom-in relative"
        onClick={() => src && setLightbox(true)}
      >
        {src ? (
          <img src={src} alt={name} className="max-h-80 object-contain" />
        ) : (
          <div className="text-gray-300 text-6xl">🔧</div>
        )}
        {src && <span className="absolute bottom-2 right-3 text-xs text-gray-400">🔍 გადიდება</span>}
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allImages.slice(0, 6).map((img, i) => (
            <img key={i} src={img} alt={`${name} ${i+1}`}
              onClick={() => setActive(i)}
              className={`w-16 h-16 object-contain border rounded-lg p-1 cursor-pointer transition-all ${active === i ? 'border-blue-500 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
            />
          ))}
        </div>
      )}

      {lightbox && src && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{background:'rgba(0,0,0,0.85)'}}
          onClick={() => setLightbox(false)}
        >
          <img src={src} alt={name} style={{maxHeight:'90vh', maxWidth:'90vw', objectFit:'contain'}} />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold"
          >×</button>
        </div>
      )}
    </div>
  );
}
