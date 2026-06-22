'use client';
import { useEffect, useRef } from 'react';

export default function MapInner() {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref.current || initialized.current) return;
    initialized.current = true;
    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css');
      const map = L.default.map(ref.current!).setView([41.5717275, 44.9739267], 16);
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);
      L.default.marker([41.5717275, 44.9739267]).addTo(map).bindPopup('Kibilov Auto Service').openPopup();
      return () => map.remove();
    });
  }, []);

  return <div ref={ref} style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', marginTop: '16px' }}/>;
}
