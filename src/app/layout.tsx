import type { Metadata } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';

const AppProviders = dynamic(() => import('@/components/layout/AppProviders').then(m=>({default:m.AppProviders})), { ssr: false });
const Header = dynamic(() => import('@/components/layout/Header').then(m=>({default:m.Header})), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer').then(m=>({default:m.Footer})), { ssr: false });

export const metadata: Metadata = {
  title: 'Kibilov AutoParts — ავტონაწილების ონლაინ მაღაზია',
  description: 'ავტონაწილები ყველა მარკისთვის. BOG, TBC გადახდა. სწრაფი მიტანა რუსთავი, თბილისი, მთელ საქართველოში.',
  keywords: 'ავტონაწილები, auto parts, автозапчасти, kibilov, რუსთავი, გეორგია',
  openGraph: {
    title: 'Kibilov AutoParts',
    description: 'ავტონაწილების ონლაინ მაღაზია',
    siteName: 'Kibilov AutoParts',
    locale: 'ka_GE',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AppProviders>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
