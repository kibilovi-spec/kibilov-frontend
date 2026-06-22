'use client';
import { useEffect } from 'react';
import { useAuth } from '@/store';
import api from '@/lib/api';

export default function PushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    async function subscribe() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;

        const { data } = await api.get('/api/notifications/vapid-public-key');
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: data.publicKey
        });
        await api.post('/api/notifications/subscribe', { subscription: sub });
      } catch(e) { console.log('Push subscribe error:', e); }
    }

    if (Notification.permission === 'granted') {
      subscribe();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => { if (p === 'granted') subscribe(); });
    }
  }, [user]);

  return null;
}
