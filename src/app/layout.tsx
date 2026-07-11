import { Noto_Sans_Georgian, Inter } from 'next/font/google';

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-georgian',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-inter',
});


import type { Metadata } from 'next';
import './globals.css';
import WhatsAppButton from '@/components/WhatsAppButton';
import VisitTracker from '@/components/VisitTracker';
import StructuredData from '@/components/StructuredData';
import PushNotifications from '@/components/PushNotifications';
import dynamic from 'next/dynamic';
import { AppProviders } from '@/components/layout/AppProviders';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
const AiChat = dynamic(() => import('@/components/AiChat'), { ssr: false });
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Kibilov AutoParts — ავტონაწილები საქართველოში | AI ძებნა',
  description: 'ავტონაწილები ყველა მარკისთვის — BMW, Mercedes, Toyota, VW, Opel და სხვა. AI ძებნა ქართულად. სწრაფი მიტანა თბილისი, რუსთავი, მთელ საქართველოში. VIN სკანირება, ტექპასპორტი.',
  keywords: 'ავტონაწილები, auto parts, автозапчасти, kibilov, კიბილოვი, რუსთავი, თბილისი, BMW ნაწილები, Mercedes ნაწილები, Toyota ნაწილები, სამუხრუჭე ხუნდი, ამორტიზატორი, ფილტრი, VIN',
  authors: [{ name: 'Kibilov AutoParts', url: 'https://kibilov.ge' }],
  creator: 'Kibilov AutoParts',
  publisher: 'Kibilov AutoParts',
  metadataBase: new URL('https://kibilov.ge'),
  alternates: { canonical: 'https://kibilov.ge' },
  openGraph: {
    title: 'Kibilov AutoParts — ავტონაწილები საქართველოში',
    description: 'AI ძებნა ქართულად. BMW, Mercedes, Toyota და 30+ მარკა. VIN სკანირება.',
    siteName: 'Kibilov AutoParts',
    locale: 'ka_GE',
    type: 'website',
    url: 'https://kibilov.ge',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Kibilov AutoParts' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kibilov AutoParts — ავტონაწილები საქართველოში',
    description: 'AI ძებნა ქართულად. BMW, Mercedes, Toyota და 30+ მარკა.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: '7BJHEitpkS6a7Y3Tgvml_6iNf5AOLFuTQsf7qCIIamY' },
  other: { google: 'notranslate' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" translate="no" className="notranslate">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-CCC2BZ35K5"></script>
        <script dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CCC2BZ35K5');
        `}} />

        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/_next/static/media/e4af272ccee01ff0-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/_next/static/media/a6c4972a91679e5a-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fsn1.your-objectstorage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fsn1.your-objectstorage.com" />
        <link rel="dns-prefetch" href="https://o4511590646415360.ingest.de.sentry.io" />
      </head>
      <body className={`${notoSansGeorgian.variable} ${inter.variable}`} translate="no">
        <AppProviders>
          <Header />
          <main className="min-h-screen pb-16 md:pb-0" style={{overflowX:"hidden"}}>{children}
        <WhatsAppButton />
        <VisitTracker />
        <StructuredData />
        <PushNotifications /></main>
          <BottomNav />
          <Footer />
          <MobileNav />
        </AppProviders>
      </body>
    </html>
  );
}
