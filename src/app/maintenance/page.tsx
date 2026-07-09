'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  overdue: { color: '#dc2626', bg: '#fee2e2', label: '⚠️ ვადა გავიდა' },
  urgent:  { color: '#d97706', bg: '#fef3c7', label: '🔔 ამ კვირაში' },
  soon:    { color: '#2563eb', bg: '#eff6ff', label: '📅 ახლო მომავალში' },
  ok:      { color: '#16a34a', bg: '#dcfce7', label: '✅ კარგად' },
};

export default function MaintenancePage() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const [reminders, setReminders] = useState<any[]>([]);
  const [types, setTypes] = useState<Record<string, any>>({});
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    make: '', model: '', year: '', serviceType: 'oil_change',
    lastDone: new Date().toISOString().slice(0, 10),
    mileage: '', notes: '', vehicleId: ''
  });

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.push('/auth'); return; }
    Promise.all([
      api.get('/api/maintenance'),
      api.get('/api/maintenance/types'),
      api.get('/api/vehicles'),
    ]).then(([r, t, v]) => {
      setReminders(r.data.data || []);
      setTypes(t.data.data || {});
      setVehicles(v.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const selectVehicle = (vehicleId: string) => {
    const v = vehicles.find(v => v.id === vehicleId);
    if (v) setForm(prev => ({ ...prev, vehicleId, make: v.make, model: v.model, year: String(v.year) }));
  };

  const save = async () => {
    if (!form.make || !form.model || !form.serviceType || !form.lastDone)
      return toast.error('ყველა სავალდებულო ველი შეავსე');
    setSaving(true);
    try {
      const r = await api.post('/api/maintenance', form);
      setReminders(prev => [...prev, r.data.data].sort((a, b) => a.daysLeft - b.daysLeft));
      setForm({ make: '', model: '', year: '', serviceType: 'oil_change', lastDone: new Date().toISOString().slice(0, 10), mileage: '', notes: '', vehicleId: '' });
      setAdding(false);
      toast.success('🔧 Reminder შენახულია!');
    } catch(e: any) { toast.error(e.response?.data?.message || 'შეცდომა'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    await api.delete(`/api/maintenance/${id}`);
    setReminders(prev => prev.filter(r => r.id !== id));
    toast.success('წაიშალა');
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>🔧 იტვირთება...</div>;

  const overdue = reminders.filter(r => r.status === 'overdue' || r.status === 'urgent');

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>🔧 სერვის რემინდერები</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            {reminders.length} reminder · {overdue.length > 0 ? <span style={{ color: '#dc2626', fontWeight: 700 }}>{overdue.length} ვადაგადაცილებული</span> : <span style={{ color: '#16a34a' }}>ყველა კარგად</span>}
          </p>
        </div>
        <button onClick={() => setAdding(!adding)} style={{
          background: adding ? '#f1f5f9' : '#0f172a', color: adding ? '#0f172a' : '#fff',
          border: 'none', borderRadius: '10px', padding: '10px 18px',
          cursor: 'pointer', fontSize: '13px', fontWeight: 700
        }}>
          {adding ? '✕ გაუქმება' : '+ დამატება'}
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '16px', fontSize: '14px' }}>ახალი სერვის reminder</p>

          {vehicles.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>მანქანა გარაჟიდან</label>
              <select onChange={e => selectVehicle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px' }}>
                <option value="">-- აირჩიე მანქანა --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} {v.year}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {([['make','მარკა *'],['model','მოდელი *'],['year','წელი'],['mileage','გარბენი (კმ)']] as [string,string][]).map(([k,ph]) => (
              <input key={k} placeholder={ph} value={(form as any)[k]}
                onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px' }}
              />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>სერვის ტიპი *</label>
              <select value={form.serviceType} onChange={e => setForm(prev => ({ ...prev, serviceType: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px' }}>
                {Object.entries(types).map(([k, v]: [string, any]) => (
                  <option key={k} value={k}>{v.ka} ({v.intervalDays} დღე)</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>ბოლო სერვისი *</label>
              <input type="date" value={form.lastDone}
                onChange={e => setForm(prev => ({ ...prev, lastDone: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <input placeholder="შენიშვნა (არასავალდებულო)" value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', marginBottom: '12px', boxSizing: 'border-box' }}
          />

          {form.serviceType && types[form.serviceType] && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: '#1d4ed8' }}>
              ⏱ შემდეგი სერვისი: <strong>{types[form.serviceType].intervalDays} დღეში</strong>
              {types[form.serviceType].intervalKm && ` ან ${types[form.serviceType].intervalKm.toLocaleString()} კმ-ზე`}
            </div>
          )}

          <button onClick={save} disabled={saving} style={{
            width: '100%', background: saving ? '#94a3b8' : '#0f172a', color: '#fff',
            border: 'none', borderRadius: '10px', padding: '12px',
            cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px'
          }}>
            {saving ? '...' : '✅ შენახვა'}
          </button>
        </div>
      )}

      {/* Empty */}
      {reminders.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔧</div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>სერვის reminder არ გაქვს</div>
          <div style={{ fontSize: '13px' }}>დაამატე და დროულად მიიღებ შეხსენებას</div>
        </div>
      )}

      {/* Reminder List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reminders.map(r => {
          const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.ok;
          const svcName = types[r.serviceType]?.ka || r.serviceType;
          return (
            <div key={r.id} style={{
              background: '#fff', border: `1.5px solid ${r.status === 'overdue' ? '#fca5a5' : r.status === 'urgent' ? '#fcd34d' : '#e2e8f0'}`,
              borderRadius: '14px', padding: '18px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{r.make} {r.model} {r.year}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>🔧 {svcName}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    შემდეგი: <strong style={{ color: cfg.color }}>
                      {r.daysLeft < 0 ? `${Math.abs(r.daysLeft)} დღის წინ გავიდა` : r.daysLeft === 0 ? 'დღეს!' : `${r.daysLeft} დღეში`}
                    </strong>
                    {r.mileage && ` · გარბენი: ${parseInt(r.mileage).toLocaleString()} კმ`}
                  </div>
                  {r.notes && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>{r.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                  <a href={`/products?q=${encodeURIComponent(svcName)}`}
                    style={{ background: '#0f172a', color: '#fff', borderRadius: '8px', padding: '7px 12px', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>
                    ყიდვა
                  </a>
                  <button onClick={() => remove(r.id)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', fontSize: '13px' }}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
