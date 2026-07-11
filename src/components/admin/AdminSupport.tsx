'use client';
import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

export function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<any>(null);

  useEffect(() => {
    api.get('/api/support/admin/tickets').then(r=>setTickets(r.data.data||[])).catch(()=>setTickets([])).finally(()=>setLoading(false));
  }, []);

  useEffect(() => {
    if (active) {
      api.get('/api/support/tickets/'+active.id).then(r=>{
        setMessages(r.data.data.messages||[]);
        setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),100);
      });
    }
  }, [active]);

  const sendReply = async () => {
    if (!reply.trim()||!active) return;
    try {
      await api.post('/api/support/tickets/'+active.id+'/reply', {message:reply});
      setReply('');
      const r = await api.get('/api/support/tickets/'+active.id);
      setMessages(r.data.data.messages||[]);
      setTickets(tickets.map((t:any)=>t.id===active.id?{...t,status:'IN_PROGRESS'}:t));
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),100);
    } catch(e:any){alert(e.response?.data?.error||'შეცდომა');}
  };

  const resolve = async (id: string) => {
    await api.patch('/api/support/admin/tickets/'+id+'/resolve');
    setTickets(tickets.map((t:any)=>t.id===id?{...t,status:'RESOLVED'}:t));
    if (active?.id===id) setActive({...active,status:'RESOLVED'});
  };

  const sc: any = {OPEN:'bg-yellow-100 text-yellow-700',IN_PROGRESS:'bg-blue-100 text-blue-700',RESOLVED:'bg-green-100 text-green-700'};
  const sl: any = {OPEN:'ღია',IN_PROGRESS:'განხილვაში',RESOLVED:'დახურული'};
  const openCount = tickets.filter(t=>t.status==='OPEN').length;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">💬 მხარდაჭერა {openCount>0&&<span className="ml-2 bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">{openCount}</span>}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading?<div className="p-8 text-center text-gray-400">იტვირთება...</div>
            :tickets.length===0?<div className="p-8 text-center text-gray-400">ტიკეტები არ არის</div>
            :tickets.map((t:any)=>(
              <button key={t.id} onClick={()=>setActive(t)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${active?.id===t.id?'bg-blue-50':''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800 truncate">{t.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${sc[t.status]}`}>{sl[t.status]}</span>
                </div>
                <p className="text-xs text-blue-600 font-medium">{t.companyName}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{t.lastMessage||'—'}</p>
              </button>
            ))}
          </div>
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style={{minHeight:'500px'}}>
            {active ? (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-800">{active.subject}</h2>
                    <p className="text-xs text-blue-600">{active.companyName}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sc[active.status]}`}>{sl[active.status]}</span>
                    {active.status!=='RESOLVED' && <button onClick={()=>resolve(active.id)} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200">✓ დახურვა</button>}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m:any)=>(
                    <div key={m.id} className={`flex ${m.isAdmin?'justify-end':'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${m.isAdmin?'bg-blue-600 text-white':'bg-gray-100 text-gray-800'}`}>
                        {!m.isAdmin && <p className="text-xs font-bold mb-1 text-gray-500">{m.senderName}</p>}
                        <p>{m.message}</p>
                        <p className={`text-xs mt-1 ${m.isAdmin?'text-blue-200':'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString('ka-GE',{hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef}/>
                </div>
                {active.status!=='RESOLVED' && (
                  <div className="p-4 border-t border-gray-100 flex gap-2">
                    <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="პასუხი..." value={reply} onChange={e=>setReply(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendReply()}/>
                    <button onClick={sendReply} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">➤</button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center"><div className="text-4xl mb-2">💬</div><p className="text-sm">ტიკეტი აირჩიეთ</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
