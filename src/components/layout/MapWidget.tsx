'use client';
export default function MapWidget() {
  return (
    <a href="https://maps.app.goo.gl/uqsBxQsxzz95EFze7" target="_blank" rel="noopener noreferrer"
      style={{ display: 'block', marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none' }}>
      <div style={{ background: '#1e3a5f', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ fontSize: '32px' }}>📍</span>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Kibilov Auto Service</span>
        <span style={{ color: '#93c5fd', fontSize: '11px' }}>რუსთავი, ლეონიძის ქ. • გახსნა Maps-ში →</span>
      </div>
    </a>
  );
}
