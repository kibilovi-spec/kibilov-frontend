import dynamic from 'next/dynamic';
const SupplierShipments = dynamic(() => import('@/components/pages/supplier').then(m => ({ default: m.SupplierShipmentsPage })), { ssr: false });
export default function Page() { return <SupplierShipments />; }
