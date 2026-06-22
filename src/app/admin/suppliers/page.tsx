import dynamic from 'next/dynamic';
const AdminSuppliers = dynamic(() => import('@/components/admin/AdminSuppliers').then(m => ({ default: m.AdminSuppliers })), { ssr: false });
export default function Page() { return <AdminSuppliers />; }
