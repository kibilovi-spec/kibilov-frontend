import dynamic from 'next/dynamic';
const AdminAuditLog = dynamic(() => import('@/components/admin/AdminAuditLog'), { ssr: false });
export default function Page() { return <AdminAuditLog />; }
