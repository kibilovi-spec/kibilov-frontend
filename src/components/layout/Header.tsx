'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useCart, useLang } from '@/store';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';

export const AUTH_EVENT = 'kibilov:openAuth';
export const openAuth = () => window.dispatchEvent(new CustomEvent(AUTH_EVENT));

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
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<NodeJS.Timeout>();

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handler = () => setAuthOpen(true);
    window.addEventListener(AUTH_EVENT, handler);
    return () => window.removeEventListener(AUTH_EVENT, handler);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
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
      {/* Top Bar */}
      <div className="bg-primary-dark text-white text-xs py-2 hidden md:block">
        <div className="page-container flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/70">
            <span>📞 +995 555 000 000</span>
            <span>📍 რუსთავი, საქართველო</span>
            <span>🕐 ორ–შაბ: 09:00–18:00</span>
          </div>
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
            {(['ka','en','ru'] as const).map(l => (
              <button key={l} onClick={()=>setLang(l)} title={getLangFull(l)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${lang===l?'bg-white text-primary-dark shadow-sm':'text-white/60 hover:text-white'}`}>
                <span>{LANG_FLAGS[l]}</span>
                <span>{getLangName(l)}</span>
              </button>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-2 sticky top-0 z-40 shadow-sm">
        <div className="page-container py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">K</div>
            <div className="hidden sm:block">
              <div className="font-black text-dark text-sm leading-tight">KIBILOV</div>
              <div className="text-[10px] text-text3 font-medium leading-tight tracking-wider">AUTOPARTS</div>
            </div>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {[
              { href:'/products', label: lang==='en'?'Products':lang==='ru'?'Товары':'კატალოგი' },
              { href:'/products?badge=SALE', label: lang==='en'?'Sale':lang==='ru'?'Акции':'აქციები' },
              { href:'/products?inStock=true', label: lang==='en'?'In Stock':lang==='ru'?'В наличии':'მარაგშია' },
            ].map(n => (
              <Link key={n.href} href={n.href}
                className="px-3 py-2 text-sm font-medium text-text2 hover:text-primary hover:bg-primary-light rounded-lg transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div ref={searchRef} className="flex-1 relative">
            <form onSubmit={submitSearch}>
              <input
                className="w-full border border-gray-2 rounded-xl px-4 py-2.5 pr-10 text-sm text-dark
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
                           placeholder:text-text3"
                placeholder={lang==='en'?'Search parts...':lang==='ru'?'Поиск запчастей...':'ძიება...'}
                value={search}
                onChange={e=>handleSearch(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-primary">
                🔍
              </button>
            </form>

            {/* Search Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-2 rounded-xl shadow-lg z-50 overflow-hidden">
                {searchResults.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`}
                    onClick={()=>setShowSearch(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-bg transition-colors border-b border-gray-1 last:border-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} className="w-9 h-9 object-cover rounded-lg" alt="" />
                    ) : (
                      <div className="w-9 h-9 bg-gray-1 rounded-lg flex items-center justify-center text-xs">🔧</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-dark truncate">{p.nameKa}</div>
                      <div className="text-xs text-text3">{p.brand} · SKU: {p.sku}</div>
                    </div>
                    <div className="font-semibold text-primary shrink-0">{p.price} ₾</div>
                  </Link>
                ))}
                <Link href={`/products?q=${encodeURIComponent(search)}`}
                  onClick={()=>setShowSearch(false)}
                  className="block text-center text-sm text-primary py-2 hover:bg-gray-bg">
                  {lang==='en'?'See all results':lang==='ru'?'Все результаты':'ყველა შედეგი →'}
                </Link>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <button onClick={()=>setCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors">
              🛒
              <span className="hidden sm:inline">
                {lang==='en'?'Cart':lang==='ru'?'Корзина':'კალათა'}
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent rounded-full text-[11px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button onClick={()=>setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2.5 border border-gray-2 rounded-xl hover:border-primary text-sm font-medium text-dark transition-colors">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.name}</span>
                  <span className="text-text3">▾</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-2 rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
                    <Link href="/orders" onClick={()=>setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-bg">
                      📦 {lang==='en'?'My Orders':lang==='ru'?'Мои заказы':'შეკვეთები'}
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={()=>setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-bg text-purple-600 font-medium">
                        👑 Admin Panel
                      </Link>
                    )}
                    <hr className="border-gray-1" />
                    <button onClick={()=>{logout();setUserMenuOpen(false);}}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50">
                      🚪 {lang==='en'?'Logout':lang==='ru'?'Выйти':'გამოსვლა'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={openAuth}
                className="px-3 py-2.5 border border-gray-2 rounded-xl text-sm font-medium text-dark hover:border-primary hover:text-primary transition-colors">
                {lang==='en'?'Login':lang==='ru'?'Войти':'შესვლა'}
              </button>
            )}

            {/* Mobile Menu */}
            <button onClick={()=>setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-gray-2 text-text2 hover:border-primary">
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-1 bg-white px-4 py-3 space-y-1">
            {[
              { href:'/', label:lang==='en'?'Home':lang==='ru'?'Главная':'მთავარი' },
              { href:'/products', label:lang==='en'?'Products':lang==='ru'?'Товары':'კატალოგი' },
              { href:'/products?badge=SALE', label:lang==='en'?'Sale':lang==='ru'?'Акции':'აქციები' },
              { href:'/orders', label:lang==='en'?'My Orders':lang==='ru'?'Заказы':'შეკვეთები' },
            ].map(n=>(
              <Link key={n.href} href={n.href} onClick={()=>setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-dark hover:bg-gray-bg">
                {n.label}
              </Link>
            ))}
            {/* Mobile lang switcher */}
            <div className="flex gap-2 pt-2 border-t border-gray-1">
              {(['ka','en','ru'] as const).map(l=>(
                <button key={l} onClick={()=>{setLang(l);setMobileOpen(false);}}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors
                    ${lang===l?'border-primary bg-primary/5 text-primary':'border-gray-2 text-text3'}`}>
                  {LANG_FLAGS[l]} {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="pt-1 pb-1 text-xs text-text3 text-center">📞 +995 555 000 000</div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {authOpen && (
        <AuthModal onClose={()=>setAuthOpen(false)} lang={lang} />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer onClose={()=>setCartOpen(false)} lang={lang} />
      )}
    </>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, lang }: { onClose: ()=>void; lang: string }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const L = {
    title: mode==='login'
      ? (lang==='en'?'Sign In':lang==='ru'?'Войти':'შესვლა')
      : (lang==='en'?'Register':lang==='ru'?'Регистрация':'რეგისტრაცია'),
    submit: mode==='login'
      ? (lang==='en'?'Sign In':lang==='ru'?'Войти':'შესვლა')
      : (lang==='en'?'Register':lang==='ru'?'Зарегистрироваться':'რეგისტრაცია'),
    switch: mode==='login'
      ? (lang==='en'?"Don't have account? Register":lang==='ru'?'Нет аккаунта? Зарегистрироваться':'ანგარიში არ გაქვს? დარეგისტრირდი')
      : (lang==='en'?'Already have account? Sign In':lang==='ru'?'Уже есть аккаунт? Войти':'უკვე გაქვს ანგარიში? შედი'),
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
                <input className="input-field" placeholder={lang==='en'?'Full Name':lang==='ru'?'Полное имя':'სახელი გვარი'}
                  value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required />
                <input className="input-field" placeholder={lang==='en'?'Phone':lang==='ru'?'Телефон':'ტელეფონი'} type="tel"
                  value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
              </>
            )}
            <input className="input-field" placeholder="Email" type="email" autoComplete="email"
              value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required />
            <input className="input-field" placeholder={lang==='en'?'Password':lang==='ru'?'Пароль':'პაროლი'} type="password"
              value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required minLength={6} />

            {err && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{err}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '⏳...' : L.submit}
            </button>
          </form>

          <button onClick={()=>{setMode(mode==='login'?'register':'login');setErr('');}}
            className="mt-4 text-sm text-primary hover:underline w-full text-center">
            {L.switch}
          </button>
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
        {/* Header */}
        <div className="p-5 border-b border-gray-1 flex items-center justify-between">
          <h2 className="font-bold text-dark text-lg">
            🛒 {lang==='en'?'Cart':lang==='ru'?'Корзина':'კალათა'} ({items.length})
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1 text-text3">✕</button>
        </div>

        {/* Free shipping bar */}
        {subtotal < FREE && subtotal > 0 && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
            <div className="text-xs text-blue-700 mb-1.5">
              {lang==='en'?`Add ${(FREE-subtotal).toFixed(2)} ₾ more for free delivery`:
               lang==='ru'?`Добавьте ещё ${(FREE-subtotal).toFixed(2)} ₾ для бесплатной доставки`:
               `კიდევ ${(FREE-subtotal).toFixed(2)} ₾-ის დამატებით მიტანა უფასო!`}
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-500 rounded-full transition-all" style={{width:`${Math.min(100,subtotal/FREE*100)}%`}}/>
            </div>
          </div>
        )}
        {subtotal >= FREE && subtotal > 0 && (
          <div className="px-5 py-2 bg-green-50 border-b border-green-100 text-xs text-green-700 font-medium">
            🎉 {lang==='en'?'Free delivery!':lang==='ru'?'Бесплатная доставка!':'მიტანა უფასოა!'}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-text3">{lang==='en'?'Cart is empty':lang==='ru'?'Корзина пуста':'კალათა ცარიელია'}</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-bg rounded-xl p-3">
              {item.product?.images?.[0] ? (
                <img src={item.product.images[0]} className="w-14 h-14 object-cover rounded-lg shrink-0" alt="" />
              ) : (
                <div className="w-14 h-14 bg-gray-1 rounded-lg flex items-center justify-center text-2xl shrink-0">🔧</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-dark truncate">{item.product?.nameKa}</div>
                <div className="text-xs text-text3">{item.price} ₾</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={()=>updateItem(item.productId, item.quantity-1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-2 flex items-center justify-center hover:border-primary text-sm font-bold">
                  –
                </button>
                <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                <button onClick={()=>updateItem(item.productId, item.quantity+1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-2 flex items-center justify-center hover:border-primary text-sm font-bold">
                  +
                </button>
                <button onClick={()=>removeItem(item.productId)} className="text-red-400 hover:text-red-600 ml-1 text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-1 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>{lang==='en'?'Total':lang==='ru'?'Итого':'სულ'}</span>
              <span className="text-primary">{subtotal.toFixed(2)} ₾</span>
            </div>
            <button onClick={() => {
              if (!user) { openAuth(); return; }
              setCheckoutOpen(true);
            }} className="btn-primary w-full text-base py-3">
              {lang==='en'?'Checkout':lang==='ru'?'Оформить':user?'შეკვეთა':'შესვლა & შეკვეთა'} →
            </button>
            <button onClick={clearCart} className="text-sm text-text3 hover:text-red-500 w-full text-center transition-colors">
              {lang==='en'?'Clear cart':lang==='ru'?'Очистить':'კალათის გასუფთავება'}
            </button>
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
  const [step, setStep] = useState<'address'|'payment'>('address');
  const [zones, setZones] = useState<any[]>([]);
  const [form, setForm] = useState({ city:'', street:'', apartment:'', zone:'RUSTAVI', paymentMethod:'CASH' });
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((s,i) => s+i.price*i.quantity, 0);

  useEffect(() => {
    api.get('/api/delivery/zones').then(r => {
      const z = Array.isArray(r.data) ? r.data : Object.values(r.data);
      setZones(z);
    });
  }, []);

  useEffect(() => {
    if (!form.zone) return;
    api.post('/api/delivery/calculate', { zone: form.zone, subtotal }).then(r => {
      setDeliveryFee(r.data.fee ?? 0);
    });
  }, [form.zone, subtotal]);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const r = await api.post('/api/orders', {
        address: { city:form.city, street:form.street, apartment:form.apartment, zone:form.zone },
        deliveryZone: form.zone,
        paymentMethod: form.paymentMethod,
      });
      const order = r.data.order || r.data;
      if (form.paymentMethod !== 'CASH') {
        const payR = await api.post(`/api/payment/${form.paymentMethod.toLowerCase()}/init`, { orderId: order.id });
        if (payR.data.redirectUrl) { window.location.href = payR.data.redirectUrl; return; }
      }
      clearCart();
      router.push('/orders');
      onClose();
    } catch(e:any) {
      alert(e.response?.data?.error || 'შეცდომა');
    } finally { setLoading(false); }
  };

  const ZONE_NAMES: Record<string,string> = { RUSTAVI:'რუსთავი', TBILISI:'თბილისი', MTSKHETA:'მცხეთა', OTHER:'სხვა' };
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose}/>
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl">
        <div className="p-5 border-b border-gray-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-text3 hover:text-dark">←</button>
            <h2 className="font-bold text-dark">
              {lang==='en'?'Checkout':lang==='ru'?'Оформление':'შეკვეთის გაფორმება'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1 text-text3">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Address */}
          <div>
            <h3 className="font-semibold mb-3">📍 {lang==='en'?'Delivery Address':lang==='ru'?'Адрес':'მიტანის მისამართი'}</h3>
            <div className="space-y-3">
              <select className="input-field" value={form.zone} onChange={e=>setForm(p=>({...p,zone:e.target.value}))}>
                {zones.filter(z=>z.enabled!==false).map((z:any)=>(
                  <option key={z.zone} value={z.zone}>{ZONE_NAMES[z.zone]||z.zone} — {z.fee===0?'უფასო':`${z.fee} ₾`}</option>
                ))}
                {zones.length===0 && ['RUSTAVI','TBILISI','MTSKHETA','OTHER'].map(z=>(
                  <option key={z} value={z}>{ZONE_NAMES[z]}</option>
                ))}
              </select>
              <input className="input-field" placeholder={lang==='en'?'City':lang==='ru'?'Город':'ქალაქი'}
                value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} required />
              <input className="input-field" placeholder={lang==='en'?'Street, building':lang==='ru'?'Улица, дом':'ქუჩა, სახლი'}
                value={form.street} onChange={e=>setForm(p=>({...p,street:e.target.value}))} required />
              <input className="input-field" placeholder={lang==='en'?'Apartment':lang==='ru'?'Квартира':'ბინა (არ არის სავალდებულო)'}
                value={form.apartment} onChange={e=>setForm(p=>({...p,apartment:e.target.value}))} />
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold mb-3">💳 {lang==='en'?'Payment':lang==='ru'?'Оплата':'გადახდა'}</h3>
            <div className="space-y-2">
              {[
                { value:'BOG', label:'BOG Bank', icon:'🏦', desc:lang==='en'?'Card (BOG)':lang==='ru'?'Карта BOG':'BOG ბარათი' },
                { value:'TBC', label:'TBC Bank', icon:'🏦', desc:lang==='en'?'Card (TBC)':lang==='ru'?'Карта TBC':'TBC ბარათი' },
                { value:'CASH', label:lang==='en'?'Cash':lang==='ru'?'Наличные':'ნაღდი', icon:'💵', desc:lang==='en'?'Pay on delivery':lang==='ru'?'При получении':'მიტანისას' },
              ].map(opt=>(
                <label key={opt.value} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                  ${form.paymentMethod===opt.value?'border-primary bg-primary/5':'border-gray-2 hover:border-gray-3'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={form.paymentMethod===opt.value}
                    onChange={e=>setForm(p=>({...p,paymentMethod:e.target.value}))} className="hidden" />
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-text3">{opt.desc}</div>
                  </div>
                  {form.paymentMethod===opt.value && <span className="ml-auto text-primary font-bold">✓</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-bg rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text2">პროდუქტები ({items.length})</span><span>{subtotal.toFixed(2)} ₾</span></div>
            <div className="flex justify-between"><span className="text-text2">მიტანა</span>
              <span>{deliveryFee===0?<span className="text-green-600">უფასო</span>:`${deliveryFee} ₾`}</span>
            </div>
            <div className="flex justify-between font-bold text-dark text-base border-t border-gray-2 pt-2">
              <span>სულ</span><span className="text-primary">{total.toFixed(2)} ₾</span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-1">
          <button onClick={placeOrder} disabled={loading||!form.city||!form.street}
            className="btn-primary w-full text-base py-3 disabled:opacity-50">
            {loading ? '⏳...' :
              form.paymentMethod==='CASH'
                ? (lang==='en'?'Place Order':lang==='ru'?'Оформить':'შეკვეთის გაფორმება')
                : (lang==='en'?'Pay Now':lang==='ru'?'Перейти к оплате':'გადახდაზე გადასვლა')} →
          </button>
        </div>
      </div>
    </div>
  );
}
