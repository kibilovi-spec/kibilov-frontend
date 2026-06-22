'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store';

export default function MobileNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const tabs = [
    { href: '/', icon: '🏠', label: 'მთავარი' },
    { href: '/categories', icon: '📦', label: 'კატეგორიები' },
    { href: '/products', icon: '🔍', label: 'ძებნა' },
    { href: '/garage', icon: '🚗', label: 'გარაჟი' },
    { href: '/cart', icon: '🛒', label: 'კალათა', badge: cartCount },
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#fff', borderTop: '1px solid #e2e8f0',
      display: 'flex', height: '60px',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }} className="md:hidden">
      {tabs.map(tab => (
        <Link key={tab.href} href={tab.href} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2px',
          textDecoration: 'none', position: 'relative',
          color: isActive(tab.href) ? '#2563eb' : '#94a3b8',
          fontSize: '10px', fontWeight: isActive(tab.href) ? 700 : 500,
        }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.badge ? (
            <span style={{
              position: 'absolute', top: '6px', right: '20%',
              background: '#ef4444', color: '#fff',
              fontSize: '9px', fontWeight: 800,
              width: '16px', height: '16px',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>{tab.badge > 9 ? '9+' : tab.badge}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
