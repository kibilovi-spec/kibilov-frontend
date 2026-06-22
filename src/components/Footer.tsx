import Link from 'next/link';
import MapEmbed from './MapEmbed';
import React from 'react';

const headingStyle: React.CSSProperties = {
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  margin: '0 0 16px',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
};

const ulStyle: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0 };

const linkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '14px',
};

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: '#e0e0e0', padding: '48px 0 0', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>

          <div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: '0 0 6px' }}>
              🔧 Kibilov AutoParts
            </h3>
            <p style={{ color: '#e05a2b', fontSize: '13px', margin: '0 0 14px', letterSpacing: '0.5px' }}>
              ავტონაწილების ონლაინ მაღაზია
            </p>
            <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.7, margin: '0 0 20px' }}>
              ხარისხიანი ავტონაწილები საქართველოს ყველა კუთხეში. 35+ მარკა, 146+ კატეგორია, სწრაფი მიწოდება.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', textDecoration: 'none', fontSize: '15px' }}>f</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', textDecoration: 'none', fontSize: '15px' }}>in</a>
              <a href="https://wa.me/995577575052" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', textDecoration: 'none', fontSize: '15px' }}>wa</a>
            </div>
          </div>

          <div>
            <h4 style={headingStyle}>ნავიგაცია</h4>
            <ul style={ulStyle}>
              {[
                { href: '/', label: 'მთავარი' },
                { href: '/categories', label: 'კატეგორიები' },
                { href: '/brands', label: 'მარკები' },
                { href: '/about', label: 'ჩვენს შესახებ' },
                { href: '/service', label: 'სერვისი' },
              ].map((l) => (
                <li key={l.href} style={{ marginBottom: '10px' }}>
                  <Link href={l.href} style={linkStyle}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={headingStyle}>მომხმარებელს</h4>
            <ul style={ulStyle}>
              {[
                { href: '/profile', label: 'ჩემი პროფილი' },
                { href: '/orders', label: 'შეკვეთები' },
                { href: '/delivery', label: 'მიწოდება' },
                { href: '/returns', label: 'დაბრუნება' },
                { href: '/warranty', label: 'გარანტია' },
              ].map((l) => (
                <li key={l.href} style={{ marginBottom: '10px' }}>
                  <Link href={l.href} style={linkStyle}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={headingStyle}>კონტაქტი</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', fontSize: '14px', color: '#aaa' }}>
              <span>📞</span>
              <a href="tel:+995577575052" style={{ color: '#ddd', textDecoration: 'none' }}>+995 577 575 052</a>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', fontSize: '14px', color: '#aaa' }}>
              <span>🕐</span>
              <span>ორშ–კვი: 09:00–19:00</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', fontSize: '14px', color: '#aaa' }}>
              <span>✉️</span>
              <a href="mailto:info@kibilov.ge" style={{ color: '#ddd', textDecoration: 'none' }}>info@kibilov.ge</a>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', fontSize: '14px', color: '#aaa' }}>
              <span>📍</span>
              <span>რუსთავი, საქართველო</span>
            </div>
            
            <MapEmbed />
          </div>

        </div>

        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            © {new Date().getFullYear()} Kibilov AutoParts. ყველა უფლება დაცულია.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { href: '/privacy', label: 'კონფიდენციალურობა' },
              { href: '/terms', label: 'წესები' },
              { href: '/contact', label: 'კონტაქტი' },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
