'use client';
import dynamic from 'next/dynamic';
const OrdersPage = dynamic(()=>import('@/components/pages/OrdersPage').then(m=>({default:m.OrdersPage})),{ssr:false});
export default function Page(){return<OrdersPage/>;}
