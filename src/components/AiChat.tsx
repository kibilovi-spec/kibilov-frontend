'use client';
import LeadCaptureForm from './LeadCaptureForm';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: string;
  nameKa: string;
  sku: string;
  price: string;
  stock: number;
  images: string[];
  category: { nameKa: string };
  oemCodes?: string[];
  alternativeSearchKeys?: string[];
  _explanation?: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
  referenceData?: { generation?: string; capacity?: string; codes?: {brand:string;code:string;desc:string}[]; note?: string; crossRef?: {brand:string;code:string;desc:string;image?:string|null;nameEn?:string}[] };
  autodocResults?: { count: number; categoryEn: string; articles: {brand:string;code:string;desc:string;image?:string}[] };
  serviceMessage?: string;
  bundleData?: { kit: string; parts: string[]; bundleProducts: {partType:string; product:any}[] };
  leadData?: { oemCode?: string; partName?: string; make?: string; model?: string; year?: string };
  explanation?: string;
  relatedParts?: {part:string; relation:string; reason?:string}[];
  confidence?: number;
  fitmentRisk?: string;
  oemHint?: { code: string; image: string | null };
}

const PLACEHOLDERS = [
  'Toyota Camry 2018, წინა ამორტიზატორი...',
  'BMW E90 2010, ზეთის ფილტრი...',
  'Golf 6, სამუხრუჭე ხუნდები...',
  'Opel Astra H, წყლის ტუმბო...',
  'Nissan X-Trail, CV joint...',
];

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [analyticsId, setAnalyticsId] = useState<string|null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'მოგესალმებით. მიუთითეთ ავტომობილის მოდელი და სასურველი დეტალი — მოვძებნი.' }
  ]);
  const [input, setInput] = useState('');
  const [vehicle, setVehicle] = useState<{brand?:string;model?:string;year?:string;engine?:string} | null>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kibilov-vehicle') : null;
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string|null>(null);
  const [compatData, setCompatData] = useState<Record<string,any[]>>({});
  const loadCompat = async (c: string) => { if (compatData[c]) return; try { const r = await fetch(`/api/reference/compatibility?code=${encodeURIComponent(c)}`); const d = await r.json(); if (d.compatible?.length) setCompatData(prev => ({...prev, [c]: d.compatible})); } catch(e) {} };
  const copyCode = (c: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(c).catch(() => {
          const el = document.createElement('textarea'); el.value = c;
          el.style.position = 'fixed'; el.style.opacity = '0';
          document.body.appendChild(el); el.select();
          document.execCommand('copy'); document.body.removeChild(el);
        });
      } else {
        const el = document.createElement('textarea'); el.value = c;
        el.style.position = 'fixed'; el.style.opacity = '0';
        document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
      }
    } catch(e) {}
    setCopiedCode(c); setTimeout(() => setCopiedCode(null), 2000);
  };
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const startVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('თქვენი ბრაუზერი ხმოვან ძებნას არ უჭერს მხარს'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ka-GE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail as string;
      if (query) {
        setOpen(true);
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'user', text: query }]);
          setLoading(true);
          fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query, context: vehicle })
          }).then(r => r.json()).then(data => {
            const products = data.products || [];
            const p = data.parsed;
            const text = products.length === 0
              ? `"${p?.part_ka || query}" — ვერ ვიპოვე სტოკში.`
              : `${p?.part_ka || p?.part_en} — ${products.length} შედეგი:`;
            const refData = data.referenceData || null;
            setMessages(prev => [...prev, { role: 'assistant', text, products, referenceData: refData }]);
          }).catch(() => {
            setMessages(prev => [...prev, { role: 'assistant', text: 'შეცდომა. სცადეთ თავიდან.' }]);
          }).finally(() => setLoading(false));
        }, 300);
      }
    };
    window.addEventListener('kibilov-ai-search', handler);
    const openHandler = () => setOpen(true);
    window.addEventListener('kibilov-ai-open', openHandler);
    return () => {
      window.removeEventListener('kibilov-ai-search', handler);
      window.removeEventListener('kibilov-ai-open', openHandler);
    };
  }, [vehicle]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/ai/chat', { message: userMsg, context: vehicle });
      // VIN decoded — პირველ შევამოწმოთ
      if (data.type === 'vin_decoded' && data.vin) {
        const v = data.vin;
        const m = (v.make||'').toLowerCase().replace(/\s+/g,'-');
        const mod = (v.model||'').toLowerCase().replace(/\s+/g,'-');
        const carImg = `https://media.autodoc.eu/images/cars/${m}/${mod}/${m}_${mod}.jpg`;
        const carInfo = `🚗 ${v.year} ${v.make} ${v.model || ''}${v.engine ? ' · ' + v.engine : ''}||IMG:${carImg}`;
        setVehicle({ brand: v.make, model: v.model, year: v.year, engine: v.engine });
        try { localStorage.setItem('kibilov-vehicle', JSON.stringify({ brand: v.make, model: v.model, year: v.year })); } catch {}
        setMessages(prev => [...prev, { role: 'assistant', text: carInfo + '\n\nმანქანა დამახსოვრდა ✅ ახლა მიუთითეთ საჭირო ნაწილი.' }]);
        setLoading(false);
        return;
      }
      if (data.type === 'vin_not_found') {
        setMessages(prev => [...prev, { role: 'assistant', text: data.message || 'VIN ვერ დამუშავდა.' }]);
        setLoading(false);
        return;
      }
      if (data.parsed?.brand || data.parsed?.model) {
        const newVehicle = {
          ...(data.parsed.brand && { brand: data.parsed.brand }),
          ...(data.parsed.model && { model: data.parsed.model }),
          ...(data.parsed.year && { year: data.parsed.year }),
          ...(data.parsed.engine && { engine: data.parsed.engine }),
        };
        setVehicle(prev => { 
          const updated = {...prev, ...newVehicle};
          try { localStorage.setItem('kibilov-vehicle', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
      // VIN not found — friendly message
      if (data.type === 'vin_not_found') {
        setMessages(prev => [...prev, { role: 'assistant', text: data.message || 'VIN ვერ დამუშავდა. გთხოვთ მიუთითეთ მარკა და მოდელი ხელით.' }]);
        setLoading(false);
        return;
      }
      // VIN decoded response
      if (data.type === 'vin_decoded' && data.vin) {
        const v = data.vin;
        const carInfo = `🚗 ${v.year} ${v.make} ${v.model}${v.engine ? ' · ' + v.engine : ''}${v.capacity ? ' · ' + v.capacity + 'cc' : ''}${v.fuel ? ' · ' + v.fuel : ''}${v.cylinders ? ' · ' + v.cylinders + ' cyl' : ''}`;
        setVehicle({ brand: v.make, model: v.model, year: v.year, engine: v.engine });
        setMessages(prev => [...prev, { role: 'assistant', text: carInfo + '\n\nმანქანა დამახსოვრდა. ახლა მიუთითეთ საჭირო ნაწილი.' }]);
        setLoading(false);
        return;
      }
      if (data.analyticsId) setAnalyticsId(data.analyticsId);
      const products: Product[] = data.products || [];
      if (data.analyticsId && products.length > 0) trackImpressions(products, data.analyticsId);
      const p = data.parsed;
      const suggestions: string[] = data.suggestions || [];
      let text = '';
      if (products.length === 0) {
        const reasons = [];
        if (p.brand && p.model) reasons.push(`✓ ${p.brand} ${p.model}${p.year?' '+p.year:''} — ამოცნობილია`);
        if (data.referenceData?.codes?.length) reasons.push(`✓ OEM კოდი ცნობილია`);
        else if (data.referenceData?.crossRef?.length) reasons.push(`✓ Autodoc კატალოგში ნაპოვნია`);
        else reasons.push(`✗ კატალოგში ვერ მოიძებნა`);
        reasons.push(`✗ სტოკში არ არის`);
        reasons.push(`✓ შეკვეთა შესაძლებელია`);
        text = `"${p.part_ka || userMsg}" — ვერ ვიპოვე სტოკში.\n\n${reasons.join('\n')}`;
        if (suggestions.length > 0) {
          text += '\n\nშესაძლოა გულისხმობდით:\n' + suggestions.map((s: string, i: number) => `${i+1}. ${s}`).join('\n');
        }
      } else {
        text = `${p.part_ka || p.part_en} — ${products.length} შედეგი:`;
      }
      const refData = data.referenceData || null;
      const _expl = data._explanation || null;
      const _related = data.relatedParts || [];
      const _conf = data.confidence || null;
      const _risk = data.fitmentRisk || null;
      setMessages(prev => [...prev, { role: 'assistant', text, products, referenceData: refData, explanation: _expl, relatedParts: _related, confidence: _conf, fitmentRisk: _risk, analyticsId: data.analyticsId||null }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'შეცდომა. სცადეთ თავიდან.' }]);
    } finally {
      setLoading(false);
    }
  };

  const vehicleLabel = vehicle?.brand
    ? `${vehicle.brand}${vehicle.model ? ' ' + vehicle.model : ''}${vehicle.year ? ' · ' + vehicle.year : ''}`
    : null;

  const trackClick = async (productId: string, position?: number) => {
    if (!analyticsId) return;
    try { await axios.post('/api/analytics/click', { analyticsId, productId, position }); } catch {}
  };

  const trackImpressions = async (products: any[], aid: string) => {
    if (!aid || !products?.length) return;
    try {
      const payload = products.slice(0, 20).map((p, i) => ({ productId: p.id, position: i + 1 }));
      await axios.post('/api/analytics/impressions', { analyticsId: aid, products: payload });
    } catch {}
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .chat-window { animation: fadeSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
        .typing-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; animation: pulse-dot 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .product-card { transition: all 0.15s ease; }
        .product-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.1); }
        .send-btn { transition: all 0.15s ease; }
        .send-btn:hover:not(:disabled) { background: #1e3a8a !important; }
        .chat-toggle { transition: all 0.2s ease; }
        .chat-toggle:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.25) !important; }
      `}</style>

      <button
        onClick={() => setOpen(!open)}
        className="chat-toggle fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold shadow-lg"
        style={{ background: open ? '#1e293b' : '#0f172a', color: '#f8fafc' }}
        aria-label="AI ძებნა"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>AI ძებნა</span>
          </>
        )}
      </button>

      {open && (
        <div className="chat-window fixed z-50 flex flex-col overflow-hidden"
          style={isMobile ? { top:0, left:0, right:0, bottom:0, width:'100%', height:'100%', borderRadius:0, background:'#ffffff', border:'none', boxShadow:'none' } : { bottom:'96px', right:'24px', width:'380px', height:'520px', background:'#ffffff', borderRadius:'16px', boxShadow:'0 24px 64px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08)', border:'1px solid #e2e8f0' }}>

          <div style={{ background: '#0f172a', padding: '14px 16px' }} className="flex items-center gap-3 shrink-0">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', letterSpacing: '-0.01em' }}>Kibilov AI ასისტენტი</div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '1px' }}>
                {vehicleLabel ? <span style={{ color: '#60a5fa' }}>{vehicleLabel}</span> : 'სათადარიგო ნაწილების ჭკვიანი ძიება'}
              </div>
            </div>
            {vehicleLabel && (
              <button onClick={() => { setVehicle(null); try { localStorage.removeItem("kibilov-vehicle"); } catch {} }}
                style={{ color: '#94a3b8', fontSize: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer' }}>
                გასუფთავება
              </button>
            )}
          </div>

          {/* Sticky Vehicle Bar — global */}
      {vehicle?.brand && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 55,
          background: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 100%)',
          padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(15,23,42,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5"/>
              <circle cx="15.5" cy="17.5" r="2.5"/><circle cx="5.5" cy="17.5" r="2.5"/>
            </svg>
            <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}>
              {vehicle.brand} {vehicle.model || ''} {vehicle.year ? '· ' + vehicle.year : ''} {vehicle.engine ? '· ' + vehicle.engine : ''}
            </span>
            <span style={{ color: '#60a5fa', fontSize: '11px', background: 'rgba(96,165,250,0.15)', padding: '2px 8px', borderRadius: '20px' }}>
              აქტიური
            </span>
          </div>
          <button
            onClick={() => { setVehicle(null); try { localStorage.removeItem('kibilov-vehicle'); } catch {} }}
            style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
          >×</button>
        </div>
      )}

          {vehicle?.brand && (
            <div style={{ padding: '6px 12px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {[
                  { label: '🛢️ ზეთის შეცვლა', q: 'ზეთის ფილტრი ძრავის ზეთი', cat: 'Oil Filter' },
                  { label: '🔴 წინა კალოტკა', q: 'წინა სამუხრუჭე ხუნდი', cat: 'Front Brake Pads' },
                  { label: '🔵 უკანა კალოტკა', q: 'უკანა სამუხრუჭე ხუნდი', cat: 'Rear Brake Pads' },
                  { label: '💨 ჰაერის ფილტრი', q: 'ჰაერის ფილტრი', cat: 'Air Filter' },
                  { label: '🌡️ თერმოსტატი', q: 'თერმოსტატი', cat: 'Thermostat' },
                  { label: '🔧 ამორტიზატორი', q: 'ამორტიზატორი', cat: 'Shock Absorbers' },
                  { label: '⚡ გენერატორი', q: 'გენერატორი', cat: 'Alternator & Parts' },
                  { label: '🔗 კლაჩი', q: 'გადაბმულობის კომპლექტი', cat: 'Clutch Kit' },
                ].map((tag, i) => (
                  <button key={i} onClick={async () => {
                    const q = `${vehicle.brand} ${vehicle.model||''} ${vehicle.year||''} ${tag.q}`.trim();
                    setMessages(prev => [...prev, { role: 'user', text: q }]);
                    if ((tag as any).cat && vehicle.brand) {
                      try {
                        const r = await fetch(`/api/autodoc/byCategoryName?make=${encodeURIComponent(vehicle.brand)}&model=${encodeURIComponent(vehicle.model||'')}&year=${encodeURIComponent(vehicle.year||'')}&categoryEn=${encodeURIComponent((tag as any).cat)}`);
                        const d = await r.json();
                        if (d.found && d.articles?.length) {
                          const codes = d.articles.map((a: any) => a.code).filter(Boolean);
                          const cr = await fetch('/api/autodoc/checkCodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ codes }) });
                          const cd = await cr.json();
                          const inStock = cd.found || {};
                          const matched = Object.values(inStock) as any[];
                          if (matched.length > 0) {
                            setMessages(prev => [...prev, { role: 'assistant', text: tag.q + ' — ' + matched.length + ' შედეგი:', products: matched }]);
                          } else {
                            const refR = await fetch(`/api/reference/lookup?make=${encodeURIComponent(vehicle.brand)}&model=${encodeURIComponent(vehicle.model||'')}&year=${encodeURIComponent(vehicle.year||'')}&part=${encodeURIComponent(tag.q)}`);
                            const refD = await refR.json();
                            const hintImage = d.articles[0]?.image || null;
                            if (refD.codes?.length) {
                              // try crossref-and-check for each ref code
                              let crossFound = false;
                              for (const entry of refD.codes.slice(0, 3)) {
                                const xr = await fetch(`/api/autodoc/crossref-and-check?articleNo=${encodeURIComponent(entry[1])}`);
                                const xd = await xr.json();
                                if (xd.found && Object.keys(xd.inStock).length > 0) {
                                  const matched = Object.values(xd.inStock) as any[];
                                  setMessages(prev => [...prev, { role: 'assistant', text: tag.q + ' — ' + matched.length + ' შედეგი:', products: matched }]);
                                  crossFound = true;
                                  break;
                                }
                              }
                              if (!crossFound) {
                                const oemEntry = refD.codes[0];
                                setMessages(prev => [...prev, { role: 'assistant', text: tag.q + ' — ამ მომენტში საწყობში არ გვაქვს.', oemHint: { code: oemEntry[1], image: hintImage } }]);
                              }
                            } else {
                              setMessages(prev => [...prev, { role: 'assistant', text: tag.q + ' — ამ მომენტში საწყობში არ გვაქვს.', leadData: { partName: tag.q, make: vehicle.brand, model: vehicle.model||'', year: String(vehicle.year||'') } }]);
                            }
                          }
                        } else {
                          setMessages(prev => [...prev, { role: 'assistant', text: tag.q + ' — ამ მომენტში საწყობში არ გვაქვს.' }]);
                        }
                      } catch(e) {}
                    }
                  }} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#334155', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}
      {/* Quick Actions */}
          {messages.length <= 1 && !vehicle && (
            <div style={{ padding: '8px 12px 0', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>სწრაფი ძებნა:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '🔢 VIN კოდი', text: 'ჩემი VIN: ' },
                  { label: '🔧 სლენგით', text: 'Golf 6 კალოტკა წინა' },
                  { label: '📸 ფოტოთი', action: 'photo' },
                  { label: '🚗 მანქანა', text: 'Toyota Camry 2012 ' },
                ].map((btn, i) => (
                  <button key={i}
                    onClick={() => {
                      if (btn.action === 'photo') {
                        (document.querySelector('input[type=file]') as HTMLInputElement)?.click();
                      } else {
                        setInput(btn.text || '');
                      }
                    }}
                    style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f8fafc' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="text-sm" style={{
                  maxWidth: '88%', padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? '#0f172a' : '#ffffff',
                  color: msg.role === 'user' ? '#f8fafc' : '#1e293b',
                  border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.06)', lineHeight: '1.5'
                }}>
                  {(() => {
                    const parts = (msg.text||'').split('||IMG:');
                    return <>
                      <p style={{ whiteSpace: 'pre-line' }}>{parts[0]}</p>
                      {parts[1] && <img src={parts[1].split('\n')[0]} alt="" 
                        className="mt-2 rounded-xl w-full max-w-[200px] object-cover"
                        onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />}
                    </>;
                  })()}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.slice(0, 5).map(p => (
                        <div key={p.id} className="product-card rounded-xl" style={{ background: '#ffffff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          {/* Product header */}
                          <div style={{ padding: '10px 12px 6px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            {p.images && p.images.length > 0 && (
                              <img src={p.images[0]} alt={p.nameKa} style={{ width: '52px', height: '52px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #f1f5f9', flexShrink: 0, background: '#f8fafc' }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600, lineHeight: '1.4', marginBottom: '2px' }}>
                              {p.nameKa.slice(0, 65)}{p.nameKa.length > 65 ? '...' : ''}
                            </div>
                            {(() => {
                              const en = msg.referenceData?.crossRef?.[0]?.nameEn || ((p as any).nameEn && !(p as any).nameEn.match(/[\u10D0-\u10FF]/) ? (p as any).nameEn : null);
                              return en ? <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{en.slice(0,60)}</div> : null;
                            })()}
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>SKU: {p.sku} {p.category?.nameKa ? '· ' + p.category.nameKa : ''}</div>
                            {vehicle?.brand && vehicle?.model && (() => {
                              const vb = vehicle.brand.toUpperCase();
                              const vm = (vehicle.model||'').toUpperCase();
                              const pname = p.nameKa.toUpperCase();
                              const palt = (p.alternativeSearchKeys||[]).join(' ').toUpperCase();
                              const isMatch = pname.includes(vb) || pname.includes(vm) || palt.includes(vb) || palt.includes(vm);
                              if (!isMatch) return null;
                              return (
                                <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span style={{ fontSize: '9px', background: '#f0fdf4', color: '#16a34a', border: '0.5px solid #bbf7d0', borderRadius: '4px', padding: '1px 5px', fontWeight: 500 }}>
                                    ✓ {vehicle.brand} {vehicle.model}{vehicle.year ? ' ' + vehicle.year : ''}
                                  </span>
                                </div>
                              );
                            })()}
                            </div>
                          </div>
                          {/* Explanation */}
                          {p._explanation && (
                            <div style={{ padding: '4px 12px', background: '#f0fdf4', borderTop: '1px solid #dcfce7', fontSize: '10px', color: '#16a34a', lineHeight: '1.5' }}>
                              {p._explanation}
                            </div>
                          )}
                          {/* Price + Actions */}
                          <div style={{ padding: '8px 12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9' }}>
                            <div>
                              <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>{p.price}</span>
                              <span style={{ color: '#64748b', fontSize: '12px' }}> ₾</span>
                              {p.stock > 0 && (
                                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 500 }}>✓ მარაგშია ({p.stock})</div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <a href={`/products/${p.id}`} onClick={async (e) => { e.preventDefault(); await trackClick(p.id); window.open(`/products/${p.id}`, '_blank'); }}
                                style={{ fontSize: '12px', background: '#f8fafc', color: '#1e293b', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500, border: '1px solid #e2e8f0' }}>
                                ნახვა
                              </a>
                              <button onClick={(e) => {
                                const btn = e.currentTarget;
                                btn.textContent = '...';
                                btn.style.opacity = '0.7';
                                fetch('/api/cart/add', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('kibilov-auth') || '{}')?.state?.token },
                                  body: JSON.stringify({ productId: p.id, quantity: 1 })
                                }).then(r => r.json()).then(d => {
                                  if (d.success) { btn.textContent = '✓ დამატდა'; btn.style.background = '#16a34a'; btn.style.opacity = '1'; }
                                  else { btn.textContent = 'კალათა'; btn.style.opacity = '1'; }
                                });
                              }} style={{ fontSize: '12px', background: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                კალათა
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {msg.products.length > 5 && (
                        <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', paddingTop: '2px' }}>+ კიდევ {msg.products.length - 5} შედეგი</p>
                      )}
                    </div>
                  )}
                  {msg.referenceData && msg.referenceData.codes && msg.referenceData.codes.length > 0 && (
                    <div style={{ marginTop: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8' }}>📋 OEM რეფერენსი{msg.referenceData.generation ? ' · ' + msg.referenceData.generation.toUpperCase() : ''}</span>
                        {msg.referenceData.capacity && <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '1px 8px', borderRadius: '20px' }}>⛽ {msg.referenceData.capacity}</span>}
                      </div>
                      {msg.referenceData.note && <p style={{ fontSize: '10px', color: '#92400e', marginBottom: '5px' }}>⚠️ {msg.referenceData.note}</p>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {msg.referenceData.codes.slice(0, 5).map((item: any, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                            <span style={{ color: '#475569', minWidth: '80px', fontSize: '10px' }}>{item.brand}</span>
                            <button onMouseEnter={() => loadCompat(item.code)} onClick={() => { copyCode(item.code); setInput(item.code); setTimeout(()=>send(),100); }} style={{ fontFamily: "monospace", color: "#1d4ed8", background: "#fff", border: "1px solid #bfdbfe", borderRadius: "4px", padding: "1px 6px", cursor: "pointer", fontSize: "11px" }} title="კოდით ძებნა">{copiedCode === item.code ? '✅' : '🔍'} {item.code}</button>{compatData[item.code]?.length > 0 && <span style={{fontSize:"9px",color:"#94a3b8",marginLeft:"4px"}}>✓ {compatData[item.code].map((c:any)=>c.make+' '+c.model).slice(0,2).join(', ')}</span>}
                            <span style={{ color: '#94a3b8', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => { const codes = msg.referenceData?.codes || []; const all = codes.map((c: any) => c.brand + ": " + c.code).join("\n"); navigator.clipboard.writeText(all); }} style={{ marginTop: "6px", fontSize: "10px", color: "#1d4ed8", background: "transparent", border: "none", cursor: "pointer", padding: "0" }}>📋 ყველა კოდის კოპირება</button>
                    </div>
                  )}
                  {(msg.referenceData as any)?.crossRef && (msg.referenceData as any).crossRef.length > 0 && (
                      <div style={{ marginTop: "8px", borderTop: "1px solid #bfdbfe", paddingTop: "6px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#1d4ed8" }}>🔄 ანალოგები</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                          {(msg.referenceData as any).crossRef.slice(0, 6).map((item: any, i: number) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", background: "#f8fafc", borderRadius: "8px", padding: "4px 8px" }}>
                              {item.image && <img src={item.image} alt={item.nameEn||item.desc} style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px", background: "#fff", border: "1px solid #e2e8f0" }} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "11px" }}>{item.nameEn || item.desc}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                  <span style={{ color: "#64748b", fontSize: "10px" }}>{item.brand}</span>
                                  <button onMouseEnter={() => loadCompat(item.code)} onClick={() => { copyCode(item.code); setInput(item.code); setTimeout(()=>send(),100); }} style={{ fontFamily: "monospace", color: "#1d4ed8", background: "#fff", border: "1px solid #bfdbfe", borderRadius: "4px", padding: "1px 6px", cursor: "pointer", fontSize: "10px" }} title="კოდით ძებნა">{copiedCode === item.code ? '✅' : '🔍'} {item.code}</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {msg.bundleData && (
                    <div style={{ marginTop: "8px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "10px", padding: "10px 12px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 500, margin: "0 0 8px", color: "var(--color-text-primary)" }}>🛒 {msg.bundleData.kit} — კომპლექტი</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {msg.bundleData.parts.map((part: string, i: number) => {
                          const found = msg.bundleData!.bundleProducts.find((b: any) => b.partType === part);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-background-primary)", borderRadius: "8px", padding: "6px 10px", border: "0.5px solid var(--color-border-tertiary)" }}>
                              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{part}</span>
                              {found ? (
                                <button onClick={() => window.open(`/products/${found.product.id}`, '_blank')} style={{ fontSize: "11px", background: "var(--color-background-success)", color: "var(--color-text-success)", border: "none", borderRadius: "6px", padding: "3px 8px", cursor: "pointer", fontWeight: 500 }}>
                                  ✅ {found.product.price}₾
                                </button>
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>არ გვაქვს</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {msg.serviceMessage && (
                    <div style={{ marginTop: "8px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "10px", padding: "12px 14px" }}>
                      <pre style={{ fontSize: "12px", color: "var(--color-text-primary)", margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", lineHeight: "1.6" }}>{msg.serviceMessage}</pre>
                    </div>
                  )}
                  {msg.confidence && msg.confidence > 0 && (
                    <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 500,
                        background: msg.fitmentRisk === 'low' ? "var(--color-background-success)" : msg.fitmentRisk === 'medium' ? "var(--color-background-warning)" : "var(--color-background-danger)",
                        color: msg.fitmentRisk === 'low' ? "var(--color-text-success)" : msg.fitmentRisk === 'medium' ? "var(--color-text-warning)" : "var(--color-text-danger)"
                      }}>
                        {msg.fitmentRisk === 'low' ? '✓' : '⚠'} სანდოობა {msg.confidence}%
                      </div>
                      {msg.fitmentRisk === 'high' && <span style={{ fontSize: "10px", color: "var(--color-text-warning)" }}>VIN შემოწმება რეკომენდებულია</span>}
                    </div>
                  )}
                  {msg.explanation && (
                    <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>ℹ️</span>
                      <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>{msg.explanation}</span>
                    </div>
                  )}
                  {msg.relatedParts && msg.relatedParts.length > 0 && (
                    <div style={{ marginTop: "8px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "10px", padding: "8px 12px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>ასევე შეამოწმეთ:</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {msg.relatedParts.map((r: any, i: number) => (
                          <button key={i} onClick={() => { setInput(r.part); setTimeout(()=>send(),100); }} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "20px", border: "0.5px solid var(--color-border-secondary)", background: r.relation==="required" ? "var(--color-background-danger)" : "var(--color-background-primary)", color: r.relation==="required" ? "var(--color-text-danger)" : "var(--color-text-secondary)", cursor: "pointer" }} title={r.reason||''}>
                            {r.relation==="required" ? "⚠️ " : r.relation==="recommended" ? "✓ " : "○ "}{r.part}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {msg.leadData && <LeadCaptureForm leadData={msg.leadData} />}
                  {msg.oemHint && (
                    <div style={{ marginTop: "8px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {msg.oemHint.image && <img src={msg.oemHint.image} alt="" style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px", flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", margin: "0 0 2px" }}>ორიგინალი კოდი</p>
                          <p style={{ fontSize: "13px", fontWeight: 500, fontFamily: "monospace", margin: 0, color: "var(--color-text-primary)" }}>{msg.oemHint.code}</p>
                        </div>
                      </div>
                      <a href="https://wa.me/995577575052" target="_blank" rel="noreferrer" style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "8px", padding: "7px 10px", textDecoration: "none", color: "var(--color-text-primary)", fontSize: "12px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.522 5.84L.057 23.882l6.198-1.424A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.68.845.879-3.566-.234-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                        შეგვიკვეთეთ ეს კოდი
                      </a>
                    </div>
                  )}
                  {msg.autodocResults && msg.autodocResults.articles.length > 0 && (
                    <div style={{ marginTop: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>🌐 Autodoc — {msg.autodocResults.categoryEn}</span>
                        <span style={{ fontSize: "10px", color: "#16a34a", background: "#dcfce7", padding: "1px 8px", borderRadius: "20px" }}>{msg.autodocResults.count} ვარიანტი</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        {msg.autodocResults.articles.slice(0, 8).map((item: any, i: number) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                            {item.image && <img src={item.image} alt="" style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "3px" }} />}
                            <span style={{ color: "#475569", minWidth: "80px", fontSize: "10px" }}>{item.brand}</span>
                            <button onClick={() => { copyCode(item.code); setInput(item.code); setTimeout(()=>send(),100); }} style={{ fontFamily: "monospace", color: "#16a34a", background: "#fff", border: "1px solid #bbf7d0", borderRadius: "4px", padding: "1px 6px", cursor: "pointer", fontSize: "11px" }} title="კოდით ძებნა">{copiedCode === item.code ? '✅' : '🔍'} {item.code}</button>
                            <span style={{ color: "#94a3b8", fontSize: "10px" }}>{item.desc?.slice(0,35)}</span>
                            {item.inStock && (
                              <button onClick={() => window.open(`/products/${item.inStock.id}`, '_blank')} style={{ fontSize: "10px", background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "4px", padding: "1px 6px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                                ✅ {item.inStock.price}₾
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px 14px 14px 4px', padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }} className="flex gap-2 items-center shrink-0">
            <label className="cursor-pointer flex items-center justify-center shrink-0" title="ტექპასპორტის სკანირება"
              style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b', background: '#f8fafc' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setLoading(true);
                setMessages(prev => [...prev, { role: 'user', text: 'ტექპასპორტის ფოტო — VIN ვეძებ...' }]);
                const reader = new FileReader();
                reader.onload = async () => {
                  const base64 = (reader.result as string).split(',')[1];
                  try {
                    const { data } = await axios.post('/api/ai/scan', { image: base64, mimeType: file.type });
                    if (data.type === 'part') {
                      const products = data.products || [];
                      setMessages(prev => [...prev, { role: 'assistant', text: products.length > 0 ? `ვიცანი: ${data.part?.part_ka || data.part?.part_en} — ${products.length} შედეგი:` : `ვიცანი: ${data.part?.part_ka || data.part?.part_en} — სტოკში არ არის`, products }]);
                    } else if (data.vin) {
                      const v = data.vehicle || {}; const carInfo = `🚗 ${v.year||''} ${v.make||v.brand||''} ${v.model||''}${v.engine ? ' · '+v.engine : ''}${v.capacity ? ' · '+v.capacity+'cc' : ''}${v.fuel ? ' · '+v.fuel : ''}`.trim(); if (v.make) { setVehicle({ brand: v.make, model: v.model, year: v.year, engine: v.engine }); } setMessages(prev => [...prev, { role: 'assistant', text: `VIN: ${data.vin}\n${carInfo}\n\nმანქანა დამახსოვრდა — ახლა მიუთითეთ საჭირო ნაწილი.` }]);
                    } else if (data.error) {
                      setMessages(prev => [...prev, { role: 'assistant', text: data.error }]);
                    }
                  } catch {
                    setMessages(prev => [...prev, { role: 'assistant', text: 'შეცდომა სურათის დამუშავებისას.' }]);
                  } finally { setLoading(false); }
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }} />
            </label>

            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={placeholderVisible ? PLACEHOLDERS[placeholderIdx] : ''}
              className="flex-1 focus:outline-none"
              style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '13px' }}
            />

            <button onClick={startVoice} className="shrink-0 flex items-center justify-center"
              style={{ width: '38px', height: '38px', borderRadius: '10px', background: isListening ? '#ef4444' : '#f1f5f9', color: isListening ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
              title="ხმოვანი ძებნა">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
              </svg>
            </button>

            <button onClick={send} disabled={loading || !input.trim()} className="send-btn shrink-0 flex items-center justify-center"
              style={{ width: '38px', height: '38px', borderRadius: '10px', background: input.trim() ? '#0f172a' : '#e2e8f0', color: input.trim() ? '#f8fafc' : '#94a3b8', border: 'none', cursor: input.trim() ? 'pointer' : 'default' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
