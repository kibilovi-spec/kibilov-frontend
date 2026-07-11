'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store';

export default function SupplierPage() {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user) router.replace('/supplier/dashboard');
    else router.replace('/supplier/register');
  }, [user]);
  return null;
}
