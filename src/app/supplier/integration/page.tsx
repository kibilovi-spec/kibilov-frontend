import dynamic from 'next/dynamic';
const SupplierIntegrationPage = dynamic(() => import('@/components/pages/supplier').then(m => ({ default: m.SupplierIntegrationPage })), { ssr: false });
export default function Page() { return <SupplierIntegrationPage />; }
