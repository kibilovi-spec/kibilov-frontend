import dynamic from 'next/dynamic';
const AdminPricePanel = dynamic(() => import('@/components/admin/AdminPricePanel').then(m => ({ default: m.AdminPricePanel })), { ssr: false });
export default function Page() { return <AdminPricePanel />; }
