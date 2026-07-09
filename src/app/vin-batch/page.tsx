'use client';
import { useState } from 'react';
import { useAuth } from '@/store';
import api from '@/lib/api';
import Link from 'next/link';

interface BatchResult {
  vin: string;
  vehicle?: { make: string | null; model: string | null; year: number | null; engine: string | null };
  vehicleId?: string | null;
  confidence?: number;
  error?: string;
}

export default function VinBatchPage() {
  const { user, initialized } = useAuth();
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const parseVins = (text: string): string[] => {
    const tokens = text.split(/[\s,;]+/).map(t => t.trim().toUpperCase()).filter(Boolean);
    return Array.from(new Set(tokens)).slice(0, 20);
  };

  const vinsPreview = parseVins(raw);
  const invalidCount = vinsPreview.filter(v => v.length !== 17).length;

  const handleSubmit = async () => {
    const vins = parseVins(raw);
    if (vins.length === 0) { setErrorMsg('შეიყვანეთ მინიმუმ ერთი VIN კოდი'); return; }
    setLoading(true); setErrorMsg(''); setResults([]);
    try {
      const r = await api.post('/api/vin/batch', { vins });
      setResults(r.data.decoded || []);
    } catch (e: any) {
      if (e?.response?.status === 429) {
        setErrorMsg('საათში მაქსიმუმ 10 batch მოთხოვნაა დაშვებული. სცადეთ მოგვიანებით.');
      } else {
        setErrorMsg(e?.response?.data?.error || 'შეცდომა მოხდა, სცადეთ თავიდან');
      }
    }
    setLoading(false);
  };

  if (!initialized) return null;
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="text-2xl mb-3">🔒</p>
        <h1 className="text-lg font-bold text-gray-800 mb-2">საჭიროა ავტორიზაცია</h1>
        <p className="text-sm text-gray-500 mb-5">Batch VIN ძებნა ხელმისაწვდომია მხოლოდ რეგისტრირებული B2B მომხმარებლებისთვის.</p>
        <Link href="/auth" className="inline-block bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold">შესვლა / რეგისტრაცია</Link>
      </div>
    );
  }

  if (user.role !== 'ADMIN' && user.b2bStatus !== 'APPROVED') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="text-2xl mb-3">📋</p>
        <h1 className="text-lg font-bold text-gray-800 mb-2">B2B ფუნქციაა</h1>
        <p className="text-sm text-gray-500 mb-5">
          {user.b2bStatus === 'PENDING'
            ? 'თქვენი B2B განაცხადი განხილვის პროცესშია.'
            : 'Batch VIN ძებნა (20 VIN ერთდროულად) ხელმისაწვდომია მხოლოდ დადასტურებული B2B პარტნიორებისთვის.'}
        </p>
        {user.b2bStatus !== 'PENDING' && (
          <Link href="/profile" className="inline-block bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold">B2B სტატუსის მოთხოვნა</Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-xl font-bold text-gray-800">📋 Batch VIN ძებნა</h1>
        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">B2B</span>
      </div>
      <p className="text-sm text-gray-500 mb-5">შეიყვანეთ მაქსიმუმ 20 VIN კოდი — თითო ხაზზე ან მძიმით გამოყოფილი.</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder={'WDB2100481B237297\nWBAxxxxxxxxxxxxxx\n...'}
          rows={6}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm font-mono outline-none focus:border-blue-400"
        />
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className={invalidCount > 0 ? 'text-red-600' : 'text-gray-400'}>
            {vinsPreview.length}/20 VIN{invalidCount > 0 ? ` · ${invalidCount} არასწორი სიგრძის` : ''}
          </span>
        </div>
        {errorMsg && <p className="text-sm text-red-600 mt-2">{errorMsg}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading || vinsPreview.length === 0}
          className="w-full mt-3 bg-blue-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '⏳ მუშავდება...' : `🔍 ${vinsPreview.length || ''} VIN-ის ძებნა`}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {results.map((r, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-gray-400 truncate">{r.vin}</p>
                  {r.error ? (
                    <p className="text-sm text-red-600">{r.error}</p>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {r.vehicle?.make} {r.vehicle?.model} {r.vehicle?.year || ''}
                      {r.vehicle?.engine && <span className="text-gray-400 font-normal"> · {r.vehicle.engine}</span>}
                    </p>
                  )}
                </div>
                {!r.error && r.vehicleId ? (
                  <Link
                    href={`/vin?vehicleId=${r.vehicleId}&make=${encodeURIComponent(r.vehicle?.make || '')}&model=${encodeURIComponent(r.vehicle?.model || '')}&year=${r.vehicle?.year || ''}`}
                    className="shrink-0 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg px-3 py-1.5 whitespace-nowrap"
                  >
                    ნაწილები →
                  </Link>
                ) : !r.error ? (
                  <span className="shrink-0 text-[11px] text-gray-400">vehicleId ვერ მოიძებნა</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
