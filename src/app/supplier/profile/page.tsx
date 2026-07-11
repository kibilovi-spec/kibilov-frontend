import dynamic from 'next/dynamic';
const SupplierProfile = dynamic(() => import('@/components/pages/SupplierProfile').then(m => ({ default: m.SupplierProfilePage })), { ssr: false });
export default function Page() { return <SupplierProfile />; }
