'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useLang } from '@/store';

export default function ResetPasswordPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<'email'|'code'|'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email, lang });
      setMsg(lang==='en'?'Code sent to your email':lang==='ru'?'Код отправлен на email':'კოდი გაიგზავნა email-ზე');
      setStep('code');
    } catch { setErr(lang==='en'?'Error sending code':lang==='ru'?'Ошибка':'კოდის გაგზავნის შეცდომა'); }
    finally { setLoading(false); }
  };

  const resetPass = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (newPass !== confirm) { setErr(lang==='en'?'Passwords do not match':lang==='ru'?'Пароли не совпадают':'პაროლები არ ემთხვევა'); return; }
    if (newPass.length < 6) { setErr(lang==='en'?'Min 6 characters':lang==='ru'?'Мин. 6 символов':'მინ. 6 სიმბოლო'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, code, password: newPass });
      setStep('done');
    } catch(e: any) { setErr(e.response?.data?.message || (lang==='en'?'Invalid code':lang==='ru'?'Неверный код':'კოდი არასწორია')); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container py-16 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">

        {step==='done' ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-dark mb-2">
              {lang==='en'?'Password Changed!':lang==='ru'?'Пароль изменён!':'პაროლი შეიცვალა!'}
            </h2>
            <p className="text-text3 text-sm mb-6">
              {lang==='en'?'You can now sign in with your new password':lang==='ru'?'Войдите с новым паролем':'შეგიძლია შეხვიდე ახალი პაროლით'}
            </p>
            <button onClick={()=>router.push('/')} className="btn-primary w-full">
              {lang==='en'?'Sign In':lang==='ru'?'Войти':'შესვლა'}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-dark">
                {lang==='en'?'Reset Password':lang==='ru'?'Сброс пароля':'პაროლის აღდგენა'}
              </h2>
              <p className="text-text3 text-sm mt-1">
                {step==='email'
                  ? (lang==='en'?'Enter your email to receive a code':lang==='ru'?'Введите email для получения кода':'შეიყვანე email კოდის მისაღებად')
                  : (lang==='en'?'Enter the code from your email':lang==='ru'?'Введите код из письма':'შეიყვანე კოდი email-იდან')}
              </p>
            </div>

            {msg && <div className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2 mb-4">✅ {msg}</div>}
            {err && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{err}</div>}

            {step==='email' && (
              <form onSubmit={sendCode} className="space-y-4">
                <input className="input-field" type="email" placeholder="Email"
                  value={email} onChange={e=>setEmail(e.target.value)} required />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading?'⏳...':(lang==='en'?'Send Code':lang==='ru'?'Отправить код':'კოდის გაგზავნა')}
                </button>
              </form>
            )}

            {step==='code' && (
              <form onSubmit={resetPass} className="space-y-4">
                <input className="input-field text-center text-2xl font-bold tracking-widest" 
                  placeholder="000000" maxLength={6}
                  value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} required />
                <div className="relative">
                  <input className="input-field pr-10" type={showPass?'text':'password'}
                    placeholder={lang==='en'?'New Password':lang==='ru'?'Новый пароль':'ახალი პაროლი'}
                    value={newPass} onChange={e=>setNewPass(e.target.value)} required minLength={6} />
                  <button type="button" onClick={()=>setShowPass(p=>!p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-primary text-lg">
                    {showPass?'🙈':'👁️'}
                  </button>
                </div>
                <input className="input-field" type={showPass?'text':'password'}
                  placeholder={lang==='en'?'Confirm Password':lang==='ru'?'Подтвердить':'გაიმეორე პაროლი'}
                  value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={6} />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading?'⏳...':(lang==='en'?'Change Password':lang==='ru'?'Изменить пароль':'პაროლის შეცვლა')}
                </button>
                <button type="button" onClick={()=>{setStep('email');setErr('');setMsg('');}}
                  className="w-full text-sm text-text3 hover:text-primary">
                  ← {lang==='en'?'Back':lang==='ru'?'Назад':'უკან'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
