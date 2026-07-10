'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (user === null) {
      router.replace('/supplier/register');
    }
  }, [user, initialized]);

  if (!initialized) return null;
  if (user === null) return null;

  return <>{children}</>;
}
