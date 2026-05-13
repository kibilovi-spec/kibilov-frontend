'use client';
import dynamic from 'next/dynamic';
const CategoryPage = dynamic(() => import('@/components/pages/CategoryPage').then(m => ({ default: m.CategoryPage })), { ssr: false });
export default function Page() { return <CategoryPage />; }
