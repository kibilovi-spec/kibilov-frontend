'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useLang } from '@/store';

export function SupplierSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<any>(null);
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;

  useEffect(() => {
    api.get('/api/support/tickets').then(r => setTickets(r.data.data||[])).finally(()=>setLoading(false));
  }, []);

  useEffect(() => {
    if (active) {
      api.get('/api/support/tickets/'+active.id).then(r => {
        setMessages(r.data.data.messages||[]);
        setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 100);
      });
    }
  }, [active]);

  const createTicket = async () => {
    if (!newSubject||!newMsg) return;
    try {
      const r = await api.post('/api/support/tickets', {subject:newSubject, message:newMsg});
      const t = r.data.data;
      setTickets([t,...tickets]);
      setCreating(false); setNewSubject(''); setNewMsg('');
      setActive(t);
    } catch(e:any){alert(e.response?.data?.error||'შეცდომა');}
  };

  const sendReply = async () => {
    if (!reply.trim()||!active) return;
    try {
      await api.post('/api/support/tickets/'+active.id+'/reply', {message:reply});
      setReply('');
      const r = await api.get('/api/support/tickets/'+active.id);
      setMessages(r.data.data.messages||[]);
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 100);
    } catch(e:any){alert(e.response?.data?.error||'შეცდომა');}
  };

  const sc: any = {OPEN:'bg-yellow-100 text-yellow-700',IN_PROGRESS:'bg-blue-100 text-blue-700',RESOLVED:'bg-green-100 text-green-700'};
  const sl: any = {OPEN:t('ღია','Open','Открыт'),IN_PROGRESS:t('განხილვაში','In Progress','В обработке'),RESOLVED:t('დახურული','Resolved','Закрыт')};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">💬 მხარდაჭერა</h1>
          <button onClick={()=>{setCreating(true);setActive(null);}} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">+ ახალი შეკითხვა</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ticket list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? <div className="p-8 text-center text-gray-400">იტვირთება...</div>
            : tickets.length===0 ? <div className="p-8 text-center text-gray-400">შეკითხვები არ არის</div>
            : tickets.map((t:any)=>(
              <button key={t.id} onClick={()=>{setActive(t);setCreating(false);}}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${active?.id===t.id?'bg-blue-50':''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800 truncate">{t.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${sc[t.status]}`}>{sl[t.status]}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{t.lastMessage||'—'}</p>
              </button>
            ))}
          </div>

          {/* Chat / New ticket */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{minHeight:'500px'}}>
            {creating ? (
              <div className="p-6 space-y-4">
                <h2 className="font-bold text-gray-800">ახალი შეკითხვა</h2>
                <input className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full" placeholder={t('თემა *','Subject *','Тема *')} value={newSubject} onChange={e=>setNewSubject(e.target.value)}/>
                <textarea className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full" placeholder={t('შეტყობინება *','Message *','Сообщение *')} rows={5} value={newMsg} onChange={e=>setNewMsg(e.target.value)}/>
                <div className="flex gap-3">
                  <button onClick={createTicket} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold">გაგზავნა</button>
                  <button onClick={()=>setCreating(false)} className="border border-gray-200 px-6 py-2 rounded-xl text-sm">გაუქმება</button>
                </div>
              </div>
            ) : active ? (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-800">{active.subject}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc[active.status]}`}>{sl[active.status]}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m:any)=>(
                    <div key={m.id} className={`flex ${m.isAdmin?'justify-start':'justify-end'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${m.isAdmin?'bg-gray-100 text-gray-800':'bg-blue-600 text-white'}`}>
                        {m.isAdmin && <p className="text-xs font-bold mb-1 text-blue-600">Kibilov Admin</p>}
                        <p>{m.message}</p>
                        <p className={`text-xs mt-1 ${m.isAdmin?'text-gray-400':'text-blue-200'}`}>{new Date(m.createdAt).toLocaleTimeString('ka-GE',{hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef}/>
                </div>
                {active.status!=='RESOLVED' && (
                  <div className="p-4 border-t border-gray-100 flex gap-2">
                    <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('შეტყობინება...','Message...','Сообщение...')} value={reply} onChange={e=>setReply(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendReply()}/>
                    <button onClick={sendReply} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">➤</button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-sm">ტიკეტი აირჩიეთ ან ახალი შექმენით</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
