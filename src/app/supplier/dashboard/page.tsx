import dynamic from 'next/dynamic';
const SupplierDashboard = dynamic(() => import('@/components/pages/supplier').then(m => ({ default: m.SupplierDashboardPage })), { ssr: false });
export default function Page() { return <SupplierDashboard />; }
