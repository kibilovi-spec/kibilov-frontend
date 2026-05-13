'use client';
import { openAuth } from '@/components/layout/Header';
import { useEffect } from 'react';
export default function AuthPage() {
  useEffect(()=>{ openAuth(); },[]);
  return <div className="py-24 text-center text-text3">Loading...</div>;
}
