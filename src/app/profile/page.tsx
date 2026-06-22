'use client';
import { useState, useEffect } from 'react';
import { useAuth, useLang } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [passForm, setPassForm] = useState({ newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'info'|'password'>('info');
  const [b2bStats, setB2bStats] = useState({ monthOrders: 0, totalSpent: 0, savedAmount: 0 });
  const [b2bApplying, setB2bApplying] = useState(false);

  const applyB2B = async () => {
    setB2bApplying(true);
    try {
      await api.post('/api/auth/b2b-apply');
      await fetchMe();
    } catch (e: any) {
      setErr(e.response?.data?.message || 'შეცდომა');
    }
    setB2bApplying(false);
  };

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setErr('');
    try {
      await api.put('/api/auth/me', { name: form.name, phone: form.phone });
      await fetchMe();
      setMsg(lang==='en'?'Saved!':lang==='ru'?'Сохранено!':'შენახულია!');
    } catch { setErr(lang==='en'?'Error':lang==='ru'?'Ошибка':'შეცდომა'); }
    finally { setLoading(false); }
  };

  const savePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPass !== passForm.confirm) { setErr(lang==='en'?'Passwords do not match':lang==='ru'?'Пароли не совпадают':'პაროლები არ ემთხვევა'); return; }
    if (passForm.newPass.length < 6) { setErr(lang==='en'?'Min 6 characters':lang==='ru'?'Мин. 6 символов':'მინ. 6 სიმბოლო'); return; }
    setLoading(true); setMsg(''); setErr('');
    try {
      await api.put('/api/auth/me', { password: passForm.newPass });
      setMsg(lang==='en'?'Password changed!':lang==='ru'?'Пароль изменён!':'პაროლი შეიცვალა!');
      setPassForm({ newPass: '', confirm: '' });
    } catch { setErr(lang==='en'?'Error':lang==='ru'?'Ошибка':'შეცდომა'); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  const T = {
    title: lang==='en'?'My Profile':lang==='ru'?'Мой профиль':'ჩემი პროფილი',
    info: lang==='en'?'Personal Info':lang==='ru'?'Личные данные':'პირადი ინფო',
    password: lang==='en'?'Change Password':lang==='ru'?'Изменить пароль':'პაროლის შეცვლა',
    name: lang==='en'?'Full Name':lang==='ru'?'Полное имя':'სახელი გვარი',
    phone: lang==='en'?'Phone':lang==='ru'?'Телефон':'ტელეფონი',
    save: lang==='en'?'Save':lang==='ru'?'Сохранить':'შენახვა',
    newPass: lang==='en'?'New Password':lang==='ru'?'Новый пароль':'ახალი პაროლი',
    confirmPass: lang==='en'?'Confirm Password':lang==='ru'?'Подтвердить пароль':'გაიმეორე პაროლი',
    orders: lang==='en'?'My Orders':lang==='ru'?'Мои заказы':'ჩემი შეკვეთები',
    myCar: lang==='en'?'My Cars':lang==='ru'?'Мои авто':'ჩემი მანქანები',
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dark">{user.name}</h1>
          <p className="text-text3 text-sm">{user.email}</p>
          {user.role === 'ADMIN' && <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">Admin</span>}
        </div>
      </div>


      {/* B2B Dashboard */}
      {(user.b2bStatus === 'APPROVED' || user.b2bTier) && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold">🏢 B2B კლიენტი</span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-medium">
                  {user.b2bTier || 'STANDARD'}
                </span>
              </div>
              {(user.b2bDiscount ?? 0) > 0 && (
                <p className="text-blue-100 text-sm">-{user.b2bDiscount}% ფასდაკლება ყველა პროდუქტზე</p>
              )}
            </div>
            <span className="text-4xl">💼</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{b2bStats.monthOrders}</p>
              <p className="text-xs text-blue-100">ამ თვე</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{b2bStats.totalSpent}₾</p>
              <p className="text-xs text-blue-100">სულ დახარჯული</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{b2bStats.savedAmount}₾</p>
              <p className="text-xs text-blue-100">დაზოგილი</p>
            </div>
          </div>
        </div>
      )}

      {/* B2B განაცხადი */}
      {!user.b2bStatus && user.role !== 'ADMIN' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏢</span>
            <div>
              <p className="font-bold text-dark">B2B კლიენტი გახდი</p>
              <p className="text-sm text-gray-400">სერვისცენტრებისთვის — განსაკუთრებული ფასები</p>
            </div>
          </div>
          <button onClick={applyB2B} disabled={b2bApplying}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
            {b2bApplying ? '⏳...' : '📋 B2B-ზე განაცხადი'}
          </button>
        </div>
      )}

      {user.b2bStatus === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800">⏳ B2B განაცხადი განიხილება — 24 საათში გეტყობინებათ</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/orders" className="card p-4 flex items-center gap-3 hover:border-primary transition-colors">
          <span className="text-2xl">📦</span>
          <span className="font-semibold text-sm text-dark">{T.orders}</span>
        </Link>
        <Link href="/my-car" className="card p-4 flex items-center gap-3 hover:border-primary transition-colors">
          <span className="text-2xl">🚗</span>
          <span className="font-semibold text-sm text-dark">{T.myCar}</span>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-1">
          <button onClick={()=>{setTab('info');setMsg('');setErr('');}}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab==='info'?'text-primary border-b-2 border-primary bg-primary/5':'text-text3 hover:text-dark'}`}>
            {T.info}
          </button>
          <button onClick={()=>{setTab('password');setMsg('');setErr('');}}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab==='password'?'text-primary border-b-2 border-primary bg-primary/5':'text-text3 hover:text-dark'}`}>
            {T.password}
          </button>
        </div>
        <div className="p-6">
          {tab==='info' && (
            <form onSubmit={saveInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text3 mb-1">{T.name}</label>
                <input className="input-field" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text3 mb-1">Email</label>
                <input className="input-field bg-gray-50 cursor-not-allowed opacity-60" value={user.email} disabled />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text3 mb-1">{T.phone}</label>
                <input className="input-field" type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
              </div>
              {msg && <div className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2">✅ {msg}</div>}
              {err && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{err}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading?'⏳...':T.save}</button>
            </form>
          )}
          {tab==='password' && (
            <form onSubmit={savePass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text3 mb-1">{T.newPass}</label>
                <div className="relative">
                  <input className="input-field pr-10" type={showPass?'text':'password'}
                    value={passForm.newPass} onChange={e=>setPassForm(p=>({...p,newPass:e.target.value}))} required minLength={6} />
                  <button type="button" onClick={()=>setShowPass(p=>!p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-primary text-lg">
                    {showPass?'🙈':'👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text3 mb-1">{T.confirmPass}</label>
                <input className="input-field" type={showPass?'text':'password'}
                  value={passForm.confirm} onChange={e=>setPassForm(p=>({...p,confirm:e.target.value}))} required minLength={6} />
              </div>
              {msg && <div className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2">✅ {msg}</div>}
              {err && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{err}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading?'⏳...':T.save}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
