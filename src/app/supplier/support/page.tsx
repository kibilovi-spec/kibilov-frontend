import dynamic from 'next/dynamic';
const SupplierSupport = dynamic(() => import('@/components/pages/SupplierSupport').then(m => ({ default: m.SupplierSupportPage })), { ssr: false });
export default function Page() { return <SupplierSupport />; }
