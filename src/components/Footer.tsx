'use client';
import { useLang } from '@/store';
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
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  return (
    <footer style={{ background: '#1a1a2e', color: '#e0e0e0', padding: '48px 0 0', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>

          <div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: '0 0 6px' }}>
              🔧 Kibilov AutoParts
            </h3>
            <p style={{ color: '#e05a2b', fontSize: '13px', margin: '0 0 14px', letterSpacing: '0.5px' }}>
              {t('ავტონაწილების ონლაინ მაღაზია','Auto Parts Online Store','Интернет-магазин автозапчастей')}
            </p>
            <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.7, margin: '0 0 20px' }}>
              {t('ხარისხიანი ავტონაწილები საქართველოს ყველა კუთხეში. 35+ მარკა, 146+ კატეგორია, სწრაფი მიწოდება.','Quality auto parts across Georgia. 35+ brands, 146+ categories, fast delivery.','Качественные автозапчасти по всей Грузии. 35+ марок, 146+ категорий, быстрая доставка.')}
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
                { href: '/', label: t(t('მთავარი','Home','Главная'),'Home','Главная') },
                { href: '/categories', label: t(t('კატეგორიები','Categories','Категории'),'Categories','Категории') },
                { href: '/brands', label: t(t('მარკები','Brands','Марки'),'Brands','Марки') },
                { href: '/about', label: t(t('ჩვენს შესახებ','About Us','О нас'),'About Us','О нас') },
                { href: '/service', label: t(t('სერვისი','Service','Сервис'),'Service','Сервис') },
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
                { href: '/profile', label: t(t('ჩემი პროფილი','My Profile','Мой профиль'),'My Profile','Мой профиль') },
                { href: '/orders', label: t(t('შეკვეთები','Orders','Заказы'),'Orders','Заказы') },
                { href: '/delivery', label: t(t('მიწოდება','Delivery','Доставка'),'Delivery','Доставка') },
                { href: '/returns', label: t(t('დაბრუნება','Returns','Возврат'),'Returns','Возврат') },
                { href: '/warranty', label: t(t('გარანტია','Warranty','Гарантия'),'Warranty','Гарантия') },
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
              <span>{t('ორშ–კვი: 09:00–19:00','Mon–Sun: 09:00–19:00','Пн–Вс: 09:00–19:00')}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', fontSize: '14px', color: '#aaa' }}>
              <span>✉️</span>
              <a href={'mailto:' + 'info' + '@' + 'kibilov.ge'} style={{ color: '#ddd', textDecoration: 'none' }} suppressHydrationWarning>{'info' + '@' + 'kibilov.ge'}</a>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', fontSize: '14px', color: '#aaa' }}>
              <span>📍</span>
              <span>{t('რუსთავი, საქართველო','Rustavi, Georgia','Рустави, Грузия')}</span>
            </div>
            
            <MapEmbed />
          </div>

        </div>

        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            © {new Date().getFullYear()} Kibilov AutoParts. {t('ყველა უფლება დაცულია.','All rights reserved.','Все права защищены.')}
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { href: '/privacy', label: t(t('კონფიდენციალურობა','Privacy','Конфиденциальность'),'Privacy','Конфиденциальность') },
              { href: '/terms', label: t(t('წესები','Terms','Условия'),'Terms','Условия') },
              { href: '/contact', label: t(t('კონტაქტი','Contact','Контакт'),'Contact','Контакт') },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
