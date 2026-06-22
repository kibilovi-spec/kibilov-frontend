'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/store';
import Link from 'next/link';

export default function B2BApplyPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ companyName: '', contactName: '', taxId: '', phone: '', address: '', description: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    if (!form.companyName || !form.contactName || !form.phone) return alert('შეავსეთ სავალდებულო ველები');
    if (!form.email || !form.password) return alert('Email და პაროლი სავალდებულოა');
    if (form.password.length < 6) return alert('პაროლი მინიმუმ 6 სიმბოლო');
    if (!agreed) return alert('გთხოვთ დაეთანხმოთ პირობებს');
    setLoading(true);
    try {
      await api.post('/api/auth/b2b-apply', form);
      setDone(true);
    } catch(e: any) { alert(e.response?.data?.message || 'შეცდომა'); }
    setLoading(false);
  };

  // B2B form is public — user can fill it, auth required only on submit

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">განაცხადი გაიგზავნა!</h2>
        <p className="text-gray-500 mb-6">24 საათის განმავლობაში განვიხილავთ და დაგიკავშირდებით.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">მთავარი</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🏢 B2B განაცხადი</h1>
          <p className="text-gray-500 text-sm mb-6">შეავსეთ ფორმა და მიიღეთ B2B ფასები + ფასდაკლება</p>
          <div className="space-y-4">
            <input value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})}
              placeholder="კომპანიის სახელი *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input value={form.contactName} onChange={e=>setForm({...form,contactName:e.target.value})}
              placeholder="საკონტაქტო პირი *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input value={form.taxId} onChange={e=>setForm({...form,taxId:e.target.value})}
              placeholder="საგადასახადო კოდი *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}
              placeholder="ტელეფონი" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}
              placeholder="მისამართი" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder="დამატებითი ინფორმაცია" rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-3 font-medium">🔐 ანგარიშის შექმნა</p>
              <div className="space-y-3">
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                  placeholder="Email *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <div className="relative">
                  <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                    placeholder="პაროლი * (მინ. 6 სიმბოლო)" className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  <button type="button" onClick={()=>setShowPass((p:boolean)=>!p)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-lg">{showPass?'🙈':'👁️'}</button>
                </div>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                ვეთანხმები <a href="/b2b-agreement" target="_blank" className="text-blue-600 hover:underline">B2B ხელშეკრულებას</a> და <a href="/terms" target="_blank" className="text-blue-600 hover:underline">მომსახურების პირობებს</a>
              </span>
            </label>
            <button onClick={submit} disabled={loading || !agreed}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'იგზავნება...' : 'განაცხადის გაგზავნა'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
