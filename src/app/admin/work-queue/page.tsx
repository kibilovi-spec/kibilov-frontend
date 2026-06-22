import dynamic from 'next/dynamic';
const AdminWorkQueue = dynamic(() => import('@/components/admin/AdminWorkQueue').then(m => ({ default: m.AdminWorkQueue })), { ssr: false });
export default function Page() { return <AdminWorkQueue />; }
