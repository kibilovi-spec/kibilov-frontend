'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart, useLang } from '@/store';

export default function BottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const { lang } = useLang();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <style>{`
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 45; background: #ffffff; border-top: 1px solid #e2e8f0; padding: 0; display: flex; align-items: stretch; height: 60px; box-shadow: 0 -4px 16px rgba(15,23,42,0.08); }
        .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; cursor: pointer; border: none; background: none; padding: 8px 4px; text-decoration: none; transition: color 0.15s; color: #94a3b8; position: relative; }
        .bottom-nav-item.active { color: #0f172a; }
        .bottom-nav-item span { font-size: 10px; font-weight: 600; letter-spacing: 0.01em; }
        .bottom-nav-center { flex: 1; display: flex; align-items: center; justify-content: center; }
        .ai-btn { width: 48px; height: 48px; border-radius: 50%; background: #0f172a; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(15,23,42,0.3); transition: transform 0.15s, box-shadow 0.15s; margin-bottom: 4px; }
        .ai-btn:active { transform: scale(0.95); }
        .cart-badge { position: absolute; top: 4px; right: calc(50% - 16px); width: 16px; height: 16px; background: #ef4444; border-radius: 50%; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; color: #fff; }
        @media (min-width: 1024px) { .bottom-nav { display: none; } }
        .page-bottom-padding { padding-bottom: 60px; }
      `}</style>

      <nav className="bottom-nav lg:hidden">
        {/* Home */}
        <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === '/' ? 2.5 : 2}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>{lang==='en'?'Home':lang==='ru'?'Главная':'მთავარი'}</span>
        </Link>

        {/* Catalogue */}
        <Link href="/categories" className={`bottom-nav-item ${isActive('/products') ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive('/products') ? 2.5 : 2}>
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          <span>{lang==='en'?'Categories':lang==='ru'?'Категории':'კატეგორიები'}</span>
        </Link>

        {/* AI — center */}
        <div className="bottom-nav-center">
          <button
            className="ai-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('kibilov-ai-open'))}
            aria-label="AI ძებნა"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        {/* Parts Finder */}
        <Link href="/parts" className={`bottom-nav-item ${isActive('/parts') ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive('/parts') ? 2.5 : 2}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span>{lang==='en'?'Parts':lang==='ru'?'Подбор':'ნაწილები'}</span>
        </Link>

        {/* Cart */}
        <button
          className="bottom-nav-item"
          onClick={() => window.dispatchEvent(new CustomEvent('kibilov-open-cart'))}
        >
          {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span>{lang==='en'?'Cart':lang==='ru'?'Корзина':'კალათა'}</span>
        </button>
      </nav>
    </>
  );
}
