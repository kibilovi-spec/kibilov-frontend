import dynamic from 'next/dynamic';
const AdminSupport = dynamic(() => import('@/components/admin/AdminSupport').then(m => ({ default: m.AdminSupport })), { ssr: false });
export default function Page() { return <AdminSupport />; }
