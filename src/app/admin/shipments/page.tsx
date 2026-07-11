'use client';
import dynamic from 'next/dynamic';
const AdminShipments = dynamic(()=>import('@/components/admin/AdminShipments').then(m=>({default:m.AdminShipments})),{ssr:false});
export default function Page(){return<AdminShipments/>;}
