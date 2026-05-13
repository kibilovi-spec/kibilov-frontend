'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

const ZONE_LABELS: Record<string,string> = {
  RUSTAVI:'რუსთავი', TBILISI:'თბილისი', MTSKHETA:'მცხეთა', OTHER:'სხვა',
};

export function AdminDelivery() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchZones = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/delivery/zones');
      setZones(r.data || []);
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchZones(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/api/delivery/zones/${editing.zone}`, {
        fee: parseFloat(editing.fee),
        freeFrom: parseFloat(editing.freeFrom),
        enabled: editing.enabled,
      });
      setMsg('✅ შენახულია');
      setEditing(null);
      fetchZones();
    } catch { setMsg('❌ შეცდომა'); } finally { setSaving(false); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">🚚 მიტანის ზონები</h1>
        {msg && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">{msg}</div>}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>📝 ინფო:</strong> მიტანის საფასური და უფასო მიტანის ზღვარი ცვლილება ორივე პლატფორმაზე ასახავს (საიტი + ადმინი). FINA-ს პროდუქტები ავტომატურად სინქრდება 30 წუთში ერთხელ.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((z:any) => (
              <div key={z.zone} className={`bg-white rounded-xl p-5 shadow-sm border ${z.enabled ? 'border-gray-100' : 'border-red-200 opacity-60'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{ZONE_LABELS[z.zone]||z.zone}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${z.enabled?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                      {z.enabled?'✅ აქტიური':'❌ გამორთული'}
                    </span>
                  </div>
                  <button onClick={()=>setEditing({...z})} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
                    ✏️ რედ.
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-500">მიტანის ფასი</span>
                    <span className="font-bold">{z.fee}₾</span>
                  </div>
                  <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-500">უფასო მიტანა</span>
                    <span className="font-bold text-green-600">{z.freeFrom}₾+</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{ZONE_LABELS[editing.zone]||editing.zone} — რედ.</h3>
              <button onClick={()=>setEditing(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">მიტანის ფასი (₾)</label>
                <input type="number" min="0" step="0.5" value={editing.fee}
                  onChange={e=>setEditing({...editing,fee:e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">უფასო მიტანა (₾-დან)</label>
                <input type="number" min="0" step="5" value={editing.freeFrom}
                  onChange={e=>setEditing({...editing,freeFrom:e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.enabled} onChange={e=>setEditing({...editing,enabled:e.target.checked})} className="rounded"/>
                <span className="text-sm">ზონა აქტიურია</span>
              </label>
              <div className="flex gap-2">
                <button onClick={()=>setEditing(null)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">გაუქმება</button>
                <button onClick={save} disabled={saving}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'ინახება...' : 'შენახვა'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
