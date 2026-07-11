'use client';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';

interface Garage {
  id: string;
  name: string;
  phone: string;
  garageCity: string | null;
  b2bTier: string | null;
}

const TIER_LABEL: Record<string, string> = {
  FOUNDING: '⭐ დამფუძნებელი პარტნიორი',
  HIGH_VALUE: '🏆 პრემიუმ პარტნიორი',
  STANDARD: 'პარტნიორი',
};

export default function FindMechanicPage() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/api/garages', { params: city ? { city } : {} })
      .then(r => setGarages(Array.isArray(r.data) ? r.data : []))
      .catch(() => setGarages([]))
      .finally(() => setLoading(false));
  }, [city]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    garages.forEach(g => { if (g.garageCity) set.add(g.garageCity); });
    return Array.from(set).sort();
  }, [garages]);

  const whatsappHref = (phone: string) => `https://wa.me/995${phone.replace(/\D/g, '').replace(/^0/, '')}`;
  const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🔧 იპოვე სანდო ხელოსანი</h1>
          <p className="text-gray-500 text-sm">Kibilov AutoParts-ის პარტნიორი სერვის-ცენტრები და ხელოსნები</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">ქალაქი:</span>
          <button onClick={() => setCity('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${city === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            ყველა
          </button>
          {cities.map(c => (
            <button key={c} onClick={() => setCity(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${city === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : garages.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">🔧</div>
            <p className="text-gray-500 mb-1">ჯერჯერობით პარტნიორი გარაჟები არ არის რეგისტრირებული</p>
            <p className="text-gray-400 text-sm">მალე დაემატება — თუ თქვენ ხართ სერვის-ცენტრი და გსურთ პარტნიორობა, დაგვიკავშირდით.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {garages.map(g => (
              <div key={g.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{g.name}</h3>
                    {g.b2bTier && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        {TIER_LABEL[g.b2bTier] || g.b2bTier}
                      </span>
                    )}
                  </div>
                  {g.garageCity && <p className="text-sm text-gray-500">📍 {g.garageCity}</p>}
                </div>
                <div className="flex gap-2">
                  <a href={telHref(g.phone)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                    📞 დარეკვა
                  </a>
                  <a href={whatsappHref(g.phone)} target="_blank" rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
