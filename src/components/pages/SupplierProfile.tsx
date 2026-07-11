'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useLang } from '@/store';

export function SupplierProfilePage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [form, setForm] = useState({companyName:'',contactName:'',phone:'',address:'',taxId:'',bankAccount:''});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const [passForm, setPassForm] = useState({current:'',newPass:'',confirm:''});
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    api.get('/api/supplier/me').then(r => {
      const s = r.data.data;
      setSupplier(s);
      setForm({
        companyName: s.companyName||'',
        contactName: s.contactName||'',
        phone: s.phone||'',
        address: s.address||'',
        taxId: s.taxId||'',
        bankAccount: s.bankAccount||'',
      });
    }).finally(()=>setLoading(false));
  }, []);

  const changePassword = async () => {
    if (!passForm.current||!passForm.newPass) return setPassMsg(t('შეავსეთ ველები','Fill in fields','Заполните поля'));
    if (passForm.newPass !== passForm.confirm) return setPassMsg(t('პაროლები არ ემთხვევა','Passwords do not match','Пароли не совпадают'));
    if (passForm.newPass.length < 6) return setPassMsg(t('მინიმუმ 6 სიმბოლო','Minimum 6 characters','Минимум 6 символов'));
    setPassSaving(true); setPassMsg('');
    try {
      await api.patch('/api/supplier/change-password', {currentPassword:passForm.current, newPassword:passForm.newPass});
      setPassMsg(t('✅ პაროლი შეიცვალა','✅ Password changed','✅ Пароль изменён'));
      setPassForm({current:'',newPass:'',confirm:''});
    } catch(e:any){ setPassMsg('❌ '+( e.response?.data?.error||'შეცდომა')); }
    setPassSaving(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/api/supplier/profile', form);
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    } catch(e:any){ alert(e.response?.data?.error||'შეცდომა'); }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/supplier/dashboard" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-2xl font-bold text-gray-800">⚙️ კომპანიის პროფილი</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{ t('კომპანიის ინფო','Company Info','Информация о компании') }</h2>
          {[
            [`companyName`,t('კომპანიის სახელი *','Company Name *','Название компании *'),t('შპს ავტონაწილები...','LLC AutoParts...','ООО АвтоДеталь...')],
            [`contactName`,t('საკონტაქტო პირი *','Contact Person *','Контактное лицо *'),t('სახელი გვარი','Full Name','Имя Фамилия')],
            [`phone`,t('ტელეფონი *','Phone *','Телефон *'),'+995...'],
            [`address`,t('მისამართი','Address','Адрес'),t('ქ. თბილისი...','Tbilisi...','г. Тбилиси...')],
            [`taxId`,t('საიდენტიფიკაციო კოდი','Tax ID','Налоговый код'),'123456789'],
          ].map(([k,l,p])=>(
            <div key={k}>
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p}/>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{ t('💳 საბანკო რეკვიზიტები','💳 Bank Details','💳 Банковские реквизиты') }</h2>
          <p className="text-xs text-gray-400">{ t('გამოიყენება ბალანსის გამოტანისთვის','Used for balance withdrawal','Используется для вывода баланса') }</p>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{ t('საბანკო ანგარიში (IBAN)','Bank Account (IBAN)','Банковский счёт (IBAN)') }</label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              value={form.bankAccount} onChange={e=>setForm({...form,bankAccount:e.target.value})} placeholder="GE00TB0000000000000000"/>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-4">{ t('📊 სტატისტიკა','📊 Statistics','📊 Статистика') }</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              [t('კომისია','Commission','Комиссия'), supplier?.commission+'%'],
              [t('სტატუსი','Status','Статус'), supplier?.status==='APPROVED'?t('✅ აქტიური','✅ Active','✅ Активный'):'⏳ '+supplier?.status],
              [t('რეგისტრაცია','Registered','Регистрация'), new Date(supplier?.createdAt).toLocaleDateString('ka-GE')],
              [t('ბალანსი','Balance','Баланс'), supplier?.balance?.toFixed(2)+'₾'],
            ].map(([l,v])=>(
              <div key={l} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">{l}</p>
                <p className="font-bold text-gray-800 mt-1">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{ t('🔐 პაროლის შეცვლა','🔐 Change Password','🔐 Изменить пароль') }</h2>
          {[
            ['current',t('მიმდინარე პაროლი','Current Password','Текущий пароль')],
            ['newPass',t('ახალი პაროლი','New Password','Новый пароль')],
            ['confirm',t('გაიმეორეთ ახალი პაროლი','Confirm New Password','Повторите новый пароль')],
          ].map(([k,l])=>(
            <div key={k} className="relative">
              <label className="text-xs text-gray-500 mb-1 block">{l}</label>
              <input type={showPass?'text':'password'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(passForm as any)[k]} onChange={e=>setPassForm({...passForm,[k]:e.target.value})}/>
            </div>
          ))}
          <button type="button" onClick={()=>setShowPass(p=>!p)} className="text-xs text-gray-400 hover:text-gray-600">
            {showPass?'🙈 დამალვა':'👁️ ჩვენება'}
          </button>
          {passMsg && <p className={`text-sm ${passMsg.startsWith('✅')?'text-green-600':'text-red-600'}`}>{passMsg}</p>}
          <button onClick={changePassword} disabled={passSaving}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition disabled:opacity-60">
            {passSaving?t('იცვლება...','Changing...','Изменяется...'):t('პაროლის შეცვლა','Change Password','Изменить пароль')}
          </button>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60">
          {saving?t('ინახება...','Saving...','Сохранение...'):saved?t('✅ შენახულია!','✅ Saved!','✅ Сохранено!'):t('შენახვა','Save','Сохранить')}
        </button>
      </div>
    </div>
  );
}
