'use client';
export default function MapEmbed() {
  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', marginTop: '16px' }}>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=44.9689267%2C41.5667275%2C44.9789267%2C41.5767275&layer=mapnik&marker=41.5717275%2C44.9739267"
        width="100%"
        height="180"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
      />
    </div>
  );
}
