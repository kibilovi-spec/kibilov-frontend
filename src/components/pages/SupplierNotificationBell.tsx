'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export function SupplierNotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);
  const router = useRouter();

  const load = () => {
    api.get('/api/supplier/notifications').then(r => {
      setNotifications(r.data.data||[]);
      setUnread(r.data.unread||0);
    }).catch(()=>{});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // 30 წამში ერთხელ
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/api/supplier/notifications/read-all');
    setUnread(0);
    setNotifications(notifications.map(n=>({...n,isRead:true})));
  };

  const clickNotif = async (n: any) => {
    if (!n.isRead) {
      await api.patch(`/api/supplier/notifications/${n.id}/read`);
      setUnread(Math.max(0, unread-1));
      setNotifications(notifications.map(x=>x.id===n.id?{...x,isRead:true}:x));
    }
    if (n.url) { setOpen(false); router.push(n.url); }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff/60000);
    if (m < 1) return 'ახლახანს';
    if (m < 60) return `${m} წთ წინ`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h} სთ წინ`;
    return `${Math.floor(h/24)} დღე წინ`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={()=>setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition">
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden" style={{maxWidth:"calc(100vw - 2rem)"}}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">შეტყობინებები</h3>
            {unread > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">ყველა წაკითხული</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">შეტყობინებები არ არის</div>
            ) : notifications.map((n:any) => (
              <button key={n.id} onClick={()=>clickNotif(n)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.isRead?'bg-blue-50':''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!n.isRead?'text-gray-900':'text-gray-600'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"/>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
