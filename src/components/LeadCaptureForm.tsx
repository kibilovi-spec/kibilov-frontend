'use client';
import { useState } from 'react';

interface LeadData {
  oemCode?: string;
  partName?: string;
  make?: string;
  model?: string;
  year?: string;
}

export default function LeadCaptureForm({ leadData }: { leadData: LeadData }) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!phone || phone.length < 9) return;
    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, ...leadData })
      });
      setSent(true);
    } catch(e) {}
    setLoading(false);
  };

  if (sent) return (
    <div style={{ marginTop: '8px', background: 'var(--color-background-success)', border: '0.5px solid var(--color-border-success)', borderRadius: '10px', padding: '10px 12px' }}>
      <p style={{ fontSize: '13px', color: 'var(--color-text-success)', margin: 0, fontWeight: 500 }}>✅ მიღებულია! დაგიკავშირდებით მალე.</p>
    </div>
  );

  return (
    <div style={{ marginTop: '8px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '10px', padding: '10px 12px' }}>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
        📞 დაგიკავშირდებით და მოვძებნით{leadData.partName ? ` — ${leadData.partName}` : ''}
      </p>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          type="tel"
          placeholder="5XX XXX XXX"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ flex: 1, fontSize: '13px', padding: '6px 10px', borderRadius: '8px', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', outline: 'none' }}
        />
        <button
          onClick={submit}
          disabled={loading || phone.length < 9}
          style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: loading || phone.length < 9 ? 'var(--color-background-tertiary)' : '#1a56db', color: loading || phone.length < 9 ? 'var(--color-text-tertiary)' : '#fff', cursor: phone.length < 9 ? 'default' : 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}
        >
          {loading ? '...' : 'შეკვეთა'}
        </button>
      </div>
    </div>
  );
}
