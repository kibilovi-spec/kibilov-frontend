'use client';
import dynamic from 'next/dynamic';
const AdminDashboard = dynamic(()=>import('@/components/admin/AdminDashboard').then(m=>({default:m.AdminDashboard})),{ssr:false});
export default function Page(){return<AdminDashboard/>;}
