'use client';
import { useEffect } from 'react';
import { useAuth, useCart } from '@/store';
import { Toaster } from 'react-hot-toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuth();
  const { fetchCart } = useCart();

  useEffect(() => {
    fetchMe().then(() => fetchCart());
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, Noto Sans Georgian, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#16A34A', secondary: '#fff' }},
          error: { iconTheme: { primary: '#D32F2F', secondary: '#fff' }},
        }}
      />
    </>
  );
}
