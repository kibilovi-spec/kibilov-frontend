'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store';

const NAV = [
  { href:'/admin', label:'Dashboard', icon:'📊' },
  { href:'/admin/orders', label:'შეკვეთები', icon:'📦' },
  { href:'/admin/products', label:'პროდუქტები', icon:'🛍️' },
  { href:'/admin/users', label:'მომხმარებლები', icon:'👥' },
  { href:'/admin/delivery', label:'მიტანა', icon:'🚚' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/');
  }, [user, router]);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1A2130] text-white fixed inset-y-0 left-0 z-40">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-400">K</span>
            <div>
              <p className="font-bold text-sm leading-tight">Kibilov</p>
              <p className="text-xs text-gray-400">AutoParts Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                pathname === n.href ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}>
              <span>{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {(user?.name||'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name||'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email||''}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link href="/" className="block text-xs text-gray-400 hover:text-white transition px-2 py-1">← საიტი</Link>
            <button onClick={handleLogout} className="block w-full text-left text-xs text-red-400 hover:text-red-300 transition px-2 py-1">გამოსვლა</button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#1A2130] text-white flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-blue-400">Kibilov Admin</Link>
        <button onClick={()=>setMobileOpen(v=>!v)} className="p-2">
          <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={()=>setMobileOpen(false)}>
          <div className="bg-[#1A2130] w-60 h-full pt-16" onClick={e=>e.stopPropagation()}>
            <nav className="p-3 space-y-1">
              {NAV.map(n=>(
                <Link key={n.href} href={n.href} onClick={()=>setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/10 ${pathname===n.href?'bg-blue-600 text-white':''}`}>
                  {n.icon} {n.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/10">
                🚪 გამოსვლა
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
