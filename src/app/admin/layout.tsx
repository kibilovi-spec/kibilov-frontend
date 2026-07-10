'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (user === null) {
      router.replace('/');
    } else if (user && user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, initialized]);

  if (!initialized) return null;
  if (!user || user.role !== 'ADMIN') return null;

  return <>{children}</>;
}
