'use client';
import dynamic from 'next/dynamic';
const AdminOrders = dynamic(()=>import('@/components/admin/AdminOrders').then(m=>({default:m.AdminOrders})),{ssr:false});
export default function Page(){return<AdminOrders/>;}
