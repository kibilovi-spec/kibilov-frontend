'use client';
import Link from 'next/link';
import { useLang } from '@/store';

export function Footer() {
  const { lang } = useLang();

  return (
    <footer className="bg-dark text-white mt-16">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">K</div>
              <div>
                <div className="font-black text-white text-base">KIBILOV</div>
                <div className="text-[10px] text-white/40 tracking-widest">AUTOPARTS</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {lang==='en'?'Auto parts for all brands. Fast delivery across Georgia.':
               lang==='ru'?'Автозапчасти для всех марок. Быстрая доставка по Грузии.':
               'ავტონაწილები ყველა მარკისთვის. სწრაფი მიტანა საქართველოში.'}
            </p>
            <div className="flex gap-2 mt-4">
              <span className="bg-white/10 px-3 py-1 rounded-lg text-xs text-white/60">BOG</span>
              <span className="bg-white/10 px-3 py-1 rounded-lg text-xs text-white/60">TBC</span>
              <span className="bg-white/10 px-3 py-1 rounded-lg text-xs text-white/60">💵 ნაღდი</span>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {lang==='en'?'Catalog':lang==='ru'?'Каталог':'კატალოგი'}
            </h3>
            <ul className="space-y-2">
              {[
                { href:'/products', label:lang==='en'?'All Parts':lang==='ru'?'Все запчасти':'ყველა ნაწილი' },
                { href:'/products?badge=NEW', label:lang==='en'?'New Arrivals':lang==='ru'?'Новинки':'სიახლეები' },
                { href:'/products?badge=SALE', label:lang==='en'?'Sale':lang==='ru'?'Акции':'ფასდაკლება' },
                { href:'/products?inStock=true', label:lang==='en'?'In Stock':lang==='ru'?'В наличии':'მარაგშია' },
              ].map(n=>(
                <li key={n.href}>
                  <Link href={n.href} className="text-white/50 hover:text-white text-sm transition-colors">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {lang==='en'?'Information':lang==='ru'?'Информация':'ინფორმაცია'}
            </h3>
            <ul className="space-y-2">
              {[
                { href:'/orders', label:lang==='en'?'My Orders':lang==='ru'?'Мои заказы':'ჩემი შეკვეთები' },
                { href:'#delivery', label:lang==='en'?'Delivery':lang==='ru'?'Доставка':'მიტანა' },
                { href:'#contact', label:lang==='en'?'Contact':lang==='ru'?'Контакты':'კონტაქტი' },
              ].map(n=>(
                <li key={n.href}>
                  <Link href={n.href} className="text-white/50 hover:text-white text-sm transition-colors">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h3 className="font-semibold text-white mb-4">
              {lang==='en'?'Contact':lang==='ru'?'Контакты':'კონტაქტი'}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/60">
                <span>📞</span>
                <div>
                  <a href="tel:+995577575052" className="hover:text-white transition-colors">+995 577 575 052</a>
                  <div className="text-xs text-white/40 mt-0.5">WhatsApp</div>
                </div>
              </li>
              <li className="flex items-start gap-2 text-white/60">
                <span>📧</span>
                <a href="mailto:info@kibilov.ge" className="hover:text-white transition-colors">info@kibilov.ge</a>
              </li>
              <li className="flex items-start gap-2 text-white/60">
                <span>📍</span>
                <span>რუსთავი, საქართველო</span>
              </li>
              <li className="flex items-start gap-2 text-white/60">
                <span>🕐</span>
                <span>ორ–შაბ: 09:00–18:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-sm">© 2024 Kibilov AutoParts. All rights reserved.</p>
          <p className="text-white/20 text-xs">kibilov.ge</p>
        </div>
      </div>
    </footer>
  );
}