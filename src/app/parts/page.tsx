import dynamic from 'next/dynamic';
const PartsFinderPage = dynamic(() => import('@/components/pages/PartsFinderPage'), { ssr: false });
export default function Page() { return <PartsFinderPage />; }
