'use client';
import dynamic from 'next/dynamic';
const AdminUsers = dynamic(()=>import('@/components/admin/AdminUsers').then(m=>({default:m.AdminUsers})),{ssr:false});
export default function Page(){return<AdminUsers/>;}
