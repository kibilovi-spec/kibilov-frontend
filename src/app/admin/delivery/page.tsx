'use client';
import dynamic from 'next/dynamic';
const AdminDelivery = dynamic(()=>import('@/components/admin/AdminDelivery').then(m=>({default:m.AdminDelivery})),{ssr:false});
export default function Page(){return<AdminDelivery/>;}
