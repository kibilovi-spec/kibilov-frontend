'use client';
import { useEffect, useState } from 'react';
import { useAuth, useLang } from '@/store';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';

const STATUS_COLORS: Record<string,string> = {
  PENDING:'bg-yellow-100 text-yellow-800', CONFIRMED:'bg-blue-100 text-blue-800',
  PROCESSING:'bg-purple-100 text-purple-800', SHIPPED:'bg-indigo-100 text-indigo-800',
  DELIVERED:'bg-green-100 text-green-800', CANCELLED:'bg-red-100 text-red-800',
};
const STATUS_KA: Record<string,string> = {
  PENDING:'⏳ მოლოდინში', CONFIRMED:'✅ დადასტურდა', PROCESSING:'⚙️ მუშავდება',
  SHIPPED:'🚚 გზაშია', DELIVERED:'🎉 მიღებულია', CANCELLED:'❌ გაუქმდა',
};
const STATUS_EN: Record<string,string> = {
  PENDING:'Pending', CONFIRMED:'Confirmed', PROCESSING:'Processing',
  SHIPPED:'Shipped', DELIVERED:'Delivered', CANCELLED:'Cancelled',
};
const STATUS_RU: Record<string,string> = {
  PENDING:'Ожидает', CONFIRMED:'Подтверждён', PROCESSING:'Обрабатывается',
  SHIPPED:'Отправлен', DELIVERED:'Доставлен', CANCELLED:'Отменён',
};

export function OrdersPage() {
  usePageTitle('ჩემი შეკვეთები | kibilov.ge');
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT(lang);
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string|null>(null);

  const STATUS_LABEL = lang==='en'?STATUS_EN:lang==='ru'?STATUS_RU:STATUS_KA;

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    api.get('/api/orders').then(r => setOrders(r.data.data || r.data.orders || [])).finally(()=>setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="page-container py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!orders.length) return (
    <div className="page-container py-16 text-center">
      <div className="text-6xl mb-4">📦</div>
      <h2 className="text-2xl font-bold text-dark mb-2">
        {lang==='en'?'No orders yet':lang==='ru'?'Заказов пока нет':'შეკვეთები არ გაქვს'}
      </h2>
      <p className="text-text3 mb-6">{lang==='en'?'Start shopping!':lang==='ru'?'Начните покупки!':'დაიწყე შოპინგი!'}</p>
      <Link href="/products" className="btn-primary px-8">{t.shop||'პროდუქტები'}</Link>
    </div>
  );

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-dark mb-6">
        {lang==='en'?'My Orders':lang==='ru'?'Мои заказы':'ჩემი შეკვეთები'}
      </h1>

      <div className="space-y-4">
        {orders.map(order => {
          const isOpen = selected===order.id;
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-1 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <button className="w-full p-4 flex items-center justify-between flex-wrap gap-3 text-left"
                onClick={()=>setSelected(isOpen?null:order.id)}>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-text3">#{order.id.slice(-6).toUpperCase()}</div>
                    <div className="font-bold text-dark text-lg">{order.total} ₾</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-text3">{new Date(order.createdAt).toLocaleDateString('ka-GE')}</div>
                    <div className="text-xs font-medium text-text2">{order.paymentMethod}</div>
                  </div>
                  <span className="text-text3">{isOpen?'▲':'▼'}</span>
                </div>
              </button>

              {/* Progress */}
              {order.status !== 'CANCELLED' && (
                <div className="px-4 pb-2">
                  <div className="flex gap-1">
                    {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'].map(s=>{
                      const idx = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'].indexOf(order.status);
                      const tIdx = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'].indexOf(s);
                      return <div key={s} className={`flex-1 h-1.5 rounded-full ${tIdx<=idx?'bg-primary':'bg-gray-2'}`}/>;
                    })}
                  </div>
                </div>
              )}

              {/* Items preview */}
              <div className="px-4 pb-4 flex items-center gap-2 overflow-x-auto">
                {order.items?.slice(0,4).map((item:any)=>(
                  <div key={item.id} className="flex items-center gap-2 bg-gray-bg rounded-lg px-3 py-1.5 whitespace-nowrap text-xs shrink-0">
                    {item.product?.images?.[0] && <img src={item.product.images[0]} className="w-6 h-6 object-cover rounded" alt=""/>}
                    <span className="text-text2 max-w-[100px] truncate">{item.product?.nameKa}</span>
                    <span className="font-semibold">×{item.quantity}</span>
                  </div>
                ))}
                {(order.items?.length||0)>4 && <div className="text-xs text-text3">+{order.items.length-4}</div>}
              </div>

              {/* Detail */}
              {isOpen && (
                <div className="border-t border-gray-1 p-4 space-y-4 bg-gray-bg/30">
                  <div className="space-y-2">
                    {order.items?.map((item:any)=>(
                      <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                        {item.product?.images?.[0] && <img src={item.product.images[0]} className="w-12 h-12 object-cover rounded-lg" alt=""/>}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.product?.nameKa}</div>
                          <div className="text-xs text-text3">SKU: {item.product?.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{(item.price*item.quantity).toFixed(2)} ₾</div>
                          <div className="text-xs text-text3">{item.price} ₾ × {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-text2">პროდუქტები</span><span>{(order.total-order.deliveryFee).toFixed(2)} ₾</span></div>
                    <div className="flex justify-between"><span className="text-text2">მიტანა ({order.deliveryZone})</span>
                      <span>{order.deliveryFee===0?<span className="text-green-600">უფასო</span>:`${order.deliveryFee} ₾`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-dark pt-2 border-t border-gray-1">
                      <span>სულ</span><span className="text-primary">{order.total} ₾</span>
                    </div>
                  </div>

                  {order.address && (
                    <div className="bg-white rounded-xl p-4 text-sm">
                      <div className="text-xs text-text3 mb-1">📍 მისამართი</div>
                      <div className="font-medium">{order.address.city}, {order.address.street}, {order.address.apartment}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
