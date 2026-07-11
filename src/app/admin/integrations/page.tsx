import dynamic from 'next/dynamic';
const AdminIntegrations = dynamic(() => import('@/components/admin/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })), { ssr: false });
export default function Page() { return <AdminIntegrations />; }
