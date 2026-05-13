'use client';
import dynamic from 'next/dynamic';
const AdminProducts = dynamic(()=>import('@/components/admin/AdminProducts').then(m=>({default:m.AdminProducts})),{ssr:false});
export default function Page(){return<AdminProducts/>;}
