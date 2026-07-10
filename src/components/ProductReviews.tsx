'use client';
import { useLang } from '@/store';
import { useState, useEffect } from 'react';
import { useAuth } from '@/store';
import api from '@/lib/api';

export default function ProductReviews({ productId }: { productId: string }) {
  const { lang } = useLang();
  const t = (ka:string,en:string,ru?:string) => lang==='en'?en:lang==='ru'?(ru||ka):ka;
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [average, setAverage] = useState('0');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await api.get(`/api/reviews/${productId}`);
      const d = r.data;
      if (d.success) { setReviews(d.data); setAverage(d.average); }
    } catch {}
  };

  useEffect(() => { load(); }, [productId]);

  const submit = async () => {
    if (!rating) return setMsg(t('რეიტინგი აირჩიე','Select rating','Выберите рейтинг'));
    setLoading(true);
    try {
      const r = await api.post(`/api/reviews/${productId}`, { rating, comment });
      const d = r.data;
      if (d.success) { setMsg(t('✅ შეფასება დაემატა','✅ Review added','✅ Отзыв добавлен')); setRating(0); setComment(''); load(); }
      else setMsg(d.error || t('შეცდომა','Error','Ошибка'));
    } catch { setMsg(t('შეცდომა','Error','Ошибка')); }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-extrabold text-gray-800">შეფასებები</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={s <= Math.round(parseFloat(average)) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            ))}
            <span className="text-sm text-gray-500 ml-1">{average} ({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 && <p className="text-gray-400 text-sm mb-4">შეფასება ჯერ არ არის</p>}

      <div className="space-y-3 mb-6">
        {reviews.map(r => (
          <div key={r.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-gray-700">{r.user?.name || t('მომხმარებელი','User','Пользователь')}</span>
              <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={s <= r.rating ? 'text-yellow-400 text-sm' : 'text-gray-200 text-sm'}>★</span>)}</div>
              <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('ka-GE')}</span>
            </div>
            {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
          </div>
        ))}
      </div>

      {user ? (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="font-bold text-sm text-gray-700 mb-2">შეაფასე პროდუქტი</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
                className={`text-2xl transition-transform hover:scale-110 ${s <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={t("კომენტარი (არასავალდებულო)","Comment (optional)","Комментарий (необязательно)")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-blue-400 mb-2" rows={2}/>
          {msg && <p className="text-xs mb-2 text-blue-600">{msg}</p>}
          <button onClick={submit} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
            {loading ? t('...','...','...') : t('გაგზავნა','Send','Отправить')}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">შეფასებისთვის <a href="/auth" className="text-blue-600 underline">შედი</a></p>
      )}
    </div>
  );
}
