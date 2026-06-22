'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('kibilov_sid');
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('kibilov_sid', sid);
  }
  return sid;
}

export function useVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    api.post('/api/analytics/visit', {
      sessionId,
      path: pathname,
      referrer: document.referrer || null,
    }).catch(() => {});
  }, [pathname]);
}
