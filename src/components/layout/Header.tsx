'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useCart, useLang } from '@/store';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';
import { useVehicleStore } from '@/store/vehicle';

export const AUTH_EVENT = 'kibilov:openAuth';
export const openAuth = (mode?: 'login'|'register') => window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { mode } }));

const LANG_FLAGS: Record<string, string> = { ka: '🇬🇪', en: '🇬🇧', ru: '🇷🇺' };

export function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { lang, setLang } = useLang();
  const t = useT(lang);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { vehicle, reset: resetVehicle } = useVehicleStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handler = () => setAuthOpen(true);
    window.addEventListener(AUTH_EVENT, handler);
    const cartHandler = () => setCartOpen(true);
    window.addEventListener('kibilov-open-cart', cartHandler);
    return () => {
      window.removeEventListener(AUTH_EVENT, handler);
      window.removeEventListener('kibilov-open-cart', cartHandler);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    clearTimeout(searchTimer.current);
    if (q.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await api.get(`/api/products?q=${encodeURIComponent(q)}&limit=6`);
        setSearchResults(r.data.products || []);
        setShowSearch(true);
      } catch {}
    }, 300);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/products?q=${encodeURIComponent(search.trim())}`); setShowSearch(false); }
  };

  const getLangName = (l: string) => l==='ka'?'ქარ':l==='en'?'ENG':'РУС';
  const getLangFull = (l: string) => l==='ka'?'ქართული':l==='en'?'English':'Русский';

  return (
    <>
      <style>{`
        .header-search-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .nav-link { transition: color 0.15s, background 0.15s; }
        .nav-link:hover { color: #2563eb; background: #eff6ff; }
        .user-menu-item:hover { background: #f8fafc; }
        @media (max-width: 1023px) { .desktop-nav { display: none; } }
      `}</style>

      {/* Top Bar — desktop only */}
      <div style={{ background: '#0f172a', color: '#94a3b8', fontSize: '12px', padding: '6px 0' }} className="hidden md:block">
        <div className="page-container flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span>+995 577 575 052</span>
            <span>რუსთავი, საქართველო</span>
            <span>ორ–შაბ: 09:00–18:00</span>
          </div>
          <div className="flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2px' }}>
            {(['ka','en','ru'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} title={getLangFull(l)}
                style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                  background: lang===l ? '#ffffff' : 'transparent',
                  color: lang===l ? '#0f172a' : '#64748b',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s'
                }}>
                {LANG_FLAGS[l]} {getLangName(l)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Banner */}
      {vehicle?.make && (
        <div style={{ background: '#1e3a5f', color: '#fff', fontSize: '12px', padding: '5px 0' }}>
          <div className="page-container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ opacity: 0.7 }}>🚗 ჩემი მანქანა:</span>
              <span style={{ fontWeight: 700, color: '#60a5fa' }}>
                {vehicle.make} {vehicle.model} {vehicle.year}
              </span>
              <span style={{ opacity: 0.5, fontSize: '11px' }}>· კატალოგი ფილტრავს ამ მანქანისთვის</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="/garage" style={{ color: '#93c5fd', fontSize: '11px', textDecoration: 'none', fontWeight: 600 }}>
                შეცვლა →
              </a>
              <button onClick={() => resetVehicle()}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>

        {/* Row 1: Logo + Actions */}
        <div className="page-container" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ width: '36px', height: '36px', background: '#0f172a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '18px' }}>K</div>
            <div className="hidden sm:block">
              <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>KIBILOV</div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, letterSpacing: '0.08em' }}>AUTOPARTS</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav hidden lg:flex items-center gap-1 ml-2">
            {[
              { href:'/categories', label: lang==='en'?'Categories':lang==='ru'?'Категории':'კატეგორიები' },
              { href:'/parts', label: lang==='en'?'Parts Finder':lang==='ru'?'Подбор':'ნაწილების ძებნა' },
              { href:'/products?badge=SALE', label: lang==='en'?'Sale':lang==='ru'?'Акции':'აქციები' },
              { href:'/products?inStock=true', label: lang==='en'?'In Stock':lang==='ru'?'В наличии':'მარაგშია' },
            { href:'/garage', label: lang==='en'?'My Garage':lang==='ru'?'Мой гараж':'🚗 გარაჟი' },
            ].map(n => (
              <Link key={n.href} href={n.href} className="nav-link"
                style={{ padding: '7px 12px', fontSize: '13px', fontWeight: 500, color: '#475569', borderRadius: '8px', textDecoration: 'none' }}>
                {n.label}
              </Link>
            ))}
          </nav>



          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }} className="lg:ml-0">
            {/* Cart */}
            <button onClick={() => setCartOpen(true)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#0f172a', color: '#f8fafc', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="hidden sm:inline">{lang==='en'?'Cart':lang==='ru'?'Корзина':'კალათა'}</span>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', background: '#ef4444', borderRadius: '50%', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                  <div style={{ width: '24px', height: '24px', background: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline" style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', zIndex: 50, minWidth: '160px', overflow: 'hidden' }}>
                    {[
                      { href:'/orders', icon:'📦', label: lang==='en'?'My Orders':lang==='ru'?'Заказы':'შეკვეთები' },
                      { href:'/my-car', icon:'🚗', label: lang==='en'?'My Car':lang==='ru'?'Авто':'ჩემი მანქანა' },
                      { href:'/profile', icon:'👤', label: lang==='en'?'Profile':lang==='ru'?'Профиль':'პროფილი' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)} className="user-menu-item"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', color: '#1e293b', textDecoration: 'none' }}>
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="user-menu-item"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
                        <span>👑</span>Admin Panel
                      </Link>
                    )}
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '2px 0' }} />
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className="user-menu-item"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <span>🚪</span>{lang==='en'?'Logout':lang==='ru'?'Выйти':'გამოსვლა'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => openAuth('login')}
                style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#1e293b', cursor: 'pointer' }}>
                {lang==='en'?'Login':lang==='ru'?'Войти':'შესვლა'}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden"
              style={{ padding: '8px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              {mobileOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Row 2: Mobile Search */}
        <div className="lg:hidden" style={{ padding: '0 16px 10px', borderTop: '1px solid #f1f5f9' }}>
          <div ref={searchRef} style={{ position: 'relative' }}>
            <form onSubmit={submitSearch}>
              <input
                className="header-search-input"
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '10px 40px 10px 14px', fontSize: '14px', color: '#1e293b', background: '#f8fafc', boxSizing: 'border-box' }}
                placeholder={lang==='en'?'Search parts...':lang==='ru'?'Поиск...':'ძებნა: ნაწილი, მარკა, OEM...'}
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />
              <button type="submit" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form>
            {showSearch && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', zIndex: 50, overflow: 'hidden' }}>
                {searchResults.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`} onClick={() => setShowSearch(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: '1px solid #f1f5f9', textDecoration: 'none' }}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} alt="" />
                      : <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '6px', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginBottom: '1px' }}>{p.brand}</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nameKa}</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                        {(p.oemCodes||[]).filter((c:string)=>c.length>=4&&c.length<=15&&!c.startsWith('SKU')&&!c.includes(':')).slice(0,2).map((c:string)=>(
                          <span key={c} style={{ fontSize: '10px', fontFamily: 'monospace', background: '#eff6ff', color: '#2563eb', padding: '0 4px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '14px', flexShrink: 0 }}>{p.price}₾</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid #f1f5f9', background: '#fff', padding: '8px 12px 12px' }} className="lg:hidden">
            {[
              { href:'/', label: lang==='en'?'Home':lang==='ru'?'Главная':'მთავარი' },
              { href:'/categories', label: lang==='en'?'Categories':lang==='ru'?'Категории':'კატეგორიები' },
              { href:'/parts', label: lang==='en'?'Parts Finder':lang==='ru'?'Подбор':'ნაწილების ძებნა' },
              { href:'/products?badge=SALE', label: lang==='en'?'Sale':lang==='ru'?'Акции':'აქციები' },
              { href:'/orders', label: lang==='en'?'My Orders':lang==='ru'?'Заказы':'შეკვეთები' },
              { href:'/my-car', label: lang==='en'?'My Car':lang==='ru'?'Авто':'ჩემი მანქანა' },
            ].map(n => (
              <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#1e293b', textDecoration: 'none' }}
                onMouseOver={e => (e.currentTarget.style.background='#f8fafc')}
                onMouseOut={e => (e.currentTarget.style.background='')}>
                {n.label}
              </Link>
            ))}
            <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
              {(['ka','en','ru'] as const).map(l => (
                <button key={l} onClick={() => { setLang(l); setMobileOpen(false); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: lang===l ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0', background: lang===l ? '#eff6ff' : '#fff', color: lang===l ? '#2563eb' : '#64748b', cursor: 'pointer' }}>
                  {LANG_FLAGS[l]} {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} lang={lang} />}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} lang={lang} />}
    </>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, lang }: { onClose: ()=>void; lang: string }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login'|'register'|'choose'>('login');
  useEffect(() => {
    const h = (e: any) => { if (e?.detail?.mode) setMode(e.detail.mode); else setMode('login'); };
    window.addEventListener(AUTH_EVENT, h);
    return () => window.removeEventListener(AUTH_EVENT, h);
  }, []);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const L = {
    title: mode==='login' ? (lang==='en'?'Sign In':lang==='ru'?'Войти':'შესვლა') : (lang==='en'?'Register':lang==='ru'?'Регистрация':'რეგისტრაცია'),
    submit: mode==='login' ? (lang==='en'?'Sign In':lang==='ru'?'Войти':'შესვლა') : (lang==='en'?'Register':lang==='ru'?'Зарегистрироваться':'რეგისტრაცია'),
    switch: mode==='login' ? (lang==='en'?"Don't have account? Register":lang==='ru'?'Нет аккаунта? Зарегистрироваться':'ანგარიში არ გაქვს? დარეგისტრირდი') : (lang==='en'?'Already have account? Sign In':lang==='ru'?'Уже есть аккаунт? Войти':'უკვე გაქვს ანგარიში? შედი'),
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (mode==='login') await login(form.email, form.password);
      else await register(form.name, form.email, form.phone, form.password);
      onClose();
    } catch(e: any) {
      setErr(e.response?.data?.error || (lang==='en'?'Error':lang==='ru'?'Ошибка':'შეცდომა'));
    } finally { setLoading(false); }
  };

  if (mode==='choose') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-dark">{lang==='en'?'Account type':lang==='ru'?'Тип аккаунта':'ანგარიშის ტიპი'}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1 text-text3">✕</button>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={()=>setMode('register')} className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-blue-50 hover:bg-blue-100 transition text-left w-full relative">
              <span className="absolute -top-2.5 left-4 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">{lang==='en'?'Popular':lang==='ru'?'Популярно':'პოპულარული'}</span>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xl">👤</div>
              <div className="flex-1">
                <p className="font-bold text-dark text-sm">{lang==='en'?'Buyer':lang==='ru'?'Покупатель':'მყიდველი'}</p>
                <p className="text-xs text-primary">{lang==='en'?'Personal account, orders, VIN search':lang==='ru'?'Личный аккаунт':'პირადი ანგარიში, შეკვეთები, VIN ძებნა'}</p>
              </div>
              <span className="text-primary">›</span>
            </button>
            <a href="/b2b-apply" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition text-left relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xl">🏢</div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{color:'#1e3a5f'}}>{lang==='en'?'Wholesale / B2B':lang==='ru'?'Оптовый / B2B':'საბითუმო / B2B'}</p>
                <p className="text-xs" style={{color:'#1d4ed8'}}>{lang==='en'?'Discounts, bulk orders':'ფასდაკლება, საბითუმო შეკვეთა, B2B ფასები'}</p>
              </div>
              <span style={{color:'#2563eb'}}>›</span>
            </a>
            <a href="/supplier/register" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition text-left">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">🚛</div>
              <div className="flex-1">
                <p className="font-bold text-dark text-sm">{lang==='en'?'Supplier':lang==='ru'?'Поставщик':'მომწოდებელი'}</p>
                <p className="text-xs text-text3">{lang==='en'?'Sell on Kibilov':'გაყიდე შენი პროდუქტები კიბილოვის პლატფორმაზე'}</p>
              </div>
              <span className="text-text3">›</span>
            </a>
          </div>
          <button onClick={()=>setMode('login')} className="mt-4 text-sm text-text3 hover:text-primary hover:underline w-full text-center">
            {lang==='en'?'Already have account? Sign In':lang==='ru'?'Уже есть аккаунт? Войти':'უკვე გაქვს ანგარიში? შედი'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark">{L.title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1 text-text3">✕</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode==='register' && (
              <>
                <input className="input-field" placeholder={lang==='en'?'Full Name':lang==='ru'?'Полное имя':'სახელი გვარი'} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required />
                <input className="input-field" placeholder={lang==='en'?'Phone':lang==='ru'?'Телефон':'ტელეფონი'} type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
              </>
            )}
            <input className="input-field" placeholder="Email" type="email" autoComplete="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required />
            <div className="relative">
              <input className="input-field pr-10" placeholder={lang==='en'?'Password':lang==='ru'?'Пароль':'პაროლი'} type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required minLength={6} />
              <button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-primary text-lg">{showPass?'🙈':'👁️'}</button>
            </div>
            {err && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{err}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? '...' : L.submit}</button>
          </form>
          <button onClick={()=>{setMode(mode==='login'?'choose':'login');setErr('');}} className="mt-4 text-sm text-primary hover:underline w-full text-center">{L.switch}</button>
        </div>
      </div>
    </div>
  );
}

// ── Cart Drawer ───────────────────────────────────────────────────────────────
function CartDrawer({ onClose, lang }: { onClose: ()=>void; lang: string }) {
  const { items, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const FREE = 150;

  if (checkoutOpen) return <CheckoutModal onClose={onClose} onBack={()=>setCheckoutOpen(false)} lang={lang} />;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl">
        <div className="p-5 border-b border-gray-1 flex items-center justify-between">
          <h2 className="font-bold text-dark text-lg">{lang==='en'?'Cart':lang==='ru'?'Корзина':'კალათა'} ({items.length})</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1 text-text3">✕</button>
        </div>
        {subtotal < FREE && subtotal > 0 && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
            <div className="text-xs text-blue-700 mb-1.5">{lang==='en'?`Add ${(FREE-subtotal).toFixed(2)} ₾ more for free delivery`:lang==='ru'?`Добавьте ещё ${(FREE-subtotal).toFixed(2)} ₾ для бесплатной доставки`:`კიდევ ${(FREE-subtotal).toFixed(2)} ₾-ის დამატებით მიტანა უფასო!`}</div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden"><div className="h-2 bg-blue-500 rounded-full transition-all" style={{width:`${Math.min(100,subtotal/FREE*100)}%`}}/></div>
          </div>
        )}
        {subtotal >= FREE && subtotal > 0 && (
          <div className="px-5 py-2 bg-green-50 border-b border-green-100 text-xs text-green-700 font-medium">{lang==='en'?'Free delivery!':lang==='ru'?'Бесплатная доставка!':'მიტანა უფასოა!'}</div>
        )}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16"><div className="text-5xl mb-4">🛒</div><p className="text-text3">{lang==='en'?'Cart is empty':lang==='ru'?'Корзина пуста':'კალათა ცარიელია'}</p></div>
          ) : items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-bg rounded-xl p-3">
              {item.product?.images?.[0] ? <img src={item.product.images[0]} className="w-14 h-14 object-cover rounded-lg shrink-0" alt="" /> : <div className="w-14 h-14 bg-gray-1 rounded-lg flex items-center justify-center text-2xl shrink-0">🔧</div>}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-dark truncate">{item.product?.nameKa}</div>
                <div className="text-xs text-text3">{item.price} ₾</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={()=>updateItem(item.productId, item.quantity-1)} className="w-7 h-7 rounded-lg bg-white border border-gray-2 flex items-center justify-center hover:border-primary text-sm font-bold">–</button>
                <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                <button onClick={()=>updateItem(item.productId, item.quantity+1)} className="w-7 h-7 rounded-lg bg-white border border-gray-2 flex items-center justify-center hover:border-primary text-sm font-bold">+</button>
                <button onClick={()=>removeItem(item.productId)} className="text-red-400 hover:text-red-600 ml-1 text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-1 space-y-3">
            <div className="flex justify-between text-lg font-bold"><span>{lang==='en'?'Total':lang==='ru'?'Итого':'სულ'}</span><span className="text-primary">{subtotal.toFixed(2)} ₾</span></div>
            <button onClick={() => { if (!user) { openAuth(); return; } setCheckoutOpen(true); }} className="btn-primary w-full text-base py-3">{lang==='en'?'Checkout':lang==='ru'?'Оформить':user?'შეკვეთა':'შესვლა & შეკვეთა'} →</button>
            <button onClick={clearCart} className="text-sm text-text3 hover:text-red-500 w-full text-center transition-colors">{lang==='en'?'Clear cart':lang==='ru'?'Очистить':'კალათის გასუფთავება'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({ onClose, onBack, lang }: { onClose:()=>void; onBack:()=>void; lang:string }) {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [zones, setZones] = useState<any[]>([]);
  const [form, setForm] = useState({ city:'', street:'', apartment:'', zone:'RUSTAVI', paymentMethod:'CASH' });
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((s,i) => s+i.price*i.quantity, 0);

  useEffect(() => {
    api.get('/api/delivery/zones').then(r => { const z = Array.isArray(r.data) ? r.data : Object.values(r.data); setZones(z); });
  }, []);

  useEffect(() => {
    if (!form.zone) return;
    api.post('/api/delivery/calculate', { zone: form.zone, subtotal }).then(r => { setDeliveryFee(r.data.fee ?? 0); });
  }, [form.zone, subtotal]);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const r = await api.post('/api/orders', { address: { city:form.city, street:form.street, apartment:form.apartment, zone:form.zone }, deliveryZone: form.zone, paymentMethod: form.paymentMethod });
      const order = r.data.order || r.data;
      if (form.paymentMethod !== 'CASH') {
        const payR = await api.post(`/api/payment/${form.paymentMethod.toLowerCase()}/init`, { orderId: order.id });
        if (payR.data.redirectUrl) { window.location.href = payR.data.redirectUrl; return; }
      }
      clearCart(); router.push('/orders'); onClose();
    } catch(e:any) { alert(e.response?.data?.error || 'შეცდომა'); } finally { setLoading(false); }
  };

  const ZONE_NAMES: Record<string,string> = { RUSTAVI:'რუსთავი', TBILISI:'თბილისი', MTSKHETA:'მცხეთა', OTHER:'სხვა' };
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose}/>
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl">
        <div className="p-5 border-b border-gray-1 flex items-center justify-between">
          <div className="flex items-center gap-3"><button onClick={onBack} className="text-text3 hover:text-dark">←</button><h2 className="font-bold text-dark">{lang==='en'?'Checkout':lang==='ru'?'Оформление':'შეკვეთის გაფორმება'}</h2></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1 text-text3">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h3 className="font-semibold mb-3">{lang==='en'?'Delivery Address':lang==='ru'?'Адрес':'მიტანის მისამართი'}</h3>
            <div className="space-y-3">
              <select className="input-field" value={form.zone} onChange={e=>setForm(p=>({...p,zone:e.target.value}))}>
                {zones.filter(z=>z.enabled!==false).map((z:any)=>(<option key={z.zone} value={z.zone}>{ZONE_NAMES[z.zone]||z.zone} — {z.fee===0?'უფასო':`${z.fee} ₾`}</option>))}
                {zones.length===0 && ['RUSTAVI','TBILISI','MTSKHETA','OTHER'].map(z=>(<option key={z} value={z}>{ZONE_NAMES[z]}</option>))}
              </select>
              <input className="input-field" placeholder={lang==='en'?'City':lang==='ru'?'Город':'ქალაქი'} value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} required />
              <input className="input-field" placeholder={lang==='en'?'Street, building':lang==='ru'?'Улица, дом':'ქუჩა, სახლი'} value={form.street} onChange={e=>setForm(p=>({...p,street:e.target.value}))} required />
              <input className="input-field" placeholder={lang==='en'?'Apartment (optional)':lang==='ru'?'Квартира':'ბინა (არ არის სავალდებულო)'} value={form.apartment} onChange={e=>setForm(p=>({...p,apartment:e.target.value}))} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">{lang==='en'?'Payment':lang==='ru'?'Оплата':'გადახდა'}</h3>
            <div className="space-y-2">
              {[
                { value:'BOG', label:'BOG Bank', desc:lang==='en'?'Card (BOG)':lang==='ru'?'Карта BOG':'BOG ბარათი' },
                { value:'TBC', label:'TBC Bank', desc:lang==='en'?'Card (TBC)':lang==='ru'?'Карта TBC':'TBC ბარათი' },
                { value:'CASH', label:lang==='en'?'Cash':lang==='ru'?'Наличные':'ნაღდი', desc:lang==='en'?'Pay on delivery':lang==='ru'?'При получении':'მიტანისას' },
              ].map(opt=>(
                <label key={opt.value} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${form.paymentMethod===opt.value?'border-primary bg-primary/5':'border-gray-2 hover:border-gray-3'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={form.paymentMethod===opt.value} onChange={e=>setForm(p=>({...p,paymentMethod:e.target.value}))} className="hidden" />
                  <div><div className="font-semibold text-sm">{opt.label}</div><div className="text-xs text-text3">{opt.desc}</div></div>
                  {form.paymentMethod===opt.value && <span className="ml-auto text-primary font-bold">✓</span>}
                </label>
              ))}
            </div>
          </div>
          <div className="bg-gray-bg rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text2">პროდუქტები ({items.length})</span><span>{subtotal.toFixed(2)} ₾</span></div>
            <div className="flex justify-between"><span className="text-text2">მიტანა</span><span>{deliveryFee===0?<span className="text-green-600">უფასო</span>:`${deliveryFee} ₾`}</span></div>
            <div className="flex justify-between font-bold text-dark text-base border-t border-gray-2 pt-2"><span>სულ</span><span className="text-primary">{total.toFixed(2)} ₾</span></div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-1">
          <button onClick={placeOrder} disabled={loading||!form.city||!form.street} className="btn-primary w-full text-base py-3 disabled:opacity-50">
            {loading ? '...' : form.paymentMethod==='CASH' ? (lang==='en'?'Place Order':lang==='ru'?'Оформить':'შეკვეთის გაფორმება') : (lang==='en'?'Pay Now':lang==='ru'?'Перейти к оплате':'გადახდაზე გადასვლა')} →
          </button>
        </div>
      </div>
    </div>
  );
}
