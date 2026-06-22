'use client';
import { useEffect, useState } from 'react';
import { openAuth } from '@/components/layout/Header';

export default function AuthPage() {
  const [tried, setTried] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      openAuth();
      setTried(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="py-24 text-center text-gray-400">
      {!tried ? 'იტვირთება...' : ''}
    </div>
  );
}
