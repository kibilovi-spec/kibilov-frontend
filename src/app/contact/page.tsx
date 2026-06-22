'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputStyle = (val: string) => ({
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: submitted && !val.trim() ? '1.5px solid #ef4444' : '1px solid #ddd',
    fontSize: '14px', boxSizing: 'border-box' as const,
    outline: 'none', background: submitted && !val.trim() ? '#fff5f5' : '#fff',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!form.name.trim()) { setErr('სახელი სავალდებულოა'); return; }
    if (!form.phone.trim()) { setErr('ტელეფონი სავალდებულოა'); return; }
    if (!form.message.trim()) { setErr('შეტყობინება სავალდებულოა'); return; }
    setErr(''); setLoading(true);
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error('error');
      setSuccess(true);
      setForm({ name: '', phone: '', message: '' });
      setSubmitted(false);
    } catch { setErr('შეცდომა, სცადეთ ხელახლა'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>კონტაქტი</h1>
      <div style={{ width: '60px', height: '4px', background: '#e05a2b', marginBottom: '32px', borderRadius: '2px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: '#1a1a2e' }}>საკონტაქტო ინფორმაცია</h2>
          {[
            { icon: '📞', label: 'ტელეფონი', value: '+995 577 575 052', href: 'tel:+995577575052' },
            { icon: '✉️', label: 'ელ-ფოსტა', value: 'info@kibilov.ge', href: 'mailto:info@kibilov.ge' },
            { icon: '📍', label: 'მისამართი', value: 'რუსთავი, საქართველო', href: null },
            { icon: '🕐', label: 'სამუშაო საათები', value: 'ორშ–კვი: 09:00–19:00', href: null },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px' }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>{item.label}</div>
                {item.href ? <a href={item.href} style={{ fontSize: '16px', color: '#1a1a2e', textDecoration: 'none', fontWeight: 500 }}>{item.value}</a>
                : <div style={{ fontSize: '16px', color: '#1a1a2e', fontWeight: 500 }}>{item.value}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: '#1a1a2e' }}>დაგვიკავშირდით</h2>
          {success ? (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontWeight: 600, color: '#166534' }}>შეტყობინება გაიგზავნა!</div>
              <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>მალე დაგიკავშირდებით</div>
              <button onClick={() => setSuccess(false)} style={{ marginTop: '16px', padding: '8px 20px', background: '#1a3a8f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>ახალი შეტყობინება</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: submitted && !form.name.trim() ? '#ef4444' : '#666', display: 'block', marginBottom: '6px', fontWeight: submitted && !form.name.trim() ? 600 : 400 }}>სახელი *</label>
                <input type="text" placeholder="თქვენი სახელი" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle(form.name)} />
                {submitted && !form.name.trim() && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>⚠ სავალდებულო ველი</div>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: submitted && !form.phone.trim() ? '#ef4444' : '#666', display: 'block', marginBottom: '6px', fontWeight: submitted && !form.phone.trim() ? 600 : 400 }}>ტელეფონი *</label>
                <input type="tel" placeholder="+995 5XX XXX XXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle(form.phone)} />
                {submitted && !form.phone.trim() && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>⚠ სავალდებულო ველი</div>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: submitted && !form.message.trim() ? '#ef4444' : '#666', display: 'block', marginBottom: '6px', fontWeight: submitted && !form.message.trim() ? 600 : 400 }}>შეტყობინება *</label>
                <textarea placeholder="თქვენი შეტყობინება..." rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  style={{ ...inputStyle(form.message), resize: 'vertical' }} />
                {submitted && !form.message.trim() && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>⚠ სავალდებულო ველი</div>}
              </div>
              {err && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{err}</div>}
              <button type="submit" disabled={loading}
                style={{ display: 'block', width: '100%', padding: '12px', background: loading ? '#aaa' : '#e05a2b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ იგზავნება...' : '📞 დაგვიკავშირდით'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}