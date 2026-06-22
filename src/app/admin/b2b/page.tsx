import dynamic from 'next/dynamic';
const AdminB2B = dynamic(() => import('@/components/admin/AdminB2B').then(m => ({ default: m.AdminB2B })), { ssr: false });
export default function Page() { return <AdminB2B />; }
